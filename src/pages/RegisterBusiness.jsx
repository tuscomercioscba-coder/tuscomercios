import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../supabase";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  BriefcaseBusiness,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Crown,
  Share2,
  FileImage,
  Globe2,
  ImagePlus,
  AtSign,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Palette,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  UploadCloud,
  Video,
  WandSparkles,
  X,
} from "lucide-react";

const GEOREF_BASE = "https://apis.datos.gob.ar/georef/api/v2.0";

const DIAS_ORDEN = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const DIAS_LABEL = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

const PLAN_LIMITS = {
  free: {
    maxImages: 5,
    maxDescription: 280,
    social: false,
    web: false,
    video: false,
    services: false,
  },
  standard: {
    maxImages: 10,
    maxDescription: 1000,
    social: true,
    web: false,
    video: false,
    services: false,
  },
  premium: {
    maxImages: 15,
    maxDescription: 3000,
    social: true,
    web: true,
    video: true,
    services: true,
  },
};

const FALLBACK_PROVINCES = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Ciudad Autónoma de Buenos Aires",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
  "Tucumán",
];

const FALLBACK_LOCALITIES = {
  Córdoba: [
    "Alta Gracia",
    "Bell Ville",
    "Carlos Paz",
    "Córdoba",
    "Cosquín",
    "Cruz del Eje",
    "Deán Funes",
    "Jesús María",
    "La Falda",
    "Las Rabonas",
    "Las Tapias",
    "Los Hornillos",
    "Mina Clavero",
    "Nono",
    "Río Cuarto",
    "Río Tercero",
    "San Francisco",
    "San Javier y Yacanto",
    "San Pedro",
    "Villa Cura Brochero",
    "Villa de las Rosas",
    "Villa Dolores",
    "Villa María",
  ],
  "San Luis": [
    "Carpintería",
    "Concarán",
    "Cortaderas",
    "Juana Koslay",
    "La Punta",
    "La Toma",
    "Los Molles",
    "Naschel",
    "San Luis",
    "Santa Rosa del Conlara",
    "Tilisarao",
    "Villa de Merlo",
    "Villa Mercedes",
  ],
};

function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyDay() {
  return {
    enabled: false,
    mode: "continuous",
    open: "",
    close: "",
    open2: "",
    close2: "",
  };
}

function emptyHorarios() {
  return DIAS_ORDEN.reduce((acc, dia) => {
    acc[dia] = emptyDay();
    return acc;
  }, {});
}

function parseSavedSchedule(value) {
  if (!value || value === "Cerrado") return emptyDay();

  const turns = String(value)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  const [open = "", close = ""] = (turns[0] || "")
    .split("-")
    .map((part) => part.trim());

  const [open2 = "", close2 = ""] = (turns[1] || "")
    .split("-")
    .map((part) => part.trim());

  return {
    enabled: Boolean(open && close),
    mode: open2 && close2 ? "split" : "continuous",
    open,
    close,
    open2,
    close2,
  };
}

function getScheduleCompletion(horarios) {
  return DIAS_ORDEN.some((dia) => {
    const value = horarios[dia];
    return value?.enabled && value.open && value.close;
  });
}

