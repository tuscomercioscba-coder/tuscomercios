import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Info,
  UserPlus,
  CreditCard,
  Palette,
  Bot,
  CircleHelp,
  MessageCircle,
  Search,
  ChevronDown,
  CheckCircle2,
  Store,
  Images,
  Video,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Mail,
  Lightbulb,
  Bug,
  Send,
  Home,
  BriefcaseBusiness,
  Boxes,
  Calculator,
} from "lucide-react";

const sections = [
  { id: "quienes-somos", label: "Quiénes somos", icon: Info },
  { id: "como-registrarme", label: "Cómo me registro", icon: UserPlus },
  { id: "planes-y-pagos", label: "Planes y pagos", icon: CreditCard },
  { id: "studio", label: "TusComercios Studio", icon: Palette },
  { id: "mentor-ia", label: "Mentor IA", icon: Bot },
  { id: "administracion", label: "Gestión", icon: BriefcaseBusiness },
  { id: "preguntas-frecuentes", label: "Preguntas frecuentes", icon: CircleHelp },
  { id: "contacto", label: "Contáctanos", icon: MessageCircle },
];

const faqs = [
  {
    category: "Gestión",
    question: "¿Cómo pruebo y contrato TusComercios Gestión?",
    answer:
      "Ingresá con la cuenta titular del negocio, abrí Gestión y activá la prueba gratuita de 10 días. La prueba queda vinculada a ese negocio. Al finalizar podés contratar el servicio mensual mediante Mercado Pago.",
  },
  {
    category: "Registro",
    question: "¿Cómo publico mi negocio?",
    answer:
      "Creá una cuenta, elegí un plan, completá los datos de tu negocio y cargá las imágenes de tu vidriera. Después de guardar, tu negocio queda listo para aparecer en TusComercios.",
  },
  {
    category: "Registro",
    question: "¿Puedo modificar mi vidriera después de publicarla?",
    answer:
      "Sí. Desde tu Dashboard podés actualizar la descripción, horarios, imágenes, redes sociales y otros datos disponibles según tu plan.",
  },
  {
    category: "Planes",
    question: "¿Puedo comenzar con el plan Gratis?",
    answer:
      "Sí. El plan Gratis permite publicar una vidriera básica. Más adelante podés cambiar a Estándar o Premium para acceder a más visibilidad y herramientas.",
  },
  {
    category: "Planes",
    question: "¿Cómo se pagan los planes?",
    answer:
      "Las suscripciones se procesan mediante Mercado Pago y se renuevan mensualmente. Antes de confirmar siempre vas a ver el importe correspondiente.",
  },
  {
    category: "Planes",
    question: "¿Qué sucede si dejo de pagar?",
    answer:
      "Las funciones pagas dejan de estar disponibles y tu cuenta puede volver a las condiciones del plan gratuito. Tus datos no se eliminan automáticamente.",
  },
  {
    category: "Studio",
    question: "¿Qué incluye TusComercios Studio?",
    answer:
      "Incluye un editor de imágenes y Reels Studio. Los límites diarios dependen del plan Estándar o Premium.",
  },
  {
    category: "Mentor IA",
    question: "¿Qué hará Mentor IA?",
    answer:
      "Brindará respuestas breves y personalizadas para marketing, ventas y crecimiento del negocio. También incluirá un Director de Crecimiento.",
  },
  {
    category: "Soporte",
    question: "¿Cómo reporto un error o envío una sugerencia?",
    answer:
      "Desde la sección Contáctanos podés escribir por WhatsApp o correo, indicando el problema, la pantalla donde ocurrió y, si es posible, adjuntando una captura.",
  },
];

const Feature = ({ icon: FeatureIcon, title, text }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
      <FeatureIcon size={21} />
    </div>
    <h3 className="mt-4 font-black text-slate-950">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
  </article>
);

const Step = ({ number, title, text }) => (
  <article className="relative rounded-2xl border border-slate-200 bg-white p-5">
    <span className="grid h-10 w-10 place-items-center rounded-full bg-red-600 text-sm font-black text-white">
      {number}
    </span>
    <h3 className="mt-4 font-black text-slate-950">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
  </article>
);

