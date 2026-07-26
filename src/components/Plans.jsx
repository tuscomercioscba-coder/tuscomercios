import { useNavigate } from "react-router-dom";

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function Plans() {
  const navigate = useNavigate();

  return (
    <section className="bg-slate-50 px-4 py-20">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
              Planes TusComercios
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Elegí cómo querés hacer crecer tu negocio
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-500">
              Comenzá gratis o accedé a más visibilidad, TusComercios Studio y Mentor IA con los planes Estándar y Premium.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/planes")}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-700"
          >
            Ver planes
            <ArrowIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
