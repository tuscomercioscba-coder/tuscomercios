import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useState } from "react";
import { trackMetaStandardEvent } from "../services/analytics/metaPixel";

const Icon = ({ name, className = "h-5 w-5" }) => {
  const paths = {
    check: <path d="m5 12 4 4L19 6" />,
    x: <path d="m6 6 12 12M18 6 6 18" />,
    store: <path d="M3 10h18M5 10v9h14v-9M4 10l2-5h12l2 5M9 19v-5h6v5" />,
    image: <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m21 15-5-5L5 19"/></>,
    video: <><path d="m16 13 5 3V8l-5 3"/><rect x="3" y="6" width="13" height="12" rx="2"/></>,
    whatsapp: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 1 1 17 0Z"/><path d="M8.5 8.5c.5 3 2 4.5 5 5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M17 11a4 4 0 0 0 0-8M21 21v-2a4 4 0 0 0-3-3.7"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></>,
    trend: <><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></>,
    palette: <><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 3a9 9 0 1 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12h-3Z"/></>,
    clapper: <><path d="M4 11h16v9H4zM4 11l2-6h14l-2 6M8 5l-2 6M14 5l-2 6M20 5l-2 6"/></>,
    bot: <><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8"/></>,
    sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/></>,
    package: <><path d="m21 8-9 5-9-5 9-5 9 5Z"/><path d="m3 8 9 5v9l-9-5V8ZM21 8l-9 5v9l9-5V8Z"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    wallet: <><path d="M4 5h15a2 2 0 0 1 2 2v12H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z"/></>,
    shield: <path d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-3Z" />,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.9.9-1.9 1.4-1.9 3M12 17h.01"/></>,
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

const Yes = ({ children }) => (
  <span className="inline-flex items-center justify-center gap-2 font-semibold text-slate-800">
    <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-600">
      <Icon name="check" className="h-4 w-4" />
    </span>
    {children}
  </span>
);

const No = () => (
  <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-400">
    <Icon name="x" className="h-4 w-4" />
  </span>
);

const ModuleCard = ({ icon, title, subtitle, rows, accent = "slate" }) => {
  const accentClasses = {
    slate: "bg-slate-900 text-white",
    red: "bg-red-600 text-white",
    blue: "bg-blue-600 text-white",
    violet: "bg-violet-600 text-white",
    green: "bg-emerald-600 text-white",
    orange: "bg-orange-500 text-white",
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${accentClasses[accent]}`}>
          <Icon name={icon} className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-950">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 text-sm text-slate-500">
              <th className="px-6 py-4 font-bold">Servicio</th>
              <th className="px-5 py-4 text-center font-bold">Gratis</th>
              <th className="px-5 py-4 text-center font-bold text-red-600">Estándar</th>
              <th className="px-5 py-4 text-center font-bold text-blue-600">Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.label} className="transition hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 font-semibold text-slate-800">
                    {row.icon && (
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
                        <Icon name={row.icon} className="h-4.5 w-4.5" />
                      </span>
                    )}
                    {row.label}
                  </div>
                </td>
                <td className="px-5 py-4 text-center">{row.free}</td>
                <td className="px-5 py-4 text-center">{row.standard}</td>
                <td className="px-5 py-4 text-center">{row.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const PlanCard = ({
  name,
  eyebrow,
  price,
  description,
  borderClass,
  shadowClass,
  buttonClass,
  loading,
  onClick,
  children,
  badge,
}) => (
  <article className={`relative flex h-full flex-col rounded-[30px] border-2 bg-white p-7 transition duration-300 hover:-translate-y-1 ${borderClass} ${shadowClass}`}>
    {badge && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg">
        {badge}
      </div>
    )}

    <div className="mb-6">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black text-slate-950">{name}</h2>
      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">{description}</p>
    </div>

    <div className="mb-7 flex items-end gap-2">
      <span className="text-4xl font-black tracking-tight text-slate-950">{price}</span>
      <span className="pb-1 text-sm font-semibold text-slate-400">/ mes</span>
    </div>

    <div className="flex-1 space-y-3 text-sm">{children}</div>

    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`mt-8 w-full rounded-2xl px-5 py-4 font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass}`}
    >
      {loading ? "Preparando..." : name === "Gratis" ? "Comenzar gratis" : `Elegir ${name}`}
    </button>
  </article>
);

const FutureCard = ({ icon, title, description, items, accent }) => {
  const accents = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
  };

  return (
    <article className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
      <div className={`inline-grid h-12 w-12 place-items-center rounded-2xl border ${accents[accent]}`}>
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
          Próximamente
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-500">
              <Icon name="check" className="h-3.5 w-3.5" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
};

export default function PlansPage() {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [commercialCode, setCommercialCode] = useState("");

  const selectPlan = async (plan) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    if (plan === "free") {
      await supabase.from("profiles").upsert({
        id: user.id,
        plan: "free",
      });

      navigate("/register-business?plan=free");
      return;
    }

    try {
      setLoadingPlan(plan);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        navigate("/login");
        return;
      }

      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan, code: commercialCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data?.error || "Error creando suscripción");
        return;
      }

      trackMetaStandardEvent("InitiateCheckout", {
        content_name: `plan_${plan}`,
        content_category: "suscripcion",
        value: plan === "premium" ? 29999 : 19999,
        currency: "ARS",
      });

      window.location.href = data.init_point;
    } catch {
      alert("Error conectando con Mercado Pago");
    } finally {
      setLoadingPlan(null);
    }
  };

  const tusComerciosRows = [
    { label: "Fotos en la vidriera", icon: "image", free: "5", standard: "10", premium: "15" },
    { label: "Videos en la vidriera", icon: "video", free: <No />, standard: "1", premium: "2" },
    { label: "WhatsApp directo", icon: "whatsapp", free: <Yes />, standard: <Yes />, premium: <Yes /> },
    { label: "Horarios de atención", icon: "clock", free: <Yes />, standard: <Yes />, premium: <Yes /> },
    { label: "Redes sociales", icon: "users", free: <No />, standard: <Yes />, premium: <Yes /> },
    { label: "Mapa visible en la vidriera", icon: "map", free: <No />, standard: <No />, premium: <Yes /> },
    { label: "Visibilidad en búsquedas", icon: "trend", free: "Básica", standard: "Destacada", premium: "Máxima prioridad" },
  ];

  const studioRows = [
    { label: "Editor de imágenes", icon: "palette", free: <No />, standard: "10 por día", premium: "20 por día" },
    { label: "Reels Studio", icon: "clapper", free: <No />, standard: "1 por día", premium: "2 por día" },
    { label: "Editor de carruseles", icon: "image", free: <No />, standard: "2 por día", premium: "4 por día" },
    { label: "Análisis creativo con Mentor IA", icon: "sparkles", free: <No />, standard: "1 por editor/día", premium: "2 por editor/día" },
    { label: "Filtros y estilos", icon: "sparkles", free: <No />, standard: <Yes />, premium: <Yes /> },
  ];

  const mentorRows = [
    { label: "Respuestas breves", icon: "bot", free: <No />, standard: "15 por día", premium: "40 por día" },
    { label: "Director de Crecimiento", icon: "trend", free: <No />, standard: <Yes />, premium: <Yes /> },
  ];

  const faqs = [
    {
      q: "¿Puedo comenzar con el plan Gratis?",
      a: "Sí. Podés publicar tu negocio sin costo y cambiar a Estándar o Premium cuando necesites más herramientas y visibilidad.",
    },
    {
      q: "¿Puedo cambiar de plan más adelante?",
      a: "Sí. Podrás mejorar tu plan cuando quieras desde tu cuenta. Las funciones disponibles se ajustarán al nuevo plan.",
    },
    {
      q: "¿Qué significa visibilidad destacada o máxima prioridad?",
      a: "Dentro de cada zona del buscador, Estándar aparece antes que Gratis y Premium obtiene la posición prioritaria, respetando siempre la cercanía del usuario.",
    },
    {
      q: "¿Mentor IA ya está disponible?",
      a: "Mentor IA está disponible en los planes Estándar y Premium, con 15 y 40 respuestas diarias respectivamente.",
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f8fafc_48%,_#eef2f7_100%)] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-[0.17em] text-red-600">
            <Icon name="sparkles" className="h-4 w-4" />
            Planes TusComercios
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Elegí cómo querés{" "}
            <span className="text-red-600">hacer crecer tu negocio</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-500 sm:text-lg">
            Publicá tu vidriera, creá contenido profesional y accedé a herramientas pensadas para conseguir más clientes.
          </p>
        </header>

        <section className="mx-auto mt-9 max-w-xl rounded-3xl border border-blue-100 bg-white p-5 text-left shadow-lg shadow-blue-950/5">
          <label className="text-sm font-black text-slate-900" htmlFor="commercial-code">
            ¿Tenés un cupón o código de vendedor?
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id="commercial-code"
              value={commercialCode}
              onChange={(event) => setCommercialCode(event.target.value.toUpperCase())}
              placeholder="Ingresá un solo código"
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold uppercase outline-none focus:border-blue-500"
            />
            {commercialCode && (
              <button type="button" onClick={() => setCommercialCode("")} className="rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-600">
                Quitar
              </button>
            )}
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-500">Podés usar uno: cupón de descuento o código de vendedor. No se acumulan.</p>
        </section>

        <section className="mt-14 grid gap-7 md:grid-cols-3">
          <PlanCard
            name="Gratis"
            eyebrow="Para empezar"
            price="$0"
            description="La forma más simple de publicar tu negocio y comenzar a aparecer en TusComercios."
            borderClass="border-slate-200"
            shadowClass="shadow-[0_18px_55px_rgba(15,23,42,0.06)]"
            buttonClass="border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
            loading={false}
            onClick={() => selectPlan("free")}
          >
            <Yes>5 fotos</Yes>
            <Yes>WhatsApp y horarios</Yes>
            <Yes>Presencia básica en búsquedas</Yes>
            <div className="flex items-center gap-2 text-slate-400"><No /> Sin Studio ni Mentor IA</div>
          </PlanCard>

          <PlanCard
            name="Estándar"
            eyebrow="Para crecer"
            price="$19.999"
            description="Más contenido, visibilidad destacada y acceso diario a TusComercios Studio."
            borderClass="border-red-500"
            shadowClass="shadow-[0_20px_60px_rgba(220,38,38,0.14)]"
            buttonClass="bg-red-600 text-white hover:bg-red-700"
            loading={loadingPlan === "standard"}
            onClick={() => selectPlan("standard")}
          >
            <Yes>10 fotos y 1 video</Yes>
            <Yes>Redes sociales visibles</Yes>
            <Yes>Studio: 10 imágenes, 1 Reel y 2 carruseles por día</Yes>
            <Yes>1 análisis creativo por editor y por día</Yes>
            <Yes>Mentor IA: 15 respuestas por día</Yes>
          </PlanCard>

          <PlanCard
            name="Premium"
            eyebrow="Para destacar"
            price="$29.999"
            description="La máxima prioridad, más capacidad de creación y todas las herramientas ampliadas."
            borderClass="border-blue-600"
            shadowClass="shadow-[0_20px_60px_rgba(37,99,235,0.16)]"
            buttonClass="bg-blue-600 text-white hover:bg-blue-700"
            loading={loadingPlan === "premium"}
            onClick={() => selectPlan("premium")}
            badge="Mayor visibilidad"
          >
            <Yes>15 fotos y 2 videos</Yes>
            <Yes>Mapa visible en la vidriera</Yes>
            <Yes>Studio: 20 imágenes, 2 Reels y 4 carruseles por día</Yes>
            <Yes>2 análisis creativos por editor y por día</Yes>
            <Yes>Mentor IA: 40 respuestas por día</Yes>
          </PlanCard>
        </section>

        <section className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Comparativa completa</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Todo claro, antes de elegir
            </h2>
            <p className="mt-4 text-slate-500">
              Compará cada herramienta y encontrá el nivel adecuado para tu negocio.
            </p>
          </div>

          <div className="mt-10 space-y-7">
            <ModuleCard
              icon="store"
              title="TusComercios"
              subtitle="Tu vidriera digital, contacto directo y visibilidad en las búsquedas."
              rows={tusComerciosRows}
              accent="red"
            />
            <ModuleCard
              icon="palette"
              title="TusComercios Studio"
              subtitle="Herramientas para crear imágenes, Reels y carruseles profesionales."
              rows={studioRows}
              accent="violet"
            />
            <ModuleCard
              icon="bot"
              title="Mentor IA"
              subtitle="Asesoramiento breve y personalizado para mejorar y hacer crecer tu negocio."
              rows={mentorRows}
              accent="blue"
            />
          </div>
        </section>

        <section className="mt-20 rounded-[34px] border border-slate-200 bg-white/80 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">El ecosistema que impulsa tu negocio</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Hoy y en el futuro, todo en un solo lugar
            </h2>
            <p className="mt-4 leading-7 text-slate-500">
              TusComercios seguirá incorporando herramientas para que pequeños negocios argentinos puedan atraer clientes, administrar mejor y crecer.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <FutureCard
              icon="package"
              title="TusComercios Gestión"
              description="Control de stock y contabilidad sencilla para ordenar el día a día."
              items={["Caja y ventas", "Stock e inventario", "Costos y gastos", "Contabilidad sencilla"]}
              accent="green"
            />
            <FutureCard
              icon="users"
              title="CRM"
              description="Un espacio para organizar clientes, consultas y oportunidades de venta."
              items={["Gestión de clientes", "Consultas y mensajes", "Seguimiento de ventas", "Historial de interacciones"]}
              accent="blue"
            />
            <FutureCard
              icon="wallet"
              title="Servicios financieros"
              description="Herramientas futuras de financiación para acompañar el crecimiento comercial."
              items={["Soluciones para comercios", "Herramientas financieras", "Previsto para Premium y futuro Empresarial"]}
              accent="orange"
            />
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Preguntas frecuentes</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">Antes de contratar</h2>
          </div>

          <div className="mt-9 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={faq.q} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="flex items-center gap-3 font-black text-slate-900">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
                        <Icon name="help" className="h-4.5 w-4.5" />
                      </span>
                      {faq.q}
                    </span>
                    <span className={`text-slate-400 transition ${isOpen ? "rotate-90" : ""}`}>
                      <Icon name="chevron" className="h-5 w-5" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-6 py-5 text-sm leading-7 text-slate-500">
                      {faq.a}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-20 rounded-[30px] bg-slate-950 px-7 py-9 text-white sm:px-10">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-600">
                <Icon name="shield" className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-black">¿Todavía tenés dudas?</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Hablá directamente con TusComercios. Te ayudamos a elegir el plan adecuado sin compromiso.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/5493544573187"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-700"
            >
              <Icon name="whatsapp" className="h-5 w-5" />
              3544-573187
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
