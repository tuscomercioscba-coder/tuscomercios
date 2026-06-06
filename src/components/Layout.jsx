import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Layout({ children, fullWidth = false }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;

    if (!isStandalone) {
      setShowInstall(true);
    }

    return () => {
      subscription.unsubscribe();

      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  async function getUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user || null);
  }

  async function registerEvent(
    eventType,
    path = window.location.pathname
  ) {
    await supabase.from("page_events").insert([
      {
        event_type: eventType,
        path,
      },
    ]);
  }

  async function handleInstallApp() {
    try {
      if (installPrompt) {
        installPrompt.prompt();

        const result = await installPrompt.userChoice;

        if (result.outcome === "accepted") {
          setShowInstall(false);
        }

        return;
      }

      const ua = navigator.userAgent.toLowerCase();

      const isIos =
        ua.includes("iphone") ||
        ua.includes("ipad");

      if (isIos) {
        alert(
          "📲 Para instalar:\n\nCompartir → Agregar a pantalla de inicio"
        );

        return;
      }

      alert(
        "📲 Abrí el menú del navegador y tocá 'Instalar aplicación'"
      );
    } catch (e) {
      console.log(e);
    }
  }

  async function handleLogout() {
    await registerEvent("logout");

    await supabase.auth.signOut({
      scope: "global",
    });

    localStorage.clear();
    sessionStorage.clear();

    setUser(null);

    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">

      {showInstall && (
        <button
          onClick={handleInstallApp}
          className="
          fixed
          top-3
          left-3
          z-[999]
          bg-blue-600
          text-white
          px-4
          py-3
          rounded-full
          shadow-xl
          font-black
          text-xs
          md:text-sm
          hover:bg-blue-700
          active:scale-95
          transition
          "
        >
          📲 Descargar app
        </button>
      )}

      <div
        className="
        bg-white
        shadow
        flex
        flex-wrap
        justify-between
        items-center
        gap-3
        px-4
        md:px-6
        py-4
        "
      >
        <img
          src="/logo.png"
          alt="Tus Comercios"
          className="w-36 md:w-40 cursor-pointer"
          onClick={async () => {
            await registerEvent(
              "click_home_logo",
              "/"
            );

            navigate("/");
          }}
        />

        <div className="flex gap-2 md:gap-3 flex-wrap">

          <button
            onClick={async () => {
              await registerEvent(
                "click_home_button",
                "/"
              );

              navigate("/");
            }}
            className="
            bg-gray-200
            text-gray-800
            px-4
            py-2
            rounded-xl
            font-semibold
            hover:bg-gray-300
            "
          >
            Inicio
          </button>

          {user ? (
            <>
              <button
                onClick={async () => {
                  await registerEvent(
                    "click_dashboard_button",
                    "/dashboard"
                  );

                  navigate("/dashboard");
                }}
                className="
                bg-blue-600
                text-white
                px-4
                py-2
                rounded-xl
                font-semibold
                hover:bg-blue-700
                "
              >
                Mi panel
              </button>

              <button
                onClick={handleLogout}
                className="
                bg-red-500
                text-white
                px-4
                py-2
                rounded-xl
                font-semibold
                hover:bg-red-600
                "
              >
                Salir
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                navigate("/login")
              }
              className="
              bg-blue-600
              text-white
              px-4
              py-2
              rounded-xl
              font-semibold
              hover:bg-blue-700
              "
            >
              Ingresar
            </button>
          )}
        </div>
      </div>

      <div
        className={
          fullWidth
            ? "p-0"
            : "p-4 md:p-6"
        }
      >
        {children}
      </div>

    </div>
  );
}