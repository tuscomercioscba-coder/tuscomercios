import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase";
import { trackMetaStandardEvent } from "../services/analytics/metaPixel";

const PLAN_VALUES = {
  standard: 19999,
  premium: 29999,
};

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const checkout = searchParams.get("checkout") || "plan";
  const plan = searchParams.get("plan") || "standard";
  const bannerId = searchParams.get("banner_id") || "";

  useEffect(() => {
    confirmPurchase();
  }, [checkout, plan, bannerId]);

  async function readConfirmedPurchase() {
    if (checkout === "banner" && bannerId) {
      const { data } = await supabase
        .from("banners")
        .select("id,payment_status,active")
        .eq("id", bannerId)
        .maybeSingle();

      if (data?.payment_status === "approved" && data?.active === true) {
        return {
          id: `banner:${data.id}`,
          name: "banner_regional",
          value: 50000,
        };
      }

      return null;
    }

    const { data } = await supabase
      .from("subscriptions")
      .select("id,plan,status,amount")
      .eq("plan", plan)
      .eq("status", "authorized")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return null;

    return {
      id: `plan:${data.id}`,
      name: `plan_${data.plan}`,
      value: Number(data.amount || PLAN_VALUES[data.plan] || 0),
    };
  }

  async function confirmPurchase() {
    setConfirming(true);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const purchase = await readConfirmedPurchase();

      if (purchase) {
        const dedupeKey = `tc_meta_purchase_${purchase.id}`;

        if (!localStorage.getItem(dedupeKey)) {
          if (
            trackMetaStandardEvent("Purchase", {
              content_name: purchase.name,
              content_category: "suscripcion",
              value: purchase.value,
              currency: "ARS",
            })
          ) {
            localStorage.setItem(dedupeKey, "1");
          }
        }

        setConfirmed(true);
        setConfirming(false);
        return;
      }

      await wait(1500);
    }

    setConfirming(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <h1 className="mb-3 text-3xl font-black text-green-600">
          {confirmed ? "Pago confirmado 🎉" : "Pago recibido"}
        </h1>

        <p className="mb-6 text-gray-600">
          {confirming
            ? "Estamos confirmando la activación con Mercado Pago..."
            : confirmed
              ? "La suscripción quedó activada correctamente."
              : "Mercado Pago todavía está procesando la activación. Se actualizará automáticamente en unos instantes."}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              checkout === "banner"
                ? "/dashboard"
                : `/register-business?plan=${plan}`
            )
          }
          className="w-full rounded-xl bg-green-600 py-3 font-bold text-white"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
