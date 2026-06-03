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

      const response = await fetch("/.netlify/functions/create-subscription", {
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
        <h1 className="text-5xl font-black text-slate-800 mb-4">
          Elegí el plan ideal para tu negocio
        </h1>

        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Conseguí más clientes, más visitas y más ventas mostrando tu negocio
          a miles de personas en tu ciudad.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border shadow-sm p-8 flex flex-col">
          <h2 className="text-2xl font-black mb-2">Gratis</h2>
          <p className="text-gray-500 mb-6">Ideal para comenzar</p>

          <div className="mb-6">
            <span className="text-5xl font-black">$0</span>
            <span className="text-gray-500">/mes</span>
          </div>

          <ul className="space-y-3 text-sm">
            <li>✔ Hasta 2 fotos</li>
            <li>✔ WhatsApp</li>
            <li>✔ Ciudad y provincia</li>
            <li>✔ Descripción básica</li>
            <li>✔ Aparece en búsquedas</li>
          </ul>

          <div className="mt-8 bg-orange-50 border border-orange-200 p-4 rounded-2xl">
            <p className="text-sm text-orange-700 font-medium">
              ⚡ Los negocios Premium reciben hasta 12x más visitas y clics.
            </p>
          </div>

          <button
            onClick={() => selectPlan("free")}
            className="mt-8 bg-slate-800 text-white py-3 rounded-2xl font-bold hover:bg-black transition"
          >
            Empezar Gratis
          </button>
        </div>

        <div className="bg-white rounded-3xl border-2 border-blue-500 shadow-xl p-8 flex flex-col relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg">
            MÁS ELEGIDO
          </div>

          <h2 className="text-2xl font-black mb-2">Estándar</h2>
          <p className="text-gray-500 mb-6">Más visibilidad para crecer</p>

          <div className="mb-6">
            <span className="text-5xl font-black text-blue-600">$8.000</span>
            <span className="text-gray-500">/mes</span>
          </div>

          <ul className="space-y-3 text-sm">
            <li>✔ Hasta 6 fotos</li>
            <li>✔ Redes sociales</li>
            <li>✔ Más prioridad en búsquedas</li>
            <li>✔ WhatsApp directo</li>
            <li>✔ Estadísticas reales</li>
            <li>✔ Más alcance regional</li>
          </ul>

          <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-2xl">
            <p className="text-sm text-blue-700 font-medium">
              🚀 Los negocios Premium reciben hasta 4x más clics que Estándar.
            </p>
          </div>

          <button
            onClick={() => selectPlan("standard")}
            disabled={loadingPlan === "standard"}
            className="mt-8 bg-blue-600 text-white py-3 rounded-2xl font-bold text-center hover:bg-blue-700 transition"
          >
            {loadingPlan === "standard"
              ? "Preparando pago..."
              : "Contratar Estándar"}
          </button>
        </div>

        <div className="bg-gradient-to-b from-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 flex flex-col text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

          <h2 className="text-2xl font-black mb-2">Premium</h2>
          <p className="text-purple-100 mb-6">
            Máxima exposición y resultados
          </p>

          <div className="mb-6">
            <span className="text-5xl font-black">$15.000</span>
            <span className="text-purple-200">/mes</span>
          </div>

          <ul className="space-y-3 text-sm">
            <li>✔ Hasta 10 fotos</li>
            <li>✔ Video del negocio</li>
            <li>✔ Google Maps</li>
            <li>✔ Sitio web</li>
            <li>✔ Máxima prioridad</li>
            <li>✔ Más visitas y clics</li>
            <li>✔ Estadísticas avanzadas</li>
            <li>✔ Más alcance regional</li>
          </ul>

          <div className="mt-8 bg-white/10 border border-white/20 p-4 rounded-2xl">
            <p className="text-sm font-medium">
              👑 El plan Premium aparece primero y recibe la mayor visibilidad.
            </p>
          </div>

          <button
            onClick={() => selectPlan("premium")}
            disabled={loadingPlan === "premium"}
            className="mt-8 bg-white text-purple-700 py-3 rounded-2xl font-black text-center hover:bg-slate-100 transition"
          >
            {loadingPlan === "premium"
              ? "Preparando pago..."
              : "Contratar Premium"}
          </button>
        </div>
      </div>
    </div>
  );
}