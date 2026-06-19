import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useState } from "react";

export default function PlansPage() {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const selectPlan = async (plan) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    if (plan === "free") {
      await supabase.from("profiles").upsert({
        id: user.id,
        plan: "free",
      });

      navigate("/register-business?plan=free");
      return;
    }

    try {
      setLoadingPlan(plan);

      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          plan,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        alert("Error creando la suscripción");
        return;
      }

      window.location.href = data.init_point;
    } catch (error) {
      console.error(error);
      alert("Error conectando con Mercado Pago");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4">
      <div className="max-w-5xl mx-auto text-center mb-14">
        <div className="inline-flex bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-black text-sm mb-5">
          🚀 Publicá hoy y completá tu vidriera paso a paso
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
          Elegí cómo querés mostrar tu negocio
        </h1>

        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Empezá gratis o convertí tu vidriera en una mini página web profesional dentro de Tus Comercios.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border shadow-sm p-8 flex flex-col">
          <h2 className="text-2xl font-black mb-2">Gratis</h2>
          <p className="text-gray-500 mb-6">Ideal para empezar</p>

          <div className="mb-6">
            <span className="text-5xl font-black">$0</span>
            <span className="text-gray-500">/mes</span>
          </div>

          <ul className="space-y-3 text-sm text-left">
            <li>✔ Hasta 2 fotos</li>
            <li>✔ WhatsApp directo</li>
            <li>✔ Provincia y localidad automática</li>
            <li>✔ Descripción básica</li>
            <li>✔ Horarios de atención</li>
            <li>✔ Aparece en búsquedas</li>
          </ul>

          <div className="mt-8 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <p className="text-sm text-slate-700 font-medium">
              Empezá gratis y completá tu vidriera cuando quieras.
            </p>
          </div>

          <button
            onClick={() => selectPlan("free")}
            className="mt-8 bg-slate-800 text-white py-3 rounded-2xl font-bold hover:bg-black transition"
          >
            Publicar gratis
          </button>
        </div>

        <div className="bg-white rounded-3xl border-2 border-blue-500 shadow-xl p-8 flex flex-col relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg">
            MÁS ELEGIDO
          </div>

          <h2 className="text-2xl font-black mb-2">Estándar</h2>
          <p className="text-gray-500 mb-6">Más presencia y mejor imagen</p>

          <div className="mb-6">
            <span className="text-5xl font-black text-blue-600">$8.000</span>
            <span className="text-gray-500">/mes</span>
          </div>

          <ul className="space-y-3 text-sm text-left">
            <li>✔ Todo lo del plan Gratis</li>
            <li>✔ Hasta 6 fotos</li>
            <li>✔ Redes sociales</li>
            <li>✔ Email de contacto</li>
            <li>✔ Mayor prioridad que Gratis</li>
            <li>✔ Vidriera más completa</li>
          </ul>

          <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-2xl">
            <p className="text-sm text-blue-700 font-medium">
              Ideal para negocios que quieren verse más profesionales y recibir más consultas.
            </p>
          </div>

          <button
            onClick={() => selectPlan("standard")}
            disabled={loadingPlan === "standard"}
            className="mt-8 bg-blue-600 text-white py-3 rounded-2xl font-bold text-center hover:bg-blue-700 transition"
          >
            {loadingPlan === "standard"
              ? "Preparando pago..."
              : "Elegir Estándar"}
          </button>
        </div>

        <div className="bg-gradient-to-b from-slate-950 to-purple-900 rounded-3xl shadow-2xl p-8 flex flex-col text-white relative overflow-hidden border-2 border-amber-300">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 px-5 py-2 rounded-full text-sm font-black shadow-lg">
            PREMIUM RECOMENDADO
          </div>

          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-300/20 rounded-full blur-3xl"></div>

          <h2 className="text-2xl font-black mb-2 mt-2">Premium</h2>
          <p className="text-purple-100 mb-6">
            Tu negocio como mini web profesional
          </p>

          <div className="mb-6">
            <span className="text-5xl font-black">$15.000</span>
            <span className="text-purple-200">/mes</span>
          </div>

          <ul className="space-y-3 text-sm text-left">
            <li>✔ Todo lo del plan Estándar</li>
            <li>✔ Hasta 10 fotos</li>
            <li>✔ Video del negocio</li>
            <li>✔ Mapa visible integrado</li>
            <li>✔ Botón “Cómo llegar”</li>
            <li>✔ Sitio web</li>
            <li>✔ Servicios destacados</li>
            <li>✔ Portada premium</li>
            <li>✔ Máxima prioridad</li>
          </ul>

          <div className="mt-8 bg-white/10 border border-white/20 p-4 rounded-2xl">
            <p className="text-sm font-medium">
              👑 El plan Premium transforma tu vidriera en una presentación profesional para vender más confianza.
            </p>
          </div>

          <button
            onClick={() => selectPlan("premium")}
            disabled={loadingPlan === "premium"}
            className="mt-8 bg-amber-400 text-slate-950 py-3 rounded-2xl font-black text-center hover:bg-amber-300 transition"
          >
            {loadingPlan === "premium"
              ? "Preparando pago..."
              : "Quiero Premium"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 bg-white border rounded-3xl shadow p-6 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          ¿No sabés cuál elegir?
        </h2>

        <p className="text-slate-600">
          Podés empezar gratis, completar tu vidriera y mejorar de plan cuando quieras.
        </p>
      </div>
    </div>
  );
}
