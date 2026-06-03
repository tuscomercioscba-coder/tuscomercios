import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Layout({ children }) {
  const navigate = useNavigate();

  async function registerEvent(eventType, path = window.location.pathname) {
    await supabase.from("page_events").insert([
      {
        event_type: eventType,
        path,
      },
    ]);
  }

  async function handleLogout() {
    await registerEvent("logout");
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
          onClick={async () => {
            await registerEvent("click_home_logo", "/");
            navigate("/");
          }}
        />

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={async () => {
              await registerEvent("click_home_button", "/");
              navigate("/");
            }}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            Ir al inicio
          </button>

          <button
            onClick={async () => {
              await registerEvent("click_dashboard_button", "/dashboard");
              navigate("/dashboard");
            }}
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