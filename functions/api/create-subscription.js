import { errorJson, requireUser, supabaseAdmin } from "../lib/auth.js";

const PLAN_PRICES = Object.freeze({
  standard: 19999,
  premium: 29999,
});

const BANNER_PRICE = 50000;
const ADMINISTRATION_PRICE = 24999;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function validateBanner(context, userId, bannerId) {
  if (!bannerId) return null;

  const response = await supabaseAdmin(
    context,
    `banners?id=eq.${encodeURIComponent(bannerId)}&user_id=eq.${encodeURIComponent(userId)}&select=id,user_id,payment_status,active&limit=1`
  );

  if (!response.ok) return null;
  const rows = await response.json();
  return rows?.[0] || null;
}

async function validateBusiness(context, userId, businessId) {
  if (!businessId) return null;
  const response = await supabaseAdmin(
    context,
    `businesses?id=eq.${encodeURIComponent(businessId)}&user_id=eq.${encodeURIComponent(userId)}&select=id,user_id,negocio&limit=1`
  );
  if (!response.ok) return null;
  return (await response.json())?.[0] || null;
}

async function validateCommercialCode(context, rawCode, purchaseType) {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) return null;

  const response = await supabaseAdmin(
    context,
    `commercial_codes?code=eq.${encodeURIComponent(code)}&active=eq.true&select=*&limit=1`
  );
  if (!response.ok) throw new Error("No se pudo validar el código");
  const record = (await response.json())?.[0];
  if (!record) throw new Error("El código no existe o está desactivado");
  if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
    throw new Error("El código está vencido");
  }
  if (!Array.isArray(record.applies_to) || !record.applies_to.includes(purchaseType)) {
    throw new Error("El código no corresponde a este servicio");
  }
  if (record.max_uses) {
    const usesResponse = await supabaseAdmin(
      context,
      `commercial_code_uses?code_id=eq.${encodeURIComponent(record.id)}&status=eq.authorized&select=id`
    );
    const uses = usesResponse.ok ? await usesResponse.json() : [];
    if (uses.length >= Number(record.max_uses)) throw new Error("El código alcanzó su límite de usos");
  }
  return record;
}

function discountedAmount(amount, code) {
  if (!code || code.code_type !== "discount") return amount;
  const value = Number(code.discount_value || 0);
  const result = code.discount_type === "percent"
    ? amount * (1 - Math.min(value, 100) / 100)
    : amount - value;
  return Math.max(100, Math.round(result));
}

