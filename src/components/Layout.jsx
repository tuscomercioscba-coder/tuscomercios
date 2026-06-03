import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Layout({ children }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow flex flex-wrap justify-between items-center gap-3 px-6 py-4">
        <img
          src="/logo.png"
          alt="Tus Comercios"
          className="w-40 cursor-pointer"
          onClick={() => navigate("/")}
        />

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            Ir al inicio
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Mi panel
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
}