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
          Elegí el plan ideal para tu negocio
        </h1>

        <p className="text-slate-500 text-lg max-w-3xl mx-auto">
          Conseguí más clientes,
          más visitas y más ventas
          mostrando tu negocio a miles
          de personas.
        </p>

      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {/* GRATIS */}

        <div className="bg-white rounded-3xl border shadow-sm p-8 flex flex-col">

          <h2 className="text-2xl font-black mb-2">
            Gratis
          </h2>

          <p className="text-gray-500 mb-6">
            Ideal para comenzar
          </p>

          <div className="mb-8">

            <span className="text-5xl font-black">
              $0
            </span>

            <span className="text-gray-500">
              /mes
            </span>

          </div>

          <ul className="space-y-3">

            <li>✔ Hasta 2 fotos</li>

            <li>✔ WhatsApp directo</li>

            <li>✔ Ciudad y provincia</li>

            <li>✔ Descripción básica</li>

            <li>✔ Horarios</li>

            <li>✔ Aparece en búsquedas</li>

          </ul>

          <div className="mt-8 bg-slate-50 border p-4 rounded-2xl">

            Empezá gratis y publicá hoy.

          </div>

          <button
            onClick={() =>
              selectPlan("free")
            }
            className="mt-8 bg-slate-800 text-white py-4 rounded-2xl font-black hover:bg-black transition"
          >
            Empezar Gratis
          </button>

        </div>

        {/* ESTANDAR */}

        <div className="bg-white rounded-3xl border-2 border-blue-500 shadow-xl p-8 relative flex flex-col">

          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-2 rounded-full font-black text-sm">
            MÁS ELEGIDO
          </div>

          <h2 className="text-2xl font-black mb-2">
            Estándar
          </h2>

          <p className="text-gray-500 mb-6">
            Más presencia y mejor imagen
          </p>

          <div className="mb-8">

            <span className="text-5xl font-black text-blue-600">
              $8.000
            </span>

            <span className="text-gray-500">
              /mes
            </span>

          </div>

          <ul className="space-y-3">

            <li>✔ Todo Gratis</li>

            <li>✔ Hasta 6 fotos</li>

            <li>✔ Redes sociales</li>

            <li>✔ Email de contacto</li>

            <li>✔ Más prioridad</li>

            <li>✔ Más alcance regional</li>

            <li>✔ Estadísticas básicas</li>

          </ul>

          <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-2xl">

            Ideal para negocios que quieren verse más profesionales.

          </div>

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
            className="mt-8 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition"
          >

            {
              loadingPlan ===
              "standard"
                ? "Preparando..."
                : "Contratar Estándar"
            }

          </button>

        </div>

        {/* PREMIUM */}

        <div className="bg-gradient-to-b from-slate-950 to-purple-900 rounded-3xl shadow-2xl p-8 text-white border-2 border-amber-300 flex flex-col relative">

          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-black px-5 py-2 rounded-full font-black text-sm">

            PREMIUM

          </div>

          <h2 className="text-2xl font-black mb-2 mt-2">
            Premium
          </h2>

          <p className="text-purple-100 mb-6">
            Tu negocio como mini web
          </p>

          <div className="mb-8">

            <span className="text-5xl font-black">
              $15.000
            </span>

            <span className="text-purple-200">
              /mes
            </span>

          </div>

          <ul className="space-y-3">

            <li>✔ Todo Estándar</li>

            <li>✔ Hasta 10 fotos</li>

            <li>✔ Video del negocio</li>

            <li>✔ Portada Premium</li>

            <li>✔ Sitio web</li>

            <li>✔ Google Maps</li>

            <li>✔ Servicios destacados</li>

            <li>✔ Compartir con logo propio</li>

            <li>✔ Máxima prioridad</li>

            <li>✔ Más clics y exposición</li>

          </ul>

          <div className="mt-8 bg-white/10 border border-white/20 p-4 rounded-2xl">

            👑 Convertí tu vidriera en una mini página web profesional.

          </div>

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
            className="mt-8 bg-amber-400 text-black py-4 rounded-2xl font-black hover:bg-amber-300 transition"
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