export async function onRequestPost(context) {
  try {
    const auth = await requireUser(context);
    if (auth.response) return auth.response;

    if (!context.env.MP_ACCESS_TOKEN) {
      return errorJson("Falta configurar Mercado Pago en Cloudflare", 500);
    }

    const body = await context.request.json();
    const type = String(body.type || "plan").toLowerCase();

    let reason;
    let amount;
    let externalReference;
    let backUrl;
    let purchaseType;
    let businessIdForCode = null;

    if (type === "banner") {
      const bannerId = String(body.banner_id || "").trim();
      const banner = await validateBanner(context, auth.user.id, bannerId);

      if (!banner) {
        return errorJson("El banner no existe o no pertenece al usuario", 403);
      }

      if (banner.payment_status === "approved" || banner.active === true) {
        return errorJson("Este banner ya está activo", 409);
      }

      amount = BANNER_PRICE;
      purchaseType = "banner";
      reason = "Tus Comercios - Banner regional por 30 días";
      externalReference = `banner:${banner.id}:${auth.user.id}`;
      backUrl = `https://tuscomercios.com.ar/success?checkout=banner&banner_id=${encodeURIComponent(banner.id)}`;
    } else if (type === "administration") {
      const businessId = String(body.business_id || "").trim();
      const business = await validateBusiness(
        context,
        auth.user.id,
        businessId
      );
      if (!business) {
        return errorJson("El negocio no existe o no pertenece al usuario", 403);
      }
      amount = ADMINISTRATION_PRICE;
      purchaseType = "gestion";
      businessIdForCode = business.id;
      reason = "TusComercios Gestión";
      externalReference = `administration:${business.id}:${auth.user.id}`;
      backUrl =
        "https://tuscomercios.com.ar/administracion?checkout=administration";
    } else {
      const plan = String(body.plan || "").toLowerCase();
      amount = PLAN_PRICES[plan];

      if (!amount) {
        return errorJson("Plan inválido", 400);
      }

      reason = `Tus Comercios - Plan ${plan === "standard" ? "Estándar" : "Premium"}`;
      purchaseType = plan;
      externalReference = `plan:${plan}:${auth.user.id}`;
      backUrl = `https://tuscomercios.com.ar/success?checkout=plan&plan=${encodeURIComponent(plan)}`;
    }

    const originalAmount = amount;
    const commercialCode = purchaseType === "banner"
      ? null
      : await validateCommercialCode(context, body.code, purchaseType);
    amount = discountedAmount(amount, commercialCode);
    if (commercialCode) {
      externalReference += `:${commercialCode.id}`;
      reason += ` - Código ${commercialCode.code}`;
    }

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${context.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason,
        external_reference: externalReference,
        payer_email: auth.user.email,
        back_url: backUrl,
        notification_url:
          "https://tuscomercios.com.ar/api/mercadopago-webhook",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: amount,
          currency_id: "ARS",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("MERCADO PAGO CREATE ERROR", response.status, data);
      return errorJson("Mercado Pago no pudo crear la suscripción", 502);
    }

    if (!data?.init_point) {
      return errorJson("Mercado Pago no devolvió el enlace de pago", 502);
    }

    if (commercialCode) {
      const useResponse = await supabaseAdmin(context, "commercial_code_uses", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          code_id: commercialCode.id,
          user_id: auth.user.id,
          business_id: businessIdForCode,
          purchase_type: purchaseType,
          mp_subscription_id: data.id,
          original_amount: originalAmount,
          charged_amount: amount,
          status: "pending",
        }),
      });
      if (!useResponse.ok) console.error("No se pudo registrar el uso del código");
    }

    if (type === "banner") {
      const bannerId = externalReference.split(":")[1];

      await supabaseAdmin(
        context,
        `banners?id=eq.${encodeURIComponent(bannerId)}&user_id=eq.${encodeURIComponent(auth.user.id)}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            payment_status: "pending",
            mp_subscription_id: data.id,
          }),
        }
      );
    } else if (type === "administration") {
      const businessId = externalReference.split(":")[1];
      const existingResponse = await supabaseAdmin(
        context,
        `administration_subscriptions?business_id=eq.${encodeURIComponent(businessId)}&select=id,status,trial_started_at,trial_ends_at,first_authorized_at&limit=1`
      );
      const existing = existingResponse.ok
        ? (await existingResponse.json())?.[0]
        : null;
      const trialStillActive =
        existing?.status === "trial" &&
        existing?.trial_ends_at &&
        new Date(existing.trial_ends_at).getTime() > Date.now();
      const payload = {
        user_id: auth.user.id,
        business_id: businessId,
        status: trialStillActive ? "trial" : data.status || "pending",
        monthly_price: amount,
        mp_subscription_id: data.id,
        updated_at: new Date().toISOString(),
      };
      await supabaseAdmin(
        context,
        existing?.id
          ? `administration_subscriptions?id=eq.${encodeURIComponent(existing.id)}`
          : "administration_subscriptions",
        {
          method: existing?.id ? "PATCH" : "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(payload),
        }
      );
    } else {
      const plan = externalReference.split(":")[1];
      const existingResponse = await supabaseAdmin(
        context,
        `subscriptions?mp_subscription_id=eq.${encodeURIComponent(data.id)}&select=id&limit=1`
      );
      const existing = existingResponse.ok
        ? (await existingResponse.json())?.[0]
        : null;

      const subscriptionPayload = {
        user_id: auth.user.id,
        plan,
        status: data.status || "pending",
        amount,
        payer_email: auth.user.email,
        mp_subscription_id: data.id,
      };

      if (existing?.id) {
        await supabaseAdmin(
          context,
          `subscriptions?id=eq.${encodeURIComponent(existing.id)}`,
          {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify(subscriptionPayload),
          }
        );
      } else {
        await supabaseAdmin(context, "subscriptions", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(subscriptionPayload),
        });
      }
    }

    return json({ init_point: data.init_point });
  } catch (error) {
    console.error("CREATE SUBSCRIPTION ERROR", error);
    return errorJson(error?.message || "Error creando la suscripción", 500);
  }
}
