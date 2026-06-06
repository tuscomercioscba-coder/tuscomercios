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
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
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
    const isIos = ua.includes("iphone") || ua.includes("ipad");

    if (isIos) {
      alert("📲 Para instalar: tocá Compartir → Agregar a pantalla de inicio");
      return;
    }

    alert("📲 Para instalar: abrí el menú del navegador y tocá 'Instalar app' o 'Agregar a pantalla principal'.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  const formatText = (text) => {
    return text.toLowerCase().trim().replace(/\s+/g, "-");
  };

  const handleSearch = () => {
    if (!search) return;

    const rubro = formatText(search);
    const ciudadFormatted = formatText(city || "argentina");

    navigate(`/categoria/${rubro}/${ciudadFormatted}`);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAutocomplete = async (value) => {
    setSearch(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    const { data, error } = await supabase.rpc("autocomplete_businesses", {
      query: value,
    });

    if (!error && data) {
      setSuggestions(data.slice(0, 6));
    }
  };

  return (
    <header className="bg-white px-4 py-8 shadow-sm">
      <div className="w-full flex justify-between items-center mb-6 gap-3">
        <button
          onClick={handleInstallApp}
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition text-sm md:text-base shadow"
        >
          📲 Descargar app
        </button>

        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Ingresar
          </button>
        ) : (
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              <Home size={18} />
              Inicio
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              <LayoutDashboard size={18} />
              Panel
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center text-center">
        <img
          src="/logo.png"
          alt="Tus Comercios"
          className="w-72 md:w-[500px] mb-3 cursor-pointer"
          onClick={() => navigate("/")}
        />

        <p className="text-lg text-slate-600 mb-6 max-w-2xl">
          Encontrá comercios, profesionales y servicios cerca tuyo en toda
          Argentina
        </p>

        {!user && (
          <button
            onClick={() => navigate("/login")}
            className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-lg mb-8 hover:bg-green-700 transition shadow-xl"
          >
            Publicar mi negocio GRATIS
          </button>
        )}

        <div className="flex flex-col md:flex-row items-center gap-3 w-full max-w-3xl relative">
          <div className="flex items-center w-full border rounded-2xl px-4 py-4 bg-white shadow-sm relative">
            <Search className="text-slate-400 mr-2" size={20} />

            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              value={search}
              onChange={(e) => handleAutocomplete(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full outline-none text-lg"
            />

            {suggestions.length > 0 && (
              <div className="absolute top-16 left-0 w-full bg-white shadow-2xl rounded-2xl z-50 border overflow-hidden">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      navigate(`/negocio/${s.id}`);
                      setSuggestions([]);
                    }}
                    className="p-4 hover:bg-gray-100 cursor-pointer text-left border-b"
                  >
                    🔎 {s.negocio}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center w-full md:w-64 border rounded-2xl px-4 py-4 bg-white shadow-sm">
            <MapPin className="text-slate-400 mr-2" size={20} />

            <input
              type="text"
              placeholder="Ciudad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full outline-none"
            />
          </div>

          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 transition shadow-md w-full md:w-auto font-bold"
          >
            Buscar
          </button>
        </div>
      </div>
    </header>
  );
}