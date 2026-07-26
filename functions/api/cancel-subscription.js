import { errorJson, isAdmin, requireUser, supabaseAdmin } from "../lib/auth.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function findSubscription(context, subscriptionId) {
  const response = await supabaseAdmin(
    context,
    `subscriptions?mp_subscription_id=eq.${encodeURIComponent(subscriptionId)}&select=id,user_id,mp_subscription_id,status&limit=1`
  );

  if (!response.ok) return null;
  const rows = await response.json();
  return rows?.[0] || null;
}

async function findBanner(context, bannerId) {
  const response = await supabaseAdmin(
    context,
    `banners?id=eq.${encodeURIComponent(bannerId)}&select=id,user_id,mp_subscription_id&limit=1`
  );

  if (!response.ok) return null;
  const rows = await response.json();
  return rows?.[0] || null;
}

export async function onRequestPost(context) {
  try {
    const auth = await requireUser(context);
    if (auth.response) return auth.response;

    if (!context.env.MP_ACCESS_TOKEN) {
      return errorJson("Falta configurar Mercado Pago en Cloudflare", 500);
    }

    const body = await context.request.json();
    const bannerId = String(body.banner_id || "").trim();
    let mpSubscriptionId = String(body.mp_subscription_id || "").trim();
    let banner = null;

    if (bannerId) {
      banner = await findBanner(context, bannerId);

      if (!banner) {
        return errorJson("No se encontró el banner", 404);
      }

      const admin = await isAdmin(context, auth.user.id);
      if (banner.user_id !== auth.user.id && !admin) {
        return errorJson("No tenés permiso para cancelar este banner", 403);
      }

      mpSubscriptionId = String(banner.mp_subscription_id || "").trim();
    }

    if (!mpSubscriptionId) {
      return errorJson("Falta mp_subscription_id", 400);
    }

    const subscription = banner
      ? null
      : await findSubscription(context, mpSubscriptionId);

    if (!banner && !subscription) {
      return errorJson("No se encontró la suscripción", 404);
    }

    if (subscription) {
      const admin = await isAdmin(context, auth.user.id);
      if (subscription.user_id !== auth.user.id && !admin) {
        return errorJson("No tenés permiso para cancelar esta suscripción", 403);
      }
    }

    const response = await fetch(
      `https://api.mercadopago.com/preapproval/${encodeURIComponent(mpSubscriptionId)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${context.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("MERCADO PAGO CANCEL ERROR", response.status, data);
      return errorJson("Mercado Pago no pudo cancelar la suscripción", 502);
    }

    if (banner) {
      await supabaseAdmin(
        context,
        `banners?id=eq.${encodeURIComponent(banner.id)}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            active: false,
            payment_status: "cancelled",
            cancelled_at: new Date().toISOString(),
          }),
        }
      );
    } else {
      await supabaseAdmin(
        context,
        `subscriptions?id=eq.${encodeURIComponent(subscription.id)}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          }),
        }
      );

      await Promise.all([
        supabaseAdmin(
          context,
          `profiles?id=eq.${encodeURIComponent(subscription.user_id)}`,
          {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({ plan: "free" }),
          }
        ),
        supabaseAdmin(
          context,
          `businesses?user_id=eq.${encodeURIComponent(subscription.user_id)}`,
          {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({ plan: "free" }),
          }
        ),
      ]);
    }

    return json({ success: true });
  } catch (error) {
    console.error("CANCEL SUBSCRIPTION ERROR", error);
    return errorJson(error?.message || "Error cancelando la suscripción", 500);
  }
}
