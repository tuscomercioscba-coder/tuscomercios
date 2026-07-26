import { useNavigate } from "react-router-dom";
import {
  Info,
  UserPlus,
  CreditCard,
  Palette,
  Bot,
  CircleHelp,
  MessageCircle,
} from "lucide-react";

const links = [
  { label: "Quiénes somos", section: "quienes-somos", icon: Info },
  { label: "Cómo me registro", section: "como-registrarme", icon: UserPlus },
  { label: "Planes y pagos", section: "planes-y-pagos", icon: CreditCard },
  { label: "TusComercios Studio", section: "studio", icon: Palette },
  { label: "Mentor IA", section: "mentor-ia", icon: Bot },
  { label: "Preguntas frecuentes", section: "preguntas-frecuentes", icon: CircleHelp },
  { label: "Contáctanos", section: "contacto", icon: MessageCircle },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <button type="button" onClick={() => navigate("/")} className="rounded-2xl bg-white p-4 shadow-lg">
              <img src="/logo.png" alt="Tus Comercios" className="w-56" />
            </button>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Conectamos personas con comercios, profesionales y servicios, mientras brindamos herramientas para ayudar a los negocios argentinos a crecer.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {links.map(({ label, section, icon: LinkIcon }) => (
              <button
                key={section}
                type="button"
                onClick={() => navigate(`/ayuda/${section}`)}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
              >
                <LinkIcon size={17} className="text-red-500" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Tus Comercios. Todos los derechos reservados.</span>
          <button
            type="button"
            onClick={() => navigate("/ayuda/contacto")}
            className="font-semibold text-white hover:text-red-400"
          >
            Soporte: 3544-573187
          </button>
        </div>
      </div>
    </footer>
  );
}
