import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import { normalizeStoryPlan } from "../Stories/storyUtils";

const CTA_OPTIONS = [
  ["none", "Sin botón"],
  ["whatsapp", "Consultar por WhatsApp"],
  ["showcase", "Ver vidriera"],
  ["product", "Ver producto o servicio"],
];

function whatsappUrl(number, businessName) {
  const digits = String(number || "").replace(/\D/g, "").replace(/^0/, "");
  const normalized = digits.startsWith("54") ? digits : `549${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(
    `Hola ${businessName}, llegué desde una historia de TusComercios`
  )}`;
}

export default function StoriesManager() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState("");
  const [stories, setStories] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [ctaType, setCtaType] = useState("whatsapp");
  const [ctaLabel, setCtaLabel] = useState("Consultar");
  const [ctaUrl, setCtaUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [publishMode, setPublishMode] = useState("now");
  const [saving, setSaving] = useState(false);

  const selectedBusiness = businesses.find((item) => item.id === businessId);
  const plan = normalizeStoryPlan(selectedBusiness?.plan);
  const dailyLimit = plan === "premium" ? 10 : plan === "standard" ? 5 : 0;

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!businessId) return;
    loadStories(businessId);
    const business = businesses.find((item) => item.id === businessId);
    if (business && ctaType === "whatsapp") {
      setCtaUrl(whatsappUrl(business.whatsapp, business.negocio));
    }
  }, [businessId]);

  async function load() {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      navigate("/login");
      return;
    }
    setUser(authData.user);
    const { data } = await supabase
      .from("businesses")
      .select("id,negocio,slug,plan,whatsapp,image")
      .eq("user_id", authData.user.id)
      .order("negocio");
    const eligible = (data || []).filter((item) =>
      ["standard", "estandar", "premium"].includes(
        String(item.plan || "").toLowerCase()
      )
    );
    setBusinesses(eligible);
    if (eligible[0]) setBusinessId(eligible[0].id);
  }

  async function loadStories(id) {
    const { data } = await supabase
      .from("business_stories")
      .select("*")
      .eq("business_id", id)
      .order("scheduled_at", { ascending: false });
    const withMetrics = await Promise.all(
      (data || []).map(async (story) => {
        const [{ count: views }, { count: clicks }] = await Promise.all([
          supabase
            .from("story_views")
            .select("id", { count: "exact", head: true })
            .eq("story_id", story.id),
          supabase
            .from("story_clicks")
            .select("id", { count: "exact", head: true })
            .eq("story_id", story.id),
        ]);
        return { ...story, views: views || 0, clicks: clicks || 0 };
      })
    );
    setStories(withMetrics);
  }

  function chooseCta(value) {
    setCtaType(value);
    if (value === "none") {
      setCtaLabel("");
      setCtaUrl("");
    } else if (value === "whatsapp" && selectedBusiness) {
      setCtaLabel("Consultar por WhatsApp");
      setCtaUrl(
        whatsappUrl(selectedBusiness.whatsapp, selectedBusiness.negocio)
      );
    } else if (value === "showcase" && selectedBusiness) {
      setCtaLabel("Ver vidriera");
      setCtaUrl(`${window.location.origin}/${selectedBusiness.slug}`);
    } else {
      setCtaLabel("Ver más");
      setCtaUrl("");
    }
  }

  async function validateFile(selected) {
    if (!selected) return false;
    if (!selected.type.startsWith("image/") && !selected.type.startsWith("video/")) {
      alert("Elegí una imagen o un video.");
      return false;
    }
    if (selected.type.startsWith("video/")) {
      if (!["video/mp4", "video/webm"].includes(selected.type)) {
        alert("Los videos deben ser MP4 o WebM.");
        return false;
      }
      if (selected.size > 15 * 1024 * 1024) {
        alert("El video supera los 15 MB.");
        return false;
      }
      const duration = await new Promise((resolve) => {
        const video = document.createElement("video");
        const url = URL.createObjectURL(selected);
        video.onloadedmetadata = () => {
          resolve(video.duration);
          URL.revokeObjectURL(url);
        };
        video.onerror = () => {
          resolve(999);
          URL.revokeObjectURL(url);
        };
        video.src = url;
      });
      if (duration > 30) {
        alert("El video debe durar como máximo 30 segundos.");
        return false;
      }
    } else if (selected.size > 8 * 1024 * 1024) {
      alert("La imagen supera los 8 MB.");
      return false;
    }
    return true;
  }

  async function publish(event) {
    event.preventDefault();
    if (!user || !selectedBusiness || !file || saving) return;
    if (!(await validateFile(file))) return;
    try {
      setSaving(true);
      const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${user.id}/${selectedBusiness.id}/stories/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("business-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage
        .from("business-images")
        .getPublicUrl(path);

      if (publishMode === "schedule" && !scheduledAt) {
        alert("Elegí la fecha y hora para programar la historia.");
        return;
      }
      const schedule =
        publishMode === "schedule"
          ? new Date(scheduledAt).toISOString()
          : new Date().toISOString();
      const { error } = await supabase.rpc("create_business_story", {
        p_business_id: selectedBusiness.id,
        p_media_type: file.type.startsWith("video/") ? "video" : "image",
        p_media_url: publicData.publicUrl,
        p_thumbnail_url: null,
        p_caption: caption,
        p_cta_type: ctaType,
        p_cta_label: ctaLabel,
        p_cta_url: ctaUrl,
        p_scheduled_at: schedule,
      });
      if (error) {
        await supabase.storage.from("business-images").remove([path]);
        throw error;
      }
      setFile(null);
      setCaption("");
      setScheduledAt("");
      await loadStories(selectedBusiness.id);
      alert(
        publishMode === "schedule"
          ? "Historia programada correctamente."
          : "Historia publicada ahora."
      );
    } catch (error) {
      alert(error.message || "No se pudo guardar la historia.");
    } finally {
      setSaving(false);
    }
  }

  async function removeStory(story) {
    if (!confirm("¿Eliminar esta historia?")) return;
    const { error } = await supabase.from("business_stories").delete().eq("id", story.id);
    if (error) return alert(error.message);
    const marker = "/business-images/";
    const storagePath = decodeURIComponent(story.media_url.split(marker)[1] || "");
    if (storagePath) await supabase.storage.from("business-images").remove([storagePath]);
    loadStories(selectedBusiness.id);
  }

  const calendarGroups = useMemo(() => {
    return stories.reduce((groups, story) => {
      const day = new Date(story.scheduled_at).toLocaleDateString("es-AR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      });
      groups[day] ||= [];
      groups[day].push(story);
      return groups;
    }, {});
  }, [stories]);

  return (
    <Layout fullWidth>
      <main className="min-h-screen bg-slate-100 p-3 pb-24 md:p-6">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] bg-gradient-to-r from-red-600 via-blue-700 to-blue-950 p-6 text-white shadow-xl">
            <button onClick={() => navigate("/studio")} className="text-sm font-black text-white/80">
              ← Volver a Studio
            </button>
            <h1 className="mt-3 text-3xl font-black">Historias y calendario</h1>
            <p className="mt-2 font-semibold text-white/80">
              Publicá ahora o prepará toda la semana desde un solo lugar.
            </p>
          </header>

          {businesses.length === 0 ? (
            <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow">
              <h2 className="text-xl font-black">Historias disponibles desde Estándar</h2>
              <button onClick={() => navigate("/planes")} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-black text-white">
                Ver planes
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[390px_1fr]">
              <form onSubmit={publish} className="h-fit rounded-3xl bg-white p-5 shadow-xl">
                <h2 className="text-xl font-black">Nueva historia</h2>
                <label className="mt-5 block text-sm font-black">Comercio</label>
                <select value={businessId} onChange={(e) => setBusinessId(e.target.value)} className="mt-2 w-full rounded-xl border p-3 font-bold">
                  {businesses.map((item) => <option key={item.id} value={item.id}>{item.negocio}</option>)}
                </select>
                <p className="mt-2 text-xs font-bold text-blue-600">
                  Plan {plan}: hasta {dailyLimit} historias por día
                </p>

                <label className="mt-5 block text-sm font-black">Imagen o video</label>
                <input required type="file" accept="image/*,video/mp4,video/webm" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-2 w-full rounded-xl border p-3" />

                <label className="mt-5 block text-sm font-black">Texto</label>
                <textarea value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={500} className="mt-2 min-h-24 w-full rounded-xl border p-3" placeholder="Contá la oferta, producto o servicio..." />

                <label className="mt-5 block text-sm font-black">Botón</label>
                <select value={ctaType} onChange={(e) => chooseCta(e.target.value)} className="mt-2 w-full rounded-xl border p-3 font-bold">
                  {CTA_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                {ctaType !== "none" && (
                  <>
                    <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className="mt-3 w-full rounded-xl border p-3" placeholder="Texto del botón" />
                    <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} className="mt-3 w-full rounded-xl border p-3" placeholder="Enlace de destino" />
                  </>
                )}

                <label className="mt-5 block text-sm font-black">¿Cuándo se publica?</label>
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPublishMode("now");
                      setScheduledAt("");
                    }}
                    className={`rounded-xl px-3 py-3 text-sm font-black ${
                      publishMode === "now"
                        ? "bg-red-600 text-white shadow"
                        : "text-slate-600"
                    }`}
                  >
                    Publicar ahora
                  </button>
                  <button
                    type="button"
                    onClick={() => setPublishMode("schedule")}
                    className={`rounded-xl px-3 py-3 text-sm font-black ${
                      publishMode === "schedule"
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-600"
                    }`}
                  >
                    Programar
                  </button>
                </div>
                {publishMode === "schedule" && (
                  <input
                    required
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="mt-3 w-full rounded-xl border p-3"
                  />
                )}

                <button disabled={saving || !file} className="mt-5 w-full rounded-2xl bg-red-600 px-5 py-4 font-black text-white disabled:opacity-50">
                  {saving
                    ? "Guardando..."
                    : publishMode === "schedule"
                      ? "Programar historia"
                      : "Publicar ahora"}
                </button>
              </form>

              <section className="rounded-3xl bg-white p-5 shadow-xl">
                <h2 className="text-xl font-black">Calendario de contenido</h2>
                <div className="mt-5 space-y-5">
                  {Object.keys(calendarGroups).length === 0 && <p className="text-slate-500">Todavía no hay historias.</p>}
                  {Object.entries(calendarGroups).map(([day, dayStories]) => (
                    <div key={day}>
                      <h3 className="mb-3 capitalize font-black text-blue-700">{day}</h3>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {dayStories.map((story) => (
                          <article key={story.id} className="overflow-hidden rounded-2xl border bg-slate-50">
                            {story.media_type === "video" ? (
                              <video src={story.media_url} preload="metadata" muted playsInline className="aspect-[9/16] max-h-60 w-full bg-black object-contain" />
                            ) : (
                              <img src={story.media_url} className="aspect-[9/16] max-h-60 w-full object-cover" alt="" />
                            )}
                            <div className="p-3">
                              <p className="text-xs font-black uppercase text-slate-400">{story.status}</p>
                              <p className="mt-1 text-sm font-bold">{new Date(story.scheduled_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</p>
                              <p className="mt-2 text-xs font-bold text-slate-500">
                                {story.views || 0} vistas · {story.clicks || 0} clics
                              </p>
                              <button type="button" onClick={() => removeStory(story)} className="mt-3 text-sm font-black text-red-600">Eliminar</button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