export default function HelpCenter() {
  const { section } = useParams();
  const navigate = useNavigate();
  const activeSection = sections.some((item) => item.id === section)
    ? section
    : "quienes-somos";

  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  const filteredFaqs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return faqs;

    return faqs.filter((faq) =>
      `${faq.category} ${faq.question} ${faq.answer}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [query]);

  const goTo = (id) => navigate(`/ayuda/${id}`);

  const renderContent = () => {
    if (activeSection === "quienes-somos") {
      return (
        <>
          <div className="max-w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-red-600 to-red-700 p-5 text-white sm:rounded-[28px] sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-100">
              Nuestra historia
            </p>
            <h1 className="mt-3 break-words text-2xl font-black leading-tight sm:text-5xl">
              Una plataforma creada para conectar y hacer crecer
            </h1>
            <p className="mt-5 max-w-3xl leading-8 text-red-50">
              TusComercios conecta personas con comercios, profesionales, servicios y emprendimientos. Al mismo tiempo, desarrolla herramientas para que los pequeños negocios argentinos puedan mostrarse, crear contenido y crecer.
            </p>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            <Feature
              icon={Store}
              title="Más presencia"
              text="Cada negocio puede contar con su propia vidriera digital profesional."
            />
            <Feature
              icon={MapPin}
              title="Búsquedas cercanas"
              text="Las personas encuentran opciones en su localidad y zonas cercanas."
            />
            <Feature
              icon={ShieldCheck}
              title="Crecimiento responsable"
              text="La plataforma evoluciona sin prometer herramientas que todavía no están disponibles."
            />
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[26px] border border-slate-200 bg-white p-7">
              <h2 className="text-2xl font-black text-slate-950">Nuestra misión</h2>
              <p className="mt-4 leading-7 text-slate-600">
                Facilitar el encuentro entre personas y negocios, dando visibilidad a comercios locales y brindando herramientas simples que ayuden a vender, comunicar y administrar mejor.
              </p>
            </article>
            <article className="rounded-[26px] border border-blue-100 bg-blue-50 p-7">
              <h2 className="text-2xl font-black text-blue-950">Nuestra visión</h2>
              <p className="mt-4 leading-7 text-blue-800">
                Convertir TusComercios en un centro de operaciones para pequeños negocios argentinos: presencia, marketing, asesoramiento, administración, CRM y servicios financieros.
              </p>
            </article>
          </div>
        </>
      );
    }

    if (activeSection === "como-registrarme") {
      return (
        <>
          <SectionTitle
            eyebrow="Empezá paso a paso"
            title="Publicar tu negocio es simple"
            description="No necesitás conocimientos técnicos. La plataforma te guía durante todo el proceso."
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-2 2xl:grid-cols-5">
            <Step number="1" title="Crear una cuenta" text="Ingresá tus datos para tener acceso a tu panel." />
            <Step number="2" title="Elegir un plan" text="Podés comenzar Gratis o contratar Estándar o Premium." />
            <Step number="3" title="Cargar el negocio" text="Completá nombre, rubro, descripción, horarios y contacto." />
            <Step number="4" title="Subir contenido" text="Agregá las fotos y videos permitidos por tu plan." />
            <Step number="5" title="Publicar" text="Tu vidriera queda disponible para que puedan encontrarte." />
          </div>

          <article className="mt-8 rounded-[26px] border border-emerald-100 bg-emerald-50 p-7">
            <h2 className="text-xl font-black text-emerald-950">Consejo antes de publicar</h2>
            <p className="mt-3 leading-7 text-emerald-800">
              Usá una descripción clara, imágenes nítidas, horarios actualizados y un número de WhatsApp correcto. Esa información ayuda a que más personas se contacten.
            </p>
          </article>

          <button
            onClick={() => navigate("/login")}
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-700"
          >
            Comenzar ahora
            <ArrowRight size={19} />
          </button>
        </>
      );
    }

    if (activeSection === "planes-y-pagos") {
      return (
        <>
          <SectionTitle
            eyebrow="Planes claros"
            title="Elegí según las necesidades de tu negocio"
            description="Gratis para comenzar, Estándar para crecer y Premium para obtener la mayor visibilidad."
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <PlanSummary name="Gratis" price="$0" color="slate" text="Vidriera básica para comenzar a aparecer." />
            <PlanSummary name="Estándar" price="$19.999" color="red" text="Más contenido, Studio y visibilidad destacada." />
            <PlanSummary name="Premium" price="$29.999" color="blue" text="Máxima prioridad y herramientas ampliadas." />
          </div>

          <article className="mt-8 rounded-[26px] border border-slate-200 bg-white p-7">
            <h2 className="text-xl font-black text-slate-950">Pagos y renovación</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                "Las suscripciones pagas se procesan mediante Mercado Pago.",
                "El importe se muestra antes de confirmar la contratación.",
                "La renovación es mensual.",
                "Podés consultar o cambiar tu plan desde tu cuenta.",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </article>

          <button
            onClick={() => navigate("/planes")}
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 font-black text-white transition hover:bg-blue-700"
          >
            Ver comparación completa
            <ArrowRight size={19} />
          </button>
        </>
      );
    }

    if (activeSection === "studio") {
      return (
        <>
          <SectionTitle
            eyebrow="Creación de contenido"
            title="TusComercios Studio"
            description="Herramientas integradas para que un comercio pueda crear contenido sin depender de programas complicados."
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Feature
              icon={Images}
              title="Editor de imágenes"
              text="Creá piezas para redes sociales con textos, filtros, estilos, colores y recursos visuales."
            />
            <Feature
              icon={Video}
              title="Reels Studio"
              text="Armá videos cortos para promocionar productos, servicios, novedades y ofertas."
            />
            <Feature
              icon={Images}
              title="Editor de carruseles"
              text="Creá entre 4 y 10 páginas coordinadas, con plantillas por rubro, textos editables e imágenes independientes."
            />
          </div>

          <article className="mt-8 rounded-[26px] border border-violet-100 bg-violet-50 p-7">
            <h2 className="text-xl font-black text-violet-950">Límites por plan</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="text-sm text-violet-700">
                    <th className="pb-4">Herramienta</th>
                    <th className="pb-4 text-center">Gratis</th>
                    <th className="pb-4 text-center">Estándar</th>
                    <th className="pb-4 text-center">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-100 text-sm font-semibold text-violet-950">
                  <tr>
                    <td className="py-4">Editor de imágenes</td>
                    <td className="py-4 text-center">No incluido</td>
                    <td className="py-4 text-center">10 por día</td>
                    <td className="py-4 text-center">20 por día</td>
                  </tr>
                  <tr>
                    <td className="py-4">Reels Studio</td>
                    <td className="py-4 text-center">No incluido</td>
                    <td className="py-4 text-center">1 por día</td>
                    <td className="py-4 text-center">2 por día</td>
                  </tr>
                  <tr>
                    <td className="py-4">Editor de carruseles</td>
                    <td className="py-4 text-center">No incluido</td>
                    <td className="py-4 text-center">2 por día</td>
                    <td className="py-4 text-center">4 por día</td>
                  </tr>
                  <tr>
                    <td className="py-4">Análisis creativo por editor</td>
                    <td className="py-4 text-center">No incluido</td>
                    <td className="py-4 text-center">1 por día</td>
                    <td className="py-4 text-center">2 por día</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </>
      );
    }

    if (activeSection === "mentor-ia") {
      return (
        <>
          <SectionTitle
            eyebrow="Asesoramiento inteligente"
            title="Mentor IA"
            description="Una herramienta pensada para responder dudas comerciales y ayudar a encontrar oportunidades de crecimiento."
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <Feature icon={MessageCircle} title="Respuestas breves" text="Consejos concretos y fáciles de aplicar al negocio." />
            <Feature icon={Lightbulb} title="Ideas para crecer" text="Sugerencias de productos, servicios y mejoras comerciales." />
            <Feature icon={Bot} title="Director de Crecimiento" text="Orientación adaptada al rubro y realidad de cada comercio." />
          </div>

          <article className="mt-8 rounded-[26px] border border-blue-100 bg-blue-50 p-7">
            <h2 className="text-xl font-black text-blue-950">Disponibilidad</h2>
            <p className="mt-3 leading-7 text-blue-800">
              Mentor IA está disponible en los planes Estándar y Premium. El plan Estándar tiene hasta 15 respuestas por día y Premium hasta 40.
            </p>
          </article>
        </>
      );
    }

    if (activeSection === "administracion") {
      return (
        <>
          <SectionTitle
            eyebrow="Gestión integral"
            title="TusComercios Gestión"
            description="Controlá ventas, caja, stock, clientes, proveedores, presupuestos y resultados desde un mismo lugar."
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <Feature icon={Boxes} title="Productos y stock" text="Código de barras, stock mínimo, costos, precios, sucursales y alertas." />
            <Feature icon={CreditCard} title="Ventas y caja" text="Ventas rápidas, medios de pago, fiado, ingresos, egresos y cierre diario." />
            <Feature icon={Calculator} title="Decisiones claras" text="Costos, ganancias, gastos fijos y variables, presupuestos, remitos e informes." />
          </div>

          <article className="mt-8 rounded-[26px] border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-red-50 p-6 sm:p-8">
            <span className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
              10 días gratis
            </span>
            <h2 className="mt-5 text-2xl font-black text-slate-950">
              Probalo con tu propio negocio
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-700">
              La prueba se vincula automáticamente con el negocio de la cuenta que inició sesión. No necesitás cargar otra cuenta ni comunicarte con soporte. Después de los 10 días, el acceso se pausa hasta contratar el servicio por $24.999 mensuales.
            </p>
            <button
              type="button"
              onClick={() => navigate("/administracion")}
              className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-700 to-red-600 px-6 py-4 font-black text-white shadow-lg transition hover:scale-[1.02]"
            >
              Probar Gestión gratis
              <ArrowRight size={19} />
            </button>
          </article>
        </>
      );
    }

    if (activeSection === "preguntas-frecuentes") {
      return (
        <>
          <SectionTitle
            eyebrow="Centro de ayuda"
            title="Encontrá respuestas rápidamente"
            description="Buscá por palabras como registro, pagos, Studio, Mentor IA o soporte."
          />

          <div className="relative mt-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="¿Qué necesitás encontrar?"
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-14 pr-5 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="mt-7 space-y-4">
            {filteredFaqs.map((faq, index) => {
              const open = openFaq === index;
              return (
                <article key={faq.question} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                  >
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-red-600">
                        {faq.category}
                      </span>
                      <h3 className="mt-1 font-black text-slate-950">{faq.question}</h3>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
                    />
                  </button>

                  {open && (
                    <div className="border-t border-slate-100 px-5 py-5 text-sm leading-7 text-slate-600">
                      {faq.answer}
                    </div>
                  )}
                </article>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                No encontramos una respuesta. Podés escribirnos desde Contáctanos.
              </div>
            )}
          </div>
        </>
      );
    }

    return (
      <>
        <SectionTitle
          eyebrow="Soporte real"
          title="Estamos para ayudarte"
          description="Elegí el canal adecuado para consultas, errores, sugerencias o contacto comercial."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <ContactCard
            icon={MessageCircle}
            title="WhatsApp"
            text="Consultas generales, ayuda con el registro o inconvenientes con tu cuenta."
            action="Escribir por WhatsApp"
            href="https://wa.me/5493544573187"
            color="green"
          />
          <ContactCard
            icon={Mail}
            title="Correo electrónico"
            text="Ideal para enviar información detallada, documentación o capturas."
            action="Enviar correo"
            href="mailto:tuscomercioscba@gmail.com"
            color="blue"
          />
          <ContactCard
            icon={Bug}
            title="Reportar un error"
            text="Indicá qué estabas haciendo, qué pantalla falló y adjuntá una captura."
            action="Reportar por WhatsApp"
            href="https://wa.me/5493544573187?text=Hola%2C%20quiero%20reportar%20un%20error%20en%20TusComercios."
            color="red"
          />
          <ContactCard
            icon={Lightbulb}
            title="Enviar una sugerencia"
            text="Contanos qué función o mejora te gustaría ver en la plataforma."
            action="Enviar sugerencia"
            href="https://wa.me/5493544573187?text=Hola%2C%20quiero%20enviar%20una%20sugerencia%20para%20TusComercios."
            color="orange"
          />
        </div>

        <article className="mt-8 rounded-[26px] bg-slate-950 p-7 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Atención personalizada</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Nuestro número de contacto es 3544-573187.
              </p>
            </div>
            <a
              href="https://wa.me/5493544573187"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 font-black text-white"
            >
              <Send size={18} />
              Contactarnos
            </a>
          </div>
        </article>
      </>
    );
  };

  return (
    <>
      <Helmet>
        <title>Centro de Ayuda | TusComercios</title>
        <meta
          name="description"
          content="Conocé TusComercios, aprendé a registrar tu negocio, compará planes y encontrá respuestas sobre Studio, Mentor IA y soporte."
        />
      </Helmet>

      <div className="min-h-screen w-full overflow-x-hidden bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
            <button onClick={() => navigate("/")} className="flex items-center gap-3">
              <img src="/logo.png" alt="Tus Comercios" className="w-32 sm:w-48" />
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 sm:px-4"
            >
              <Home size={17} />
              <span className="hidden sm:inline">Volver al inicio</span>
            </button>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-4 px-3 py-4 sm:gap-7 sm:px-6 sm:py-8 xl:grid-cols-[270px_minmax(0,1fr)] xl:py-12">
          <aside className="min-w-0 h-fit rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm xl:sticky xl:top-6">
            <div className="px-3 py-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">TusComercios</p>
              <h2 className="mt-2 text-xl font-black text-slate-950">Centro de Ayuda</h2>
            </div>

            <nav className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex xl:flex-col">
              {sections.map(({ id, label, icon: SectionIcon }) => {
                const active = id === activeSection;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => goTo(id)}
                    className={`flex min-w-0 items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-bold leading-tight transition sm:text-sm xl:w-full xl:gap-3 xl:px-4 ${
                      active
                        ? "bg-red-600 text-white shadow-lg shadow-red-100"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <SectionIcon size={18} />
                    {label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 max-w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:rounded-[30px] sm:p-8 xl:p-10">
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <header>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">{eyebrow}</p>
      <h1 className="mt-3 break-words text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-3xl leading-7 text-slate-500">{description}</p>
    </header>
  );
}

function PlanSummary({ name, price, text, color }) {
  const classes = {
    slate: "border-slate-300 shadow-slate-100",
    red: "border-red-500 shadow-red-100",
    blue: "border-blue-600 shadow-blue-100",
  };

  return (
    <article className={`rounded-[26px] border-2 bg-white p-6 shadow-xl ${classes[color]}`}>
      <h3 className="text-2xl font-black text-slate-950">{name}</h3>
      <div className="mt-4 text-3xl font-black text-slate-950">
        {price}
        <span className="ml-2 text-sm font-semibold text-slate-400">/ mes</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{text}</p>
    </article>
  );
}

function ContactCard({ icon: ContactIcon, title, text, action, href, color }) {
  const colors = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    red: "bg-red-50 text-red-700 border-red-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
  };

  return (
    <article className="rounded-[26px] border border-slate-200 bg-white p-6">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl border ${colors[color]}`}>
        <ContactIcon size={23} />
      </div>
      <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex items-center gap-2 font-black text-slate-900 hover:text-red-600"
      >
        {action}
        <ArrowRight size={17} />
      </a>
    </article>
  );
}
