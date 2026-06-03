import { useSearchParams, useNavigate } from "react-router-dom";

export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const plan = searchParams.get("plan") || "standard";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center">
        <h1 className="text-3xl font-black text-green-600 mb-3">
          Pago recibido 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          Tu suscripción está siendo activada. Ya podés continuar y cargar tu negocio.
        </p>

        <button
          onClick={() => navigate(`/register-business?plan=${plan}`)}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}