function calculateCompletion(form, horarios, previewImages) {
  const checks = [
    Boolean(form.negocio?.trim()),
    Boolean(form.rubro?.trim()),
    Boolean(form.provincia),
    Boolean(form.ciudad),
    Boolean(form.direccion?.trim()),
    Boolean(form.lat && form.lng),
    (form.descripcion || "").trim().length >= 40,
    Boolean(form.whatsapp?.trim()),
    getScheduleCompletion(horarios),
    Boolean(form.image || previewImages[0]),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function formatPlanName(plan) {
  if (plan === "standard") return "Estándar";
  if (plan === "premium") return "Premium";
  return "Gratis";
}

function SectionCard({ icon: Icon, eyebrow, title, description, children, id }) {
  return (
    <section
      id={id}
      className="scroll-mt-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-7"
    >
      <header className="mb-6 flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white">
          <Icon size={23} />
        </span>

        <div>
          {eyebrow && (
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-600">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </header>

      {children}
    </section>
  );
}

function FieldLabel({ children, optional = false }) {
  return (
    <span className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
      {children}
      {optional && (
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Opcional
        </span>
      )}
    </span>
  );
}

function ModernInput({ icon: Icon, className = "", ...props }) {
  return (
    <label className={`flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 ${className}`}>
      {Icon && <Icon size={19} className="shrink-0 text-slate-400" />}
      <input
        {...props}
        className="min-h-[52px] w-full bg-transparent px-3 text-sm font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
      />
    </label>
  );
}

function ModernSelect({ icon: Icon, children, className = "", ...props }) {
  return (
    <label className={`relative flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 ${className}`}>
      {Icon && <Icon size={19} className="shrink-0 text-slate-400" />}
      <select
        {...props}
        className="min-h-[52px] w-full appearance-none bg-transparent px-3 pr-9 text-sm font-semibold text-slate-900 outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-4 text-slate-400"
      />
    </label>
  );
}

function UpgradeCard({
  icon: Icon,
  title,
  description,
  requiredPlan,
  onUpgrade,
  color = "blue",
}) {
  const classes = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    amber: "border-blue-100 bg-blue-50 text-blue-700",
  };

  return (
    <article className={`rounded-2xl border p-5 ${classes[color]}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/80 shadow-sm">
            <Icon size={21} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black">{title}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em]">
                <LockKeyhole size={12} />
                {requiredPlan}
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 opacity-80">
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5"
        >
          Comparar planes
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}

function CompletionCard({
  completion,
  missingItems,
  onGoToField,
  plan,
  maxImages,
  maxDescription,
}) {
  const strong = completion >= 80;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-600">
            Calidad de la vidriera
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            {strong ? "Tu vidriera está casi lista" : "Completá bien todos los datos"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Una vidriera completa transmite más confianza y tiene más posibilidades de recibir consultas reales.
          </p>
        </div>

        <div className={`grid h-20 w-20 shrink-0 place-items-center rounded-full border-8 ${strong ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-blue-100 bg-blue-50 text-blue-700"}`}>
          <span className="text-xl font-black">{completion}%</span>
        </div>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${strong ? "bg-emerald-500" : "bg-blue-500"}`}
          style={{ width: `${completion}%` }}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {missingItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => !item.done && onGoToField(item.section)}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
              item.done
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
            }`}
          >
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${item.done ? "bg-emerald-600 text-white" : "bg-white text-slate-400"}`}>
              {item.done ? <Check size={15} /> : <span className="h-2.5 w-2.5 rounded-full border-2 border-current" />}
            </span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
        <ShieldCheck size={19} />
        Plan {formatPlanName(plan)} · Hasta {maxImages} fotos · Descripción de hasta {maxDescription} caracteres
      </div>
    </section>
  );
}

function ScheduleDay({
  day,
  value,
  onChange,
  onCopyMonday,
  canCopyMonday,
}) {
  const enabled = Boolean(value?.enabled);
  const mode = value?.mode || "continuous";

  const update = (field, nextValue) => {
    onChange(day, field, nextValue);
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => update("enabled", !enabled)}
            className={`relative h-7 w-12 rounded-full transition ${enabled ? "bg-emerald-500" : "bg-slate-300"}`}
            aria-label={`${enabled ? "Cerrar" : "Abrir"} ${DIAS_LABEL[day]}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${enabled ? "left-6" : "left-1"}`} />
          </button>
          <div>
            <h3 className="font-black text-slate-950">{DIAS_LABEL[day]}</h3>
            <p className={`text-xs font-bold ${enabled ? "text-emerald-600" : "text-slate-400"}`}>
              {enabled ? "Abierto" : "Cerrado"}
            </p>
          </div>
        </div>

        {day !== "lunes" && canCopyMonday && (
          <button
            type="button"
            onClick={() => onCopyMonday(day)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:text-blue-600"
          >
            <Copy size={14} />
            Copiar lunes
          </button>
        )}
      </div>

      {enabled && (
        <div className="mt-5">
          <div className="mb-4 inline-flex rounded-xl bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => update("mode", "continuous")}
              className={`rounded-lg px-3 py-2 text-xs font-black transition ${mode === "continuous" ? "bg-slate-950 text-white" : "text-slate-500"}`}
            >
              Horario corrido
            </button>
            <button
              type="button"
              onClick={() => update("mode", "split")}
              className={`rounded-lg px-3 py-2 text-xs font-black transition ${mode === "split" ? "bg-slate-950 text-white" : "text-slate-500"}`}
            >
              Horario cortado
            </button>
          </div>

          <div className={`grid gap-3 ${mode === "split" ? "sm:grid-cols-4" : "sm:grid-cols-2"}`}>
            <TimeField
              label="Abre"
              value={value.open || ""}
              onChange={(next) => update("open", next)}
            />
            <TimeField
              label="Cierra"
              value={value.close || ""}
              onChange={(next) => update("close", next)}
            />

            {mode === "split" && (
              <>
                <TimeField
                  label="Vuelve a abrir"
                  value={value.open2 || ""}
                  onChange={(next) => update("open2", next)}
                />
                <TimeField
                  label="Cierra"
                  value={value.close2 || ""}
                  onChange={(next) => update("close2", next)}
                />
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function TimeField({ label, value, onChange }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
        {label}
      </span>
      <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3">
        <Clock3 size={17} className="text-slate-400" />
        <input
          type="time"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[48px] w-full bg-transparent px-3 text-sm font-bold text-slate-900 outline-none"
        />
      </div>
    </label>
  );
}

function PreviewCard({ form, previewImages, limits }) {
  const mainImage = form.image || previewImages[0];

  return (
    <aside className="lg:sticky lg:top-6">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
            Vista previa
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            Así se verá tu negocio
          </h2>
        </div>

        <div className="aspect-[16/9] bg-slate-100">
          {mainImage ? (
            <img
              src={mainImage}
              alt="Vista previa del negocio"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="grid h-full place-items-center text-slate-400">
              <div className="text-center">
                <Camera size={42} className="mx-auto" />
                <p className="mt-3 text-sm font-black">Todavía no cargaste una foto</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                {form.negocio || "Nombre del negocio"}
              </h3>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <MapPin size={16} className="text-red-500" />
                {form.ciudad || "Localidad"}
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-blue-700">
              {form.plan === "premium" ? <Crown size={14} /> : <Store size={14} />}
              {formatPlanName(form.plan)}
            </span>
          </div>

          {form.rubro && (
            <p className="mt-4 text-xs font-black uppercase tracking-[0.1em] text-blue-600">
              {form.rubro}
            </p>
          )}

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
            {form.descripcion || "La descripción de tu negocio aparecerá en este lugar."}
          </p>

          {form.whatsapp && (
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white"
            >
              <MessageCircle size={17} />
              Contactar por WhatsApp
            </button>
          )}

          {limits.services && form.servicios && (
            <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-4">
              <h4 className="font-black text-violet-950">
                Servicios destacados
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {form.servicios
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .slice(0, 6)
                  .map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-violet-700"
                    >
                      {item}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-800">
        <div className="flex gap-3">
          <Sparkles size={20} className="shrink-0" />
          <p>
            Revisá la vista previa mientras cargás los datos. Una foto clara, una buena descripción y horarios completos generan más confianza.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default function RegisterBusiness() {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const planParam = searchParams.get("plan");
  const isAdmin = searchParams.get("admin") === "true";

  const [userPlan, setUserPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loading, setLoading] = useState(false);

  const [provinces, setProvinces] = useState(FALLBACK_PROVINCES);
  const [localities, setLocalities] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [form, setForm] = useState({
    negocio: "",
    rubro: "",
    ciudad: "",
    provincia: "",
    direccion: "",
    descripcion: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    email: "",
    web: "",
    servicios: "",
    image: "",
    images: [],
    video: "",
    lat: null,
    lng: null,
    plan: planParam || "free",
    status: "published",
  });

  const activePlan = isAdmin
    ? form.plan || "free"
    : id
      ? form.plan || "free"
      : userPlan || form.plan || "free";

  const limits = PLAN_LIMITS[activePlan] || PLAN_LIMITS.free;

  const [horarios, setHorarios] = useState(emptyHorarios());
  const [images, setImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    loadInitialData();
    loadProvinces();
  }, [id]);

  useEffect(() => {
    if (form.provincia) {
      loadLocalities(form.provincia);
    } else {
      setLocalities([]);
    }
  }, [form.provincia]);

  async function loadProvinces() {
    setLoadingProvinces(true);

    try {
      const response = await fetch(
        `${GEOREF_BASE}/provincias?campos=id,nombre&max=100`
      );

      if (!response.ok) throw new Error("No se pudieron cargar provincias");

      const data = await response.json();
      const names = (data.provincias || [])
        .map((item) => item.nombre)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es"));

      if (names.length) setProvinces(names);
    } catch (error) {
      console.warn("Georef no respondió; se usa lista local.", error);
      setProvinces(FALLBACK_PROVINCES);
    } finally {
      setLoadingProvinces(false);
    }
  }

  async function loadLocalities(provinceName) {
    setLoadingLocalities(true);

    try {
      const query = new URLSearchParams({
        provincia: provinceName,
        campos: "id,nombre,provincia",
        max: "5000",
      });

      const response = await fetch(
        `${GEOREF_BASE}/localidades?${query.toString()}`
      );

      if (!response.ok) throw new Error("No se pudieron cargar localidades");

      const data = await response.json();
      const names = [...new Set(
        (data.localidades || [])
          .map((item) => item.nombre)
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b, "es"));

      if (names.length) {
        setLocalities(names);
        return;
      }

      setLocalities(FALLBACK_LOCALITIES[provinceName] || []);
    } catch (error) {
      console.warn("Georef no respondió; se usa lista local.", error);
      setLocalities(FALLBACK_LOCALITIES[provinceName] || []);
    } finally {
      setLoadingLocalities(false);
    }
  }

  async function loadInitialData() {
    setLoadingPlan(true);
    const realPlan = await loadUserPlan();

    if (id) {
      await loadBusiness(realPlan);
    }

    setLoadingPlan(false);
  }

  async function loadUserPlan() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserPlan(null);
      return null;
    }

    if (isAdmin) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profile?.plan) {
      setUserPlan(profile.plan);

      if (!id) {
        setForm((previous) => ({
          ...previous,
          plan: profile.plan,
        }));
      }

      return profile.plan;
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subscription?.plan) {
      setUserPlan(subscription.plan);

      if (!id) {
        setForm((previous) => ({
          ...previous,
          plan: subscription.plan,
        }));
      }

      return subscription.plan;
    }

    setUserPlan(null);
    return null;
  }

  async function loadBusiness() {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    if (!data) return;

    const finalPlan = data.plan || "free";
    const finalLimits = PLAN_LIMITS[finalPlan] || PLAN_LIMITS.free;

    setForm({
      ...data,
      rubro: data.rubro || "",
      direccion: data.direccion || "",
      video: data.video || "",
      servicios: data.servicios || "",
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      status: data.status || "published",
      plan: finalPlan,
    });

    const parsedSchedules = {};
    DIAS_ORDEN.forEach((day) => {
      parsedSchedules[day] = parseSavedSchedule(data.horarios?.[day]);
    });
    setHorarios(parsedSchedules);

    if (Array.isArray(data.images) && data.images.length > 0) {
      setPreviewImages(data.images.slice(0, finalLimits.maxImages));
    } else if (data.image) {
      setPreviewImages([data.image]);
    }
  }

  function goToPlans() {
    navigate("/planes");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "descripcion" && value.length > limits.maxDescription) return;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleProvinceChange(event) {
    const province = event.target.value;

    setForm((previous) => ({
      ...previous,
      provincia: province,
      ciudad: "",
    }));
  }

  function handleCityChange(event) {
    setForm((previous) => ({
      ...previous,
      ciudad: event.target.value,
    }));
  }

  function handleHorarioChange(day, field, value) {
    setHorarios((previous) => ({
      ...previous,
      [day]: {
        ...previous[day],
        [field]: value,
        ...(field === "mode" && value === "continuous"
          ? { open2: "", close2: "" }
          : {}),
      },
    }));
  }

  function copyMondayToDay(day) {
    setHorarios((previous) => ({
      ...previous,
      [day]: { ...previous.lunes },
    }));
  }

  function applyMondayToWeekdays() {
    const monday = horarios.lunes;

    if (!monday?.enabled || !monday.open || !monday.close) {
      alert("Primero completá el horario del lunes.");
      return;
    }

    setHorarios((previous) => {
      const updated = { ...previous };

      ["martes", "miercoles", "jueves", "viernes"].forEach((day) => {
        updated[day] = { ...monday };
      });

      return updated;
    });
  }

  function addImageFiles(files) {
    const selected = Array.from(files || []).filter((file) =>
      file.type?.startsWith("image/")
    );

    if (!selected.length) return;

    const availableSlots = Math.max(0, limits.maxImages - previewImages.length);

    if (selected.length > availableSlots) {
      alert(`Tu plan permite hasta ${limits.maxImages} fotos.`);
    }

    const accepted = selected.slice(0, availableSlots);
    const newPreviews = accepted.map((file) => URL.createObjectURL(file));

    setImages((previous) => [...previous, ...accepted]);
    setPreviewImages((previous) => [...previous, ...newPreviews]);

    if (!form.image && newPreviews[0]) {
      setForm((previous) => ({
        ...previous,
        image: newPreviews[0],
      }));
    }
  }

  function removePreview(index) {
    const previewToRemove = previewImages[index];

    setPreviewImages((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );

    setImages((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );

    if (form.image === previewToRemove) {
      const remaining = previewImages.filter(
        (_, currentIndex) => currentIndex !== index
      );

      setForm((previous) => ({
        ...previous,
        image: remaining[0] || "",
      }));
    }
  }

  function handleVideo(files) {
    const file = files?.[0];

    if (!limits.video) {
      alert("El video está disponible en el plan Premium.");
      return;
    }

    if (file) setVideoFile(file);
  }

  async function getLocation() {
    if (!navigator.geolocation) {
      alert("Tu navegador no permite obtener la ubicación.");
      return;
    }

    if (!form.provincia || !form.ciudad || !form.direccion.trim()) {
      alert("Primero completá provincia, localidad y dirección del negocio.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((previous) => ({
          ...previous,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        setLocationLoading(false);
      },
      (error) => {
        console.error(error);
        setLocationLoading(false);
        alert("No pudimos obtener la ubicación. Verificá el permiso del navegador.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  async function optimizeImage(file) {
    if (!file?.type?.startsWith("image/")) return file;

    try {
      const imageUrl = URL.createObjectURL(file);

      const image = await new Promise((resolve, reject) => {
        const instance = new Image();
        instance.onload = () => resolve(instance);
        instance.onerror = reject;
        instance.src = imageUrl;
      });

      const maxSize = 1600;
      let width = image.width;
      let height = image.height;

      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height >= width && height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(imageUrl);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.78);
      });

      if (!blob) return file;

      const originalName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      return new File(
        [blob],
        `${originalName || "imagen"}-optimizada.jpg`,
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        }
      );
    } catch (error) {
      console.warn("No se pudo optimizar la imagen.", error);
      return file;
    }
  }

  async function uploadFile(file, folder = "business-images") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    }

    const fileToUpload = file?.type?.startsWith("image/")
      ? await optimizeImage(file)
      : file;

    const cleanName = fileToUpload.name
      .replace(/\s+/g, "-")
      .replace(/[^\w.-]/g, "")
      .toLowerCase();

    const fileName = `${user.id}/${Date.now()}-${cleanName}`;

    const { error } = await supabase.storage
      .from(folder)
      .upload(fileName, fileToUpload, {
        cacheControl: "31536000",
        upsert: true,
        contentType:
          fileToUpload.type || "application/octet-stream",
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from(folder)
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  }

  const remainingChars =
    limits.maxDescription - (form.descripcion || "").length;

  const completion = useMemo(
    () => calculateCompletion(form, horarios, previewImages),
    [form, horarios, previewImages]
  );

  const missingItems = useMemo(
    () => [
      {
        label: "Nombre y rubro",
        done: Boolean(form.negocio?.trim() && form.rubro?.trim()),
        section: "datos-principales",
      },
      {
        label: "Provincia y localidad",
        done: Boolean(form.provincia && form.ciudad),
        section: "ubicacion",
      },
      {
        label: "Dirección exacta",
        done: Boolean(form.direccion?.trim()),
        section: "ubicacion",
      },
      {
        label: "Ubicación GPS confirmada",
        done: Boolean(form.lat && form.lng),
        section: "ubicacion",
      },
      {
        label: "Descripción completa",
        done: (form.descripcion || "").trim().length >= 40,
        section: "descripcion-contacto",
      },
      {
        label: "WhatsApp",
        done: Boolean(form.whatsapp?.trim()),
        section: "descripcion-contacto",
      },
      {
        label: "Horarios",
        done: getScheduleCompletion(horarios),
        section: "horarios",
      },
      {
        label: "Foto principal",
        done: Boolean(form.image || previewImages[0]),
        section: "multimedia",
      },
    ],
    [form, horarios, previewImages]
  );

  function goToField(sectionId) {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        navigate("/login");
        return;
      }

      const requiredErrors = [];

      if (!form.negocio.trim()) requiredErrors.push("nombre del negocio");
      if (!form.rubro.trim()) requiredErrors.push("rubro");
      if (!form.provincia) requiredErrors.push("provincia");
      if (!form.ciudad) requiredErrors.push("localidad");
      if (!form.direccion.trim()) requiredErrors.push("dirección");
      if (!form.whatsapp.trim()) requiredErrors.push("WhatsApp");
      if ((form.descripcion || "").trim().length < 40) {
        requiredErrors.push("descripción de al menos 40 caracteres");
      }
      if (!getScheduleCompletion(horarios)) requiredErrors.push("horarios");
      if (!(form.image || previewImages[0])) requiredErrors.push("foto principal");

      if (requiredErrors.length) {
        alert(
          `Antes de publicar completá: ${requiredErrors.join(", ")}.`
        );
        return;
      }

      const existingRemoteImages = (form.images || []).filter(
        (url) => typeof url === "string" && !url.startsWith("blob:")
      );

      const uploadedUrls = [];
      for (const file of images) {
        uploadedUrls.push(
          await uploadFile(file, "business-images")
        );
      }

      const finalImages = [
        ...existingRemoteImages,
        ...uploadedUrls,
      ].slice(0, limits.maxImages);

      let videoUrl = form.video || "";
      if (videoFile) {
        videoUrl = await uploadFile(
          videoFile,
          "business-images"
        );
      }

      const horariosFinal = {};
      DIAS_ORDEN.forEach((day) => {
        const schedule = horarios[day];

        if (
          !schedule?.enabled ||
          !schedule.open ||
          !schedule.close
        ) {
          horariosFinal[day] = "Cerrado";
          return;
        }

        const turns = [`${schedule.open}-${schedule.close}`];

        if (
          schedule.mode === "split" &&
          schedule.open2 &&
          schedule.close2
        ) {
          turns.push(
            `${schedule.open2}-${schedule.close2}`
          );
        }

        horariosFinal[day] = turns.join(" / ");
      });

      let mainImage = form.image || "";

      if (mainImage.startsWith("blob:")) {
        const selectedIndex =
          previewImages.indexOf(mainImage);
        mainImage =
          uploadedUrls[selectedIndex] ||
          uploadedUrls[0] ||
          finalImages[0] ||
          "";
      }

      if (!mainImage) {
        mainImage = finalImages[0] || "";
      }

      const payload = {
        ...form,
        slug:
          form.slug ||
          slugify(
            `${form.negocio}-${form.ciudad || Date.now()}`
          ),
        plan: id
          ? form.plan || "free"
          : activePlan,
        user_id: id
          ? form.user_id || userData.user.id
          : userData.user.id,
        image: mainImage,
        images: finalImages,
        video: limits.video ? videoUrl : "",
        facebook: limits.social ? form.facebook : "",
        instagram: limits.social ? form.instagram : "",
        tiktok: limits.social ? form.tiktok : "",
        email: limits.social ? form.email : "",
        web: limits.web ? form.web : "",
        servicios: limits.services
          ? form.servicios
          : "",
        horarios: horariosFinal,
        lat: form.lat,
        lng: form.lng,
        status: "published",
      };

      const response = id
        ? await supabase
            .from("businesses")
            .update(payload)
            .eq("id", id)
        : await supabase
            .from("businesses")
            .insert([payload]);

      if (response.error) {
        console.error(response.error);
        alert(
          response.error.message ||
            "No pudimos guardar el negocio."
        );
        return;
      }

      alert("Tu vidriera se guardó correctamente.");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("ERROR GENERAL:", error);
      alert("Ocurrió un error al guardar el negocio.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingPlan) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 font-black text-slate-700 shadow-lg">
          <Loader2 size={22} className="animate-spin text-blue-600" />
          Preparando tu vidriera...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f8fafc_55%,_#eef2f7_100%)] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-sm font-black text-slate-500 transition hover:text-slate-950"
          >
            ← Volver al panel
          </button>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
                {id ? "Editar vidriera" : "Nueva vidriera"}
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                {id ? "Actualizá tu negocio" : "Publicá tu negocio"}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">
                Tomate un minuto para completar correctamente la información. Los datos precisos ayudan a que las personas encuentren tu negocio y se contacten.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 self-start rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-black text-blue-800">
              <BadgeCheck size={20} />
              Plan {formatPlanName(activePlan)}
            </div>
          </div>
        </header>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
          <div className="space-y-6">
            <CompletionCard
              completion={completion}
              missingItems={missingItems}
              onGoToField={goToField}
              plan={activePlan}
              maxImages={limits.maxImages}
              maxDescription={limits.maxDescription}
            />

            {isAdmin && (
              <section className="rounded-[26px] border border-blue-200 bg-blue-50 p-5">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-blue-700 shadow-sm">
                    <ShieldCheck size={21} />
                  </span>
                  <div className="flex-1">
                    <FieldLabel>Plan asignado al negocio</FieldLabel>
                    <ModernSelect
                      name="plan"
                      value={form.plan || "free"}
                      onChange={handleChange}
                    >
                      <option value="free">Gratis</option>
                      <option value="standard">Estándar</option>
                      <option value="premium">Premium</option>
                    </ModernSelect>
                    <p className="mt-2 text-xs leading-5 text-blue-700">
                      Esta opción solo aparece en modo administrador.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {!isAdmin && id && activePlan !== "premium" && (
              <section className="overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-950 to-blue-950 p-6 text-white shadow-xl">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">
                      Más herramientas
                    </p>
                    <h2 className="mt-2 text-xl font-black">
                      Mejorá la presentación y visibilidad
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                      Compará los planes para sumar más fotos, redes sociales, video y otras funciones.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={goToPlans}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950"
                  >
                    Ver planes
                    <ArrowRight size={17} />
                  </button>
                </div>
              </section>
            )}

            <SectionCard
              id="datos-principales"
              icon={Store}
              eyebrow="Paso 1"
              title="Datos principales"
              description="Usá el nombre comercial y un rubro claro para que las personas entiendan rápidamente qué ofrecés."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <FieldLabel>Nombre del negocio</FieldLabel>
                  <ModernInput
                    icon={Store}
                    name="negocio"
                    placeholder="Ej.: Panadería San José"
                    value={form.negocio}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  <FieldLabel>Rubro principal</FieldLabel>
                  <ModernInput
                    icon={BriefcaseBusiness}
                    name="rubro"
                    placeholder="Ej.: Panadería, plomería, estética"
                    value={form.rubro || ""}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </SectionCard>

            <SectionCard
              id="ubicacion"
              icon={MapPin}
              eyebrow="Paso 2"
              title="Ubicación exacta"
              description="La provincia, localidad y dirección deben corresponder al lugar donde funciona el negocio. Esto se usa para ordenar por cercanía."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <FieldLabel>Provincia</FieldLabel>
                  <ModernSelect
                    icon={Globe2}
                    value={form.provincia || ""}
                    onChange={handleProvinceChange}
                    disabled={loadingProvinces}
                  >
                    <option value="">
                      {loadingProvinces
                        ? "Cargando provincias..."
                        : "Seleccionar provincia"}
                    </option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </ModernSelect>
                </label>

                <label>
                  <FieldLabel>Localidad</FieldLabel>
                  <ModernSelect
                    icon={MapPin}
                    value={form.ciudad || ""}
                    onChange={handleCityChange}
                    disabled={!form.provincia || loadingLocalities}
                  >
                    <option value="">
                      {!form.provincia
                        ? "Primero elegí provincia"
                        : loadingLocalities
                          ? "Cargando localidades..."
                          : "Seleccionar localidad"}
                    </option>
                    {localities.map((locality) => (
                      <option key={locality} value={locality}>
                        {locality}
                      </option>
                    ))}
                  </ModernSelect>
                </label>
              </div>

              <div className="mt-5">
                <FieldLabel>Dirección del negocio</FieldLabel>
                <ModernInput
                  icon={Navigation}
                  name="direccion"
                  placeholder="Calle, número y barrio si corresponde"
                  value={form.direccion}
                  onChange={handleChange}
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  No agregues “centro” dentro del nombre de la localidad. El barrio o la zona deben escribirse en la dirección.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <Navigation size={20} />
                    </span>
                    <div>
                      <h3 className="font-black text-blue-950">
                        Confirmar ubicación GPS
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-blue-800">
                        Hacelo estando en el negocio. Así evitamos mostrar distancias incorrectas.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={locationLoading}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {locationLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <MapPin size={18} />
                    )}
                    {form.lat && form.lng
                      ? "Actualizar ubicación"
                      : "Usar ubicación actual"}
                  </button>
                </div>

                {form.lat && form.lng && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-black text-emerald-700">
                    <CheckCircle2 size={19} />
                    Ubicación confirmada correctamente
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              id="descripcion-contacto"
              icon={MessageCircle}
              eyebrow="Paso 3"
              title="Descripción y contacto"
              description="Contá qué hacés, qué productos o servicios ofrecés y qué diferencia a tu negocio."
            >
              <label>
                <FieldLabel>Descripción del negocio</FieldLabel>
                <textarea
                  name="descripcion"
                  placeholder="Ej.: Somos una panadería artesanal con elaboración diaria, tortas personalizadas y pedidos para eventos..."
                  value={form.descripcion}
                  onChange={handleChange}
                  maxLength={limits.maxDescription}
                  className="min-h-[150px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
                <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500">
                    Recomendado: al menos 40 caracteres.
                  </span>
                  <span className={`font-black ${remainingChars < 30 ? "text-red-600" : "text-slate-500"}`}>
                    {form.descripcion.length}/{limits.maxDescription}
                  </span>
                </div>
              </label>

              <div className="mt-5">
                <FieldLabel>WhatsApp</FieldLabel>
                <ModernInput
                  icon={Phone}
                  name="whatsapp"
                  inputMode="numeric"
                  placeholder="Ej.: 3544573187"
                  value={form.whatsapp}
                  onChange={handleChange}
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Ingresá solo el número. El sistema agrega automáticamente el código de Argentina.
                </p>
              </div>

              <div className="mt-6">
                {limits.social ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <AtSign size={20} />
                      </span>
                      <div>
                        <h3 className="font-black text-slate-950">
                          Redes sociales y email
                        </h3>
                        <p className="text-xs text-slate-500">
                          Agregá solamente los canales que utilizás.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <ModernInput
                        icon={Share2}
                        name="facebook"
                        placeholder="Facebook"
                        value={form.facebook || ""}
                        onChange={handleChange}
                      />
                      <ModernInput
                        icon={AtSign}
                        name="instagram"
                        placeholder="Instagram"
                        value={form.instagram || ""}
                        onChange={handleChange}
                      />
                      <ModernInput
                        icon={Bot}
                        name="tiktok"
                        placeholder="TikTok"
                        value={form.tiktok || ""}
                        onChange={handleChange}
                      />
                      <ModernInput
                        icon={Mail}
                        name="email"
                        type="email"
                        placeholder="Correo electrónico"
                        value={form.email || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                ) : (
                  <UpgradeCard
                    icon={AtSign}
                    title="Redes sociales y email"
                    requiredPlan="Estándar"
                    description="Mostrá Instagram, Facebook, TikTok y correo electrónico para sumar canales de contacto."
                    onUpgrade={goToPlans}
                    color="blue"
                  />
                )}
              </div>
            </SectionCard>

            <SectionCard
              id="horarios"
              icon={Clock3}
              eyebrow="Paso 4"
              title="Horarios de atención"
              description="Marcá los días abiertos y elegí horario corrido o cortado. Podés copiar el lunes para ahorrar tiempo."
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm leading-6 text-slate-500">
                  Los días sin horario quedarán visibles como “Cerrado”.
                </p>
                <button
                  type="button"
                  onClick={applyMondayToWeekdays}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white transition hover:bg-slate-800"
                >
                  <Copy size={15} />
                  Aplicar lunes a viernes
                </button>
              </div>

              <div className="space-y-3">
                {DIAS_ORDEN.map((day) => (
                  <ScheduleDay
                    key={day}
                    day={day}
                    value={horarios[day]}
                    onChange={handleHorarioChange}
                    onCopyMonday={copyMondayToDay}
                    canCopyMonday={Boolean(
                      horarios.lunes?.enabled &&
                        horarios.lunes.open &&
                        horarios.lunes.close
                    )}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              id="multimedia"
              icon={ImagePlus}
              eyebrow="Paso 5"
              title="Fotos y video"
              description="Elegí imágenes claras del local, productos, servicios o trabajos realizados. La primera foto será la principal."
            >
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  addImageFiles(event.dataTransfer.files);
                }}
                className="rounded-[24px] border-2 border-dashed border-blue-200 bg-blue-50 p-7 text-center transition hover:border-blue-400"
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm">
                  <UploadCloud size={27} />
                </span>
                <h3 className="mt-4 text-lg font-black text-blue-950">
                  Arrastrá tus fotos aquí
                </h3>
                <p className="mt-2 text-sm leading-6 text-blue-800">
                  También podés seleccionarlas desde tu dispositivo.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  <FileImage size={17} />
                  Seleccionar imágenes
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => addImageFiles(event.target.files)}
                  className="hidden"
                />
                <p className="mt-3 text-xs font-bold text-blue-700">
                  {previewImages.length}/{limits.maxImages} fotos utilizadas
                </p>
              </div>

              {previewImages.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {previewImages.map((image, index) => {
                    const selected = form.image === image || (!form.image && index === 0);

                    return (
                      <article
                        key={`${image}-${index}`}
                        className={`group relative overflow-hidden rounded-2xl border-2 bg-slate-100 ${selected ? "border-blue-600" : "border-transparent"}`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setForm((previous) => ({
                              ...previous,
                              image,
                            }))
                          }
                          className="block aspect-square w-full"
                        >
                          <img
                            src={image}
                            alt={`Foto ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>

                        <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setForm((previous) => ({
                                ...previous,
                                image,
                              }))
                            }
                            className={`rounded-lg px-2.5 py-2 text-[10px] font-black uppercase tracking-[0.08em] shadow ${selected ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`}
                          >
                            {selected ? "Principal" : "Elegir"}
                          </button>

                          <button
                            type="button"
                            onClick={() => removePreview(index)}
                            className="grid h-9 w-9 place-items-center rounded-lg bg-white text-red-600 shadow"
                            aria-label="Eliminar imagen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="mt-6">
                {limits.video ? (
                  <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
                          <Video size={21} />
                        </span>
                        <div>
                          <h3 className="font-black text-violet-950">
                            Video del negocio
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-violet-800">
                            Mostrá el local, productos, servicios o una presentación breve.
                          </p>
                        </div>
                      </div>

                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white">
                        <Video size={17} />
                        Elegir video
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(event) => handleVideo(event.target.files)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {(videoFile || form.video) && (
                      <div className="mt-4 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-black text-violet-700">
                        <CheckCircle2 size={18} />
                        {videoFile
                          ? videoFile.name
                          : "Video guardado"}
                      </div>
                    )}
                  </div>
                ) : (
                  <UpgradeCard
                    icon={Video}
                    title="Video del negocio"
                    requiredPlan="Premium"
                    description="Agregá un video para mostrar tu local, productos, trabajos o presentación profesional."
                    onUpgrade={goToPlans}
                    color="violet"
                  />
                )}
              </div>
            </SectionCard>

            <SectionCard
              id="funciones-plan"
              icon={WandSparkles}
              eyebrow="Paso 6"
              title="Funciones adicionales"
              description="Estas opciones mejoran la presentación de la vidriera según el plan contratado."
            >
              <div className="space-y-4">
                {limits.web ? (
                  <div>
                    <FieldLabel optional>Sitio web</FieldLabel>
                    <ModernInput
                      icon={Globe2}
                      name="web"
                      placeholder="https://..."
                      value={form.web || ""}
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <UpgradeCard
                    icon={Globe2}
                    title="Sitio web"
                    requiredPlan="Premium"
                    description="Mostrá la web oficial de tu negocio dentro de la vidriera."
                    onUpgrade={goToPlans}
                    color="blue"
                  />
                )}

                {limits.services ? (
                  <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
                    <FieldLabel optional>
                      Servicios destacados
                    </FieldLabel>
                    <textarea
                      name="servicios"
                      placeholder={"Escribí un servicio por línea.\nEjemplo:\nTortas personalizadas\nCatering para eventos"}
                      value={form.servicios || ""}
                      onChange={handleChange}
                      className="min-h-[140px] w-full resize-y rounded-2xl border border-violet-100 bg-white p-4 text-sm font-semibold leading-7 text-slate-900 outline-none focus:ring-4 focus:ring-violet-100"
                    />
                    <p className="mt-2 text-xs leading-5 text-violet-700">
                      Se mostrarán hasta seis servicios principales en la vista previa.
                    </p>
                  </div>
                ) : (
                  <UpgradeCard
                    icon={Palette}
                    title="Servicios destacados"
                    requiredPlan="Premium"
                    description="Mostrá productos o servicios principales en una sección especial de la vidriera."
                    onUpgrade={goToPlans}
                    color="violet"
                  />
                )}
              </div>
            </SectionCard>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white">
                    <Save size={23} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Revisá y publicá
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      Antes de guardar, verificá especialmente la localidad, dirección, ubicación GPS, horarios y WhatsApp.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex min-h-[54px] shrink-0 items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-7 text-base font-black text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={20} />
                  )}
                  {loading
                    ? "Guardando..."
                    : id
                      ? "Guardar cambios"
                      : "Publicar mi vidriera"}
                </button>
              </div>
            </section>
          </div>

          <PreviewCard
            form={{ ...form, plan: activePlan }}
            previewImages={previewImages}
            limits={limits}
          />
        </div>
      </div>
    </main>
  );
}
