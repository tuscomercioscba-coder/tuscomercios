import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  LogOut,
  LayoutDashboard,
  Home,
  Menu,
  X,
  CircleHelp,
  UserPlus,
  CreditCard,
  Palette,
  Bot,
  MessageCircle,
  Info,
  Download,
  Store,
  BriefcaseBusiness,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const informationLinks = [
  { label: "Quiénes somos", section: "quienes-somos", icon: Info },
  { label: "Cómo me registro", section: "como-registrarme", icon: UserPlus },
  { label: "Planes y pagos", section: "planes-y-pagos", icon: CreditCard },
  { label: "TusComercios Studio", section: "studio", icon: Palette },
  { label: "Mentor IA", section: "mentor-ia", icon: Bot },
  { label: "Administración", section: "administracion", icon: BriefcaseBusiness },
  { label: "Ayuda", section: "preguntas-frecuentes", icon: CircleHelp },
  { label: "Contáctanos", section: "contacto", icon: MessageCircle },
];

const formatText = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

export default function Header() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [user, setUser] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstallApp() {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
      alert("Para instalar: Compartir → Agregar a pantalla de inicio");
      return;
    }

    alert("Abrí el menú del navegador y elegí Instalar app.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function handleSearch() {
    if (!search.trim()) return;

    const detail = {
      search: search.trim(),
      city: city.trim(),
      province: "Córdoba",
    };

    window.dispatchEvent(new CustomEvent("search", { detail }));
    setSuggestions([]);

    const directory = document.getElementById("directorio-comercios");
    if (directory) {
      directory.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    navigate(`/categoria/${formatText(search)}/${formatText(city || "argentina")}`);
  }

  async function handleAutocomplete(value) {
    setSearch(value);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const { data } = await supabase.rpc("autocomplete_businesses", {
      query: value,
    });

    setSuggestions((data || []).slice(0, 6));
  }

  function goToHelp(section) {
    setMenuOpen(false);
    navigate(`/ayuda/${section}`);
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={handleInstallApp}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
          >
            <Download size={17} />
            <span className="hidden sm:inline">Descargar app</span>
            <span className="sm:hidden">App</span>
          </button>

          <nav className="hidden items-center gap-1 xl:flex">
            {informationLinks.map(({ label, section }) => (
              <button
                key={section}
                type="button"
                onClick={() => goToHelp(section)}
                className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!user ? (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-red-700"
              >
                Ingresar
              </button>
            ) : (
              <>
                <button type="button" onClick={() => navigate("/")} aria-label="Inicio" className="rounded-xl bg-slate-100 p-2.5 text-slate-700 transition hover:bg-slate-200">
                  <Home size={18} />
                </button>
                <button type="button" onClick={() => navigate("/dashboard")} aria-label="Dashboard" className="rounded-xl bg-slate-100 p-2.5 text-slate-700 transition hover:bg-slate-200">
                  <LayoutDashboard size={18} />
                </button>
                <button type="button" onClick={handleLogout} aria-label="Cerrar sesión" className="rounded-xl bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100">
                  <LogOut size={18} />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Abrir menú"
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-600 via-blue-700 to-red-600 p-[2px] text-white shadow-lg shadow-blue-200/70 transition hover:scale-105 xl:hidden"
            >
              <span className="flex items-center gap-2 rounded-[10px] bg-white px-3 py-2 font-black text-slate-800">
                {menuOpen ? <X size={20} /> : <Menu className="animate-pulse" size={20} />}
                <span className="text-xs">Ayuda</span>
              </span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 xl:hidden">
            <div className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2">
              {informationLinks.map(({ label, section, icon: MenuIcon }, index) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => goToHelp(section)}
                  className={`flex items-center gap-3 rounded-xl border-l-4 px-4 py-3 text-left text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 ${
                    index % 2 === 0
                      ? "border-red-600 bg-red-50 hover:bg-red-100"
                      : "border-blue-600 bg-blue-50 hover:bg-blue-100"
                  }`}
                >
                  <MenuIcon size={18} className={index % 2 === 0 ? "text-red-600" : "text-blue-600"} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f8fafc_70%,_#eef2f7_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <img
              src="/logo.png"
              alt="Tus Comercios"
              className="w-72 cursor-pointer sm:w-[420px]"
              onClick={() => navigate("/")}
            />

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Encontrá comercios, profesionales y servicios cerca tuyo.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-red-600 px-7 py-4 text-base font-black text-white shadow-lg shadow-red-100 transition hover:-translate-y-0.5 hover:bg-red-700"
            >
              <Store size={20} />
              Publicar mi negocio GRATIS
            </button>

            <div className="relative mt-8 grid w-full gap-3 rounded-[26px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.10)] md:grid-cols-[1.4fr_1fr_auto]">
              <label className="flex min-w-0 items-center rounded-2xl bg-slate-50 px-4 py-4 text-left">
                <Search size={20} className="shrink-0 text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => handleAutocomplete(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                  placeholder="¿Qué estás buscando?"
                  className="ml-3 w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>

              <label className="flex min-w-0 items-center rounded-2xl bg-slate-50 px-4 py-4 text-left">
                <MapPin size={20} className="shrink-0 text-slate-500" />
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                  placeholder="Localidad"
                  className="ml-3 w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>

              <button
                type="button"
                onClick={handleSearch}
                className="rounded-2xl bg-blue-600 px-8 py-4 font-black text-white transition hover:bg-blue-700"
              >
                Buscar
              </button>

              {suggestions.length > 0 && (
                <div className="absolute left-3 right-3 top-[78px] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl md:right-auto md:w-[48%]">
                  {suggestions.map((item, index) => (
                    <button
                      key={`${item.negocio || item.name || "resultado"}-${index}`}
                      type="button"
                      onClick={() => {
                        setSearch(item.negocio || item.name || "");
                        setSuggestions([]);
                      }}
                      className="block w-full border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition last:border-0 hover:bg-slate-50"
                    >
                      {item.negocio || item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
