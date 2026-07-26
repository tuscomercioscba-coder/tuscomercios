import { errorJson, supabaseAdmin } from "../lib/auth.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function safeEqual(first, second) {
  if (first.length !== second.length) return false;
  let result = 0;
  for (let index = 0; index < first.length; index += 1) {
    result |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }
  return result === 0;
}

async function hmacSha256Hex(secret, value) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value)
  );
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifySignature(request, dataId, secret) {
  if (!secret) return false;

  const xSignature = request.headers.get("x-signature") || "";
  const requestId = request.headers.get("x-request-id") || "";
  const parts = Object.fromEntries(
    xSignature
      .split(",")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value)
  );

  const timestamp = parts.ts || "";
  const receivedHash = String(parts.v1 || "").toLowerCase();

  if (!timestamp || !receivedHash || !requestId || !dataId) return false;

  const rawTimestamp = Number(timestamp);
  const timestampMs =
    rawTimestamp > 1_000_000_000_000
      ? rawTimestamp
      : rawTimestamp * 1000;

  if (
    !Number.isFinite(timestampMs) ||
    Math.abs(Date.now() - timestampMs) > 15 * 60 * 1000
  ) {
    return false;
  }

  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${timestamp};`;
  const expectedHash = await hmacSha256Hex(secret, manifest);
  return safeEqual(expectedHash, receivedHash);
}

async function readPreapproval(context, id) {
  const response = await fetch(
    `https://api.mercadopago.com/preapproval/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${context.env.MP_ACCESS_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Mercado Pago no confirmó la suscripción");
  }

  return response.json();
}

function parseReference(reference) {
  const [type, value, userId] = String(reference || "").split(":");
  if (!["plan", "banner"].includes(type) || !value || !userId) return null;
  return { type, value, userId };
}

async function saveSubscription(context, preapproval, reference) {
  const payload = {
    user_id: reference.userId,
    plan: reference.value,
    status: preapproval.status || "pending",
    amount: Number(preapproval.auto_recurring?.transaction_amount || 0),
    payer_email: preapproval.payer_email || null,
    mp_subscription_id: preapproval.id,
  };

  const existingResponse = await supabaseAdmin(
    context,
    `subscriptions?mp_subscription_id=eq.${encodeURIComponent(preapproval.id)}&select=id&limit=1`
  );
  const existing = existingResponse.ok
    ? (await existingResponse.json())?.[0]
    : null;

  if (existing?.id) {
    await supabaseAdmin(
      context,
      `subscriptions?id=eq.${encodeURIComponent(existing.id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(payload),
      }
    );
  } else {
    await supabaseAdmin(context, "subscriptions", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(payload),
    });
  }

  const active = preapproval.status === "authorized";
  const nextPlan = active ? reference.value : "free";

  await Promise.all([
    supabaseAdmin(
      context,
      `profiles?id=eq.${encodeURIComponent(reference.userId)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ plan: nextPlan }),
      }
    ),
    supabaseAdmin(
      context,
      `businesses?user_id=eq.${encodeURIComponent(reference.userId)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ plan: nextPlan }),
      }
    ),
  ]);
}

async function saveBanner(context, preapproval, reference) {
  const active = preapproval.status === "authorized";
  const currentResponse = await supabaseAdmin(
    context,
    `banners?id=eq.${encodeURIComponent(reference.value)}&user_id=eq.${encodeURIComponent(reference.userId)}&select=id,payment_status,expires_at&limit=1`
  );
  const current = currentResponse.ok
    ? (await currentResponse.json())?.[0]
    : null;

  if (!current) {
    throw new Error("No se encontró el banner asociado");
  }

  const expiresAt = active && current.payment_status !== "approved"
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : current.expires_at || null;

  await supabaseAdmin(
    context,
    `banners?id=eq.${encodeURIComponent(reference.value)}&user_id=eq.${encodeURIComponent(reference.userId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        payment_status: active ? "approved" : preapproval.status || "pending",
        active,
        mp_subscription_id: preapproval.id,
        ...(expiresAt ? { expires_at: expiresAt } : {}),
      }),
    }
  );
}

export async function onRequestPost(context) {
  try {
    if (
      !context.env.MP_ACCESS_TOKEN ||
      !context.env.MP_WEBHOOK_SECRET
    ) {
      return errorJson("Falta configurar Mercado Pago", 500);
    }

    const url = new URL(context.request.url);
    const body = await context.request.clone().json().catch(() => ({}));
    const dataId = String(
      url.searchParams.get("data.id") ||
        url.searchParams.get("id") ||
        body?.data?.id ||
        ""
    );

    const validSignature = await verifySignature(
      context.request,
      dataId,
      context.env.MP_WEBHOOK_SECRET
    );

    if (!validSignature) {
      return errorJson("Firma de Mercado Pago inválida", 401);
    }

    const notificationType = String(
      url.searchParams.get("type") || body?.type || ""
    );

    if (
      notificationType &&
      !["subscription_preapproval", "preapproval"].includes(notificationType)
    ) {
      return json({ ok: true, ignored: true });
    }

    const preapproval = await readPreapproval(context, dataId);
    const reference = parseReference(preapproval.external_reference);

    if (!reference) {
      return errorJson("Referencia externa inválida", 400);
    }

    if (reference.type === "banner") {
      await saveBanner(context, preapproval, reference);
    } else {
      await saveSubscription(context, preapproval, reference);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("MERCADO PAGO WEBHOOK ERROR", error);
    return errorJson("No se pudo procesar la notificación", 500);
  }
}
