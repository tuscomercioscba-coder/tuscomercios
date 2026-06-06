import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Layout({ children, fullWidth = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function getUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user || null);
  }

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
    await supabase.auth.signOut({ scope: "global" });
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="bg-white shadow flex flex-wrap justify-between items-center gap-3 px-4 md:px-6 py-4">
        <img
          src="/logo.png"
          alt="Tus Comercios"
          className="w-36 md:w-40 cursor-pointer"
          onClick={async () => {
            await registerEvent("click_home_logo", "/");
            navigate("/");
          }}
        />

        <div className="flex gap-2 md:gap-3 flex-wrap">
          <button
            onClick={async () => {
              await registerEvent("click_home_button", "/");
              navigate("/");
            }}
            className="bg-gray-200 text-gray-800 px-3 md:px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 transition text-sm md:text-base"
          >
            Inicio
          </button>

          {user ? (
            <>
              <button
                onClick={async () => {
                  await registerEvent("click_dashboard_button", "/dashboard");
                  navigate("/dashboard");
                }}
                className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition text-sm md:text-base"
              >
                Mi panel
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 md:px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition text-sm md:text-base"
              >
                Salir
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition text-sm md:text-base"
            >
              Ingresar
            </button>
          )}
        </div>
      </div>

      <div className={fullWidth ? "p-0" : "p-4 md:p-6"}>{children}</div>
    </div>
  );
}