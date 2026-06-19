import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  LogOut,
  LayoutDashboard,
  Home,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Header() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [user, setUser] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);

  const navigate = useNavigate();

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

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

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

  async function handleInstallApp() {
    if (installPrompt) {
      installPrompt.prompt();

      await installPrompt.userChoice;

      setInstallPrompt(null);

      return;
    }

    const ua = navigator.userAgent.toLowerCase();

    const isIos =
      ua.includes("iphone") ||
      ua.includes("ipad");

    if (isIos) {
      alert(
        "📲 Para instalar: Compartir → Agregar a pantalla de inicio"
      );

      return;
    }

    alert(
      "📲 Abrí el menú del navegador → Instalar app"
    );
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    setUser(null);

    window.location.href = "/";
  }

  function formatText(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");
  }

  function handleSearch() {
    if (!search) return;

    navigate(
      `/categoria/${formatText(
        search
      )}/${formatText(city || "argentina")}`
    );

    setSuggestions([]);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  async function handleAutocomplete(value) {
    setSearch(value);

    if (value.length < 2) {
      setSuggestions([]);

      return;
    }

    const { data } =
      await supabase.rpc(
        "autocomplete_businesses",
        {
          query: value,
        }
      );

    if (data) {
      setSuggestions(
        data.slice(0, 6)
      );
    }
  }

  function goToQuickRegister() {
    navigate("/login");
  }

  return (
    <header className="bg-white px-4 py-8 shadow-sm">

      <div className="w-full flex justify-between items-center mb-6 gap-3">

        <button
          onClick={handleInstallApp}
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold"
        >
          📲 Descargar app
        </button>

        {!user ? (
          <button
            onClick={() =>
              navigate("/login")
            }
            className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold"
          >
            Ingresar
          </button>
        ) : (
          <div className="flex gap-2">

            <button
              onClick={() =>
                navigate("/")
              }
              className="bg-gray-100 px-4 py-2 rounded-xl"
            >
              <Home size={18} />
            </button>

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="bg-slate-100 px-4 py-2 rounded-xl"
            >
              <LayoutDashboard size={18} />
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-xl"
            >
              <LogOut size={18} />
            </button>

          </div>
        )}

      </div>

      <div className="flex flex-col items-center">

        <img
          src="/logo.png"
          alt="Tus Comercios"
          className="w-72 md:w-[500px] cursor-pointer"
          onClick={() =>
            navigate("/")
          }
        />

        <p className="text-lg text-slate-600 my-6 text-center">
          Encontrá comercios,
          profesionales y servicios
          cerca tuyo
        </p>

        <button
          onClick={goToQuickRegister}
          className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-lg mb-8"
        >
          Publicar mi negocio GRATIS
        </button>

        <div className="flex flex-col md:flex-row gap-3 w-full max-w-3xl relative">

          <div className="flex items-center w-full border rounded-2xl px-4 py-4">

            <Search size={20} />

            <input
              value={search}
              onChange={(e) =>
                handleAutocomplete(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="¿Qué estás buscando?"
              className="w-full outline-none ml-2"
            />

          </div>

          <div className="flex items-center border rounded-2xl px-4 py-4">

            <MapPin size={20} />

            <input
              value={city}
              onChange={(e) =>
                setCity(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Ciudad"
              className="outline-none ml-2"
            />

          </div>

          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl"
          >
            Buscar
          </button>

        </div>

      </div>

    </header>
  );
}
