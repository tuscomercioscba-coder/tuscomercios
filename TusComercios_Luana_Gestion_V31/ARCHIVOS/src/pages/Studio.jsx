import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Layout from "../components/Layout";
import StudioLibrary from "../components/studio/StudioLibrary";
import StudioWorkspaceSelector from "../components/studio/StudioWorkspaceSelector";

const PLAN_LIMITS = {
  standard: { image: 10, reel: 1, carousel: 2 },
  premium: { image: 20, reel: 2, carousel: 4 },
};

export default function Studio() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [usage, setUsage] = useState({ image: 0, reel: 0, carousel: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isContentCreator, setIsContentCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingUsage, setLoadingUsage] = useState(false);

  useEffect(() => {
    loadStudio();
  }, []);

  useEffect(() => {
    if (
      selectedItem?.entityType === "business" &&
      selectedItem?.id
    ) {
      loadDailyUsage(selectedItem.id);
    } else {
      setUsage({ image: 0, reel: 0, carousel: 0 });
    }
  }, [selectedItem?.id, selectedItem?.entityType]);

  const isWorkspace = selectedItem?.entityType === "workspace";
  const unlimited = isAdmin || isContentCreator || isWorkspace;

  const limits = useMemo(() => {
    if (unlimited) {
      return {
        image: Infinity,
        reel: Infinity,
        carousel: Infinity,
      };
    }

    const plan = String(
      selectedItem?.plan || "standard"
    ).toLowerCase();

    return PLAN_LIMITS[plan] || PLAN_LIMITS.standard;
  }, [selectedItem?.plan, unlimited]);

  const imageRemaining = unlimited
    ? Infinity
    : Math.max(0, limits.image - usage.image);

  const reelRemaining = unlimited
    ? Infinity
    : Math.max(0, limits.reel - usage.reel);

  const carouselRemaining = unlimited
    ? Infinity
    : Math.max(0, limits.carousel - usage.carousel);

  async function loadStudio() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const admin =
        String(profile?.role || "").toLowerCase() === "admin";

      setIsAdmin(admin);
      setIsContentCreator(
        String(profile?.role || "").toLowerCase() === "content_creator"
      );

      const businessPromise = supabase
        .from("businesses")
        .select(
          "id, negocio, slug, plan, image, ciudad, rubro, user_id"
        )
        .eq("user_id", user.id)
        .order("negocio", { ascending: true });

      const workspacePromise = admin
        ? supabase
          .from("studio_workspaces")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: true })
        : Promise.resolve({
          data: [],
          error: null,
        });

      const [businessResult, workspaceResult] =
        await Promise.all([
          businessPromise,
          workspacePromise,
        ]);

      if (businessResult.error) {
        console.error(businessResult.error);
      }

      if (workspaceResult.error) {
        console.error(workspaceResult.error);
      }

      const ownBusinesses =
        businessResult.data || [];

      const visibleBusinesses = admin
        ? ownBusinesses
        : ownBusinesses.filter((business) => {
          const plan = String(
            business.plan || ""
          ).toLowerCase();

          return (
            plan === "standard" ||
            plan === "premium"
          );
        });

      const ownWorkspaces = admin
        ? workspaceResult.data || []
        : [];

      setBusinesses(visibleBusinesses);
      setWorkspaces(ownWorkspaces);

      if (ownWorkspaces.length > 0) {
        setSelectedItem({
          ...ownWorkspaces[0],
          entityType: "workspace",
        });
      } else if (visibleBusinesses.length > 0) {
        setSelectedItem({
          ...visibleBusinesses[0],
          entityType: "business",
        });
      } else {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error(error);
      setWorkspaces([]);
      setBusinesses([]);
      setSelectedItem(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadDailyUsage(businessId) {
    try {
      setLoadingUsage(true);

      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("studio_usage")
        .select("content_type")
        .eq("business_id", businessId)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (error) {
        console.error(error);
        setUsage({
          image: 0,
          reel: 0,
          carousel: 0,
        });
        return;
      }

      const counts = {
        image: 0,
        reel: 0,
        carousel: 0,
      };

      (data || []).forEach((item) => {
        if (item.content_type === "image") {
          counts.image += 1;
        }

        if (item.content_type === "reel") {
          counts.reel += 1;
        }
        if (item.content_type === "carousel") {
          counts.carousel += 1;
        }
      });

      setUsage(counts);
    } finally {
      setLoadingUsage(false);
    }
  }

  function openBrandKit() {
    if (!selectedItem) return;

    navigate(
      `/studio/brand/${isWorkspace ? "workspace" : "business"
      }/${selectedItem.id}`
    );
  }

  function openMentor() {
    if (!selectedItem) return;

    const plan = String(
      selectedItem?.plan || "standard"
    ).toLowerCase();

    if (
      !isAdmin &&
      !isWorkspace &&
      plan !== "standard" &&
      plan !== "premium"
    ) {
      alert(
        "Mentor IA está disponible en los planes Estándar y Premium."
      );
      return;
    }

    navigate(
      `/studio/mentor/${isWorkspace ? "workspace" : "business"
      }/${selectedItem.id}`
    );
  }

  function openImageEditor() {
    if (!selectedItem) return;

    if (
      !isAdmin &&
      !isWorkspace &&
      imageRemaining <= 0
    ) {
      alert(
        "Alcanzaste el límite diario de imágenes."
      );
      return;
    }

    navigate(
      `/studio/imagen/${isWorkspace ? "workspace" : "business"
      }/${selectedItem.id}`
    );
  }

  function openReelEditor() {
    if (!selectedItem) return;

    if (
      !isAdmin &&
      !isWorkspace &&
      reelRemaining <= 0
    ) {
      alert(
        "Alcanzaste el límite diario de reels."
      );
      return;
    }

    navigate(
      `/generar-reel/${isWorkspace ? "workspace" : "business"
      }/${selectedItem.id}`
    );
  }

  function openCarouselEditor() {
    if (!selectedItem) return;

    if (!isAdmin && !isWorkspace && carouselRemaining <= 0) {
      alert("Alcanzaste el límite diario de carruseles.");
      return;
    }

    navigate(
      `/studio/carrusel/${isWorkspace ? "workspace" : "business"}/${selectedItem.id}`
    );
  }

  function openStories() {
    if (isWorkspace) {
      alert("Las historias se publican desde un comercio.");
      return;
    }
    navigate("/studio/historias");
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
          <div className="rounded-[2rem] bg-white p-8 text-center shadow-xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-5 text-xl font-black text-slate-950">
              Cargando TusComercios Studio...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const hasItems =
    workspaces.length > 0 ||
    businesses.length > 0;

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_top,#eff6ff_0,#f8fafc_42%,#f1f5f9_100%)]">
        <div className="mx-auto max-w-7xl space-y-5 p-3 pb-10 sm:p-4 md:p-6">
          <Hero
            selectedItem={selectedItem}
            isAdmin={isAdmin}
          />

          {!hasItems ? (
            <EmptyState
              isAdmin={isAdmin}
              onPlans={() =>
                navigate("/planes")
              }
            />
          ) : (
            <>
              <StudioWorkspaceSelector
                workspaces={workspaces}
                businesses={businesses}
                selectedItem={selectedItem}
                onSelect={setSelectedItem}
                isAdmin={isAdmin}
              />

              <section className="space-y-4">
                <SectionHeader
                  eyebrow="Paso 1"
                  title="Definí la identidad de tu negocio"
                  description="Configurá una sola vez el logo, los colores y las tipografías que Studio usará en tu contenido."
                />

                <JourneyCard
                  step="1"
                  title="Brand Kit"
                  description={
                    isWorkspace
                      ? "Configurá la identidad institucional de TusComercios."
                      : "Configurá el logo, los colores y las tipografías del comercio."
                  }
                  action="Configurar Brand Kit"
                  gradient="from-blue-600 to-indigo-700"
                  onClick={openBrandKit}
                />
              </section>

              <section className="space-y-4">
                <SectionHeader
                  eyebrow="Paso 2"
                  title="Planeá qué contenido crear"
                  description="Pedile a Mentor IA ideas, promociones, campañas y orientación para usar Studio."
                />

                <JourneyCard
                  step="2"
                  title="Mentor IA"
                  description="Recibí ideas para vender más, crear promociones y preparar imágenes o reels."
                  action="Hablar con Mentor IA"
                  gradient="from-violet-600 to-fuchsia-700"
                  onClick={openMentor}
                />
              </section>

              <section className="space-y-4">
                <SectionHeader
                  eyebrow="Paso 3"
                  title="Creá tu contenido"
                  description={
                    isWorkspace
                      ? "Diseñá contenido institucional para promocionar TusComercios."
                      : "Usá la identidad de tu Brand Kit para crear contenido del comercio."
                  }
                />

                <div className="grid gap-4 lg:grid-cols-3">
                  <ToolCard
                    type="image"
                    title="Crear imágenes"
                    description={
                      isWorkspace
                        ? "Diseños institucionales y campañas de TusComercios."
                        : "Posts, promociones y novedades para redes."
                    }
                    used={usage.image}
                    limit={limits.image}
                    remaining={imageRemaining}
                    unlimited={unlimited}
                    loading={loadingUsage}
                    onClick={openImageEditor}
                  />

                  <ToolCard
                    type="carousel"
                    title="Crear carruseles"
                    description={
                      isWorkspace
                        ? "Carruseles institucionales con páginas coordinadas."
                        : "Entre 4 y 10 páginas con guiones preparados según tu rubro."
                    }
                    used={usage.carousel}
                    limit={limits.carousel}
                    remaining={carouselRemaining}
                    unlimited={unlimited}
                    loading={loadingUsage}
                    onClick={openCarouselEditor}
                  />

                  <ToolCard
                    type="reel"
                    title="Crear reels"
                    description={
                      isWorkspace
                        ? "Capturas, recorridos y campañas reales de la plataforma."
                        : "Videos verticales con escenas, textos, audio y transiciones."
                    }
                    used={usage.reel}
                    limit={limits.reel}
                    remaining={reelRemaining}
                    unlimited={unlimited}
                    loading={loadingUsage}
                    onClick={openReelEditor}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <SectionHeader
                  eyebrow="Paso 4"
                  title="Publicá y programá"
                  description="Convertí el contenido creado en historias y organizá la semana desde el calendario."
                />

                <JourneyCard
                  step="4"
                  title="Historias y calendario"
                  description="Publicá imágenes o videos durante 24 horas, agregá botones y programá cada contenido."
                  action="Abrir calendario"
                  gradient="from-red-600 to-blue-700"
                  onClick={openStories}
                />
              </section>

              <section className="space-y-4">
                <SectionHeader
                  eyebrow="Paso 5"
                  title="Biblioteca"
                  description="Acá vas a encontrar el contenido creado y guardado en Studio."
                />

                <StudioLibrary
                  selectedItem={selectedItem}
                />
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

function Hero({
  selectedItem,
  isAdmin,
}) {
  const workspace =
    selectedItem?.entityType === "workspace";

  const name = workspace
    ? selectedItem?.name
    : selectedItem?.negocio;

  return (
    <header className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-violet-900 p-6 text-white shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">
        {isAdmin
          ? "Panel administrador"
          : "Departamento de marketing"}
      </p>

      <h1 className="mt-3 text-3xl font-black md:text-5xl">
        TusComercios Studio
      </h1>

      <p className="mt-3 max-w-3xl font-semibold leading-7 text-blue-100">
        Creá la identidad, planificá con Mentor IA y diseñá contenido profesional para tu negocio.
      </p>

      {selectedItem && (
        <div className="mt-5 inline-flex rounded-2xl bg-white/10 px-4 py-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-200">
              {workspace
                ? "Espacio activo"
                : "Comercio activo"}
            </p>

            <p className="mt-1 text-lg font-black">
              {name}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-2xl font-black text-slate-950 md:text-3xl">
        {title}
      </h2>

      <p className="mt-2 max-w-3xl font-semibold leading-7 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function JourneyCard({
  step,
  title,
  description,
  action,
  gradient,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-[2rem] border border-white bg-white text-left shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-xl font-black text-white shadow-lg`}
          >
            {step}
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-950">
              {title}
            </h3>

            <p className="mt-2 max-w-3xl font-semibold leading-7 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <div className="shrink-0 rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white transition group-hover:bg-blue-700">
          {action} →
        </div>
      </div>
    </button>
  );
}

function ToolCard({
  type,
  title,
  description,
  used,
  limit,
  remaining,
  unlimited,
  loading,
  onClick,
}) {
  const image = type === "image";

  const gradient = image
    ? "from-blue-600 to-indigo-600"
    : "from-violet-600 to-fuchsia-600";

  const percent = unlimited
    ? 0
    : Math.min(100, Math.round((used / limit) * 100));

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="rounded-[2rem] border border-white bg-white p-6 text-left shadow-xl transition hover:-translate-y-1 hover:shadow-2xl disabled:opacity-60"
    >
      <div
        className={`inline-flex rounded-2xl bg-gradient-to-r ${gradient} px-4 py-3 font-black text-white`}
      >
        {title}
      </div>

      <p className="mt-4 font-semibold leading-7 text-slate-600">
        {description}
      </p>

      {!unlimited && (
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs font-black text-slate-500">
            <span>Uso de hoy</span>
            <span>
              {used} / {limit}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      <p className="mt-5 text-sm font-black text-emerald-600">
        {unlimited
          ? `Uso ilimitado · ${used} creados hoy`
          : `${remaining} disponibles hoy`}
      </p>
    </button>
  );
}

function LibraryComingSoon() {
  return (
    <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-7 text-center shadow-lg">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        📚
      </div>

      <h3 className="mt-4 text-2xl font-black text-slate-950">
        Próximamente
      </h3>

      <p className="mx-auto mt-2 max-w-2xl font-semibold leading-7 text-slate-500">
        La Biblioteca permitirá guardar, organizar y reutilizar las imágenes y los reels creados en Studio.
      </p>
    </section>
  );
}

function EmptyState({
  isAdmin,
  onPlans,
}) {
  return (
    <section className="rounded-[2rem] bg-white p-8 text-center shadow-xl">
      <h2 className="text-2xl font-black text-slate-950">
        {isAdmin
          ? "No se encontró el workspace ni comercios"
          : "Studio requiere un plan pago"}
      </h2>

      {!isAdmin && (
        <button
          type="button"
          onClick={onPlans}
          className="mt-5 rounded-2xl bg-blue-600 px-6 py-3 font-black text-white"
        >
          Ver planes
        </button>
      )}
    </section>
  );
}
