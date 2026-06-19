import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useState } from "react";

export default function PlansPage() {
  const navigate = useNavigate();

  const [loadingPlan, setLoadingPlan] =
    useState(null);

  const selectPlan = async (plan) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    if (plan === "free") {
      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          plan: "free",
        });

      navigate(
        "/register-business?plan=free"
      );

      return;
    }

    try {
      setLoadingPlan(plan);

      const response =
        await fetch(
          "/api/create-subscription",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email: user.email,
              plan,
              user_id: user.id,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          "Error creando suscripción"
        );

        return;
      }

      window.location.href =
        data.init_point;

    } catch {
      alert(
        "Error conectando con Mercado Pago"
      );
    }

    finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4">

      <div className="max-w-5xl mx-auto text-center mb-14">

        <h1 className="text-5xl font-black text-slate-900 mb-4">
          Elegí el plan ideal
        </h1>

        <p className="text-slate-500">
          Elegí cómo querés mostrar
          tu negocio.
        </p>

      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        <div className="bg-white rounded-3xl border p-8">

          <h2 className="text-2xl font-black">
            Gratis
          </h2>

          <div className="text-5xl font-black mt-5">
            $0
          </div>

          <ul className="mt-8 space-y-3">

            <li>
              ✔ Hasta 2 fotos
            </li>

            <li>
              ✔ WhatsApp
            </li>

            <li>
              ✔ Horarios
            </li>

          </ul>

          <button
            onClick={() =>
              selectPlan(
                "free"
              )
            }
            className="mt-10 bg-slate-800 text-white py-3 rounded-2xl w-full"
          >
            Publicar gratis
          </button>

        </div>

        <div className="bg-white rounded-3xl border-2 border-blue-500 p-8">

          <h2 className="text-2xl font-black">
            Estándar
          </h2>

          <div className="text-5xl font-black text-blue-600 mt-5">
            $8.000
          </div>

          <ul className="mt-8 space-y-3">

            <li>
              ✔ Todo Gratis
            </li>

            <li>
              ✔ Redes sociales
            </li>

            <li>
              ✔ Más prioridad
            </li>

          </ul>

          <button
            disabled={
              loadingPlan ===
              "standard"
            }
            onClick={() =>
              selectPlan(
                "standard"
              )
            }
            className="mt-10 bg-blue-600 text-white py-3 rounded-2xl w-full"
          >
            {
              loadingPlan ===
              "standard"
                ? "Preparando..."
                : "Elegir"
            }
          </button>

        </div>

        <div className="bg-gradient-to-b from-slate-950 to-purple-900 text-white rounded-3xl p-8">

          <h2 className="text-2xl font-black">
            Premium
          </h2>

          <div className="text-5xl font-black mt-5">
            $15.000
          </div>

          <ul className="mt-8 space-y-3">

            <li>
              ✔ Todo Estándar
            </li>

            <li>
              ✔ Video
            </li>

            <li>
              ✔ Portada premium
            </li>

            <li>
              ✔ Máxima prioridad
            </li>

          </ul>

          <button
            disabled={
              loadingPlan ===
              "premium"
            }
            onClick={() =>
              selectPlan(
                "premium"
              )
            }
            className="mt-10 bg-amber-400 text-black py-3 rounded-2xl w-full"
          >
            {
              loadingPlan ===
              "premium"
                ? "Preparando..."
                : "Quiero Premium"
            }
          </button>

        </div>

      </div>

    </div>
  );
}