import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";
import Layout from "../components/Layout";
import { Helmet } from "react-helmet-async";

const DIAS_ORDEN = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

export default function BusinessView() {
  const { slug } = useParams();

  const [business, setBusiness] = useState(null);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [canPreviewDraft, setCanPreviewDraft] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    getBusiness();
  }, [slug]);

  function formatWhatsappNumber(number) {
    if (!number) return "";

    let clean = number.toString().replace(/\D/g, "");

    if (clean.startsWith("00")) clean = clean.slice(2);
    if (clean.startsWith("549")) return clean;
    if (clean.startsWith("54")) return clean;
    if (clean.startsWith("0")) clean = clean.slice(1);

    return `549${clean}`;
  }

  function formatHorario(horario) {
    if (!horario || horario === "Cerrado") return "Cerrado";
    return horario.replace(/\s*\/\s*/g, " / ");
  }

  function formatUrl(url) {
    if (!url) return "";
    const clean = url.trim();

    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      return clean;
    }

    return `https://${clean}`;
  }

  function getMapsUrl() {
    if (business?.lat && business?.lng) {
      return `https://www.google.com/maps?q=${business.lat},${business.lng}`;
    }

    const query = encodeURIComponent(
      `${business?.direccion || ""} ${business?.ciudad || ""} ${business?.provincia || ""}`
    );

    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  function getEmbedMapUrl() {
    if (business?.lat && business?.lng) {
      return `https://maps.google.com/maps?q=${business.lat},${business.lng}&z=16&output=embed`;
    }

    const query = encodeURIComponent(
      `${business?.direccion || ""} ${business?.ciudad || ""} ${business?.provincia || ""}`
    );

    return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
  }

  function getServiciosDestacados() {
    if (!business?.servicios) return [];

    return business.servicios
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  async function registerView(businessId) {
    if (!businessId) return;

    const sessionKey = `tc_view_${businessId}`;

    if (sessionStorage.getItem(sessionKey)) return;

    sessionStorage.setItem(sessionKey, "true");

    const { error } = await supabase.from("views").insert([
      {
        business_id: businessId,
      },
    ]);

    if (error) console.log("Error guardando view:", error);
  }

  async function registerWhatsappClick(businessId) {
    if (!businessId) return;

    const { error } = await supabase.from("clicks").insert([
      {
        business_id: businessId,
      },
    ]);

    if (error) console.log("Error guardando click:", error);
  }

  async function getBusiness() {
    setCheckingAccess(true);

    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(error);
      setCheckingAccess(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isAdmin = false;

    if (user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      isAdmin = profile?.role === "admin";
    }

    const isOwner = Boolean(user?.id && data?.user_id && user.id === data.user_id);
    const canSeeDraft = isOwner || isAdmin;

    setCanPreviewDraft(canSeeDraft);
    setBusiness(data);

    if (data?.id && (data.status || "published") === "published") {
      await registerView(data.id);
    }

    setCheckingAccess(false);
  }

  const isOpenNow = () => {
    if (!business?.horarios) return false;

    const now = new Date();

    const dias = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];

    const diaActual = dias[now.getDay()];
    const horario = business.horarios[diaActual];

    if (!horario || horario === "Cerrado") return false;

    try {
      const turnos = horario.split("/").map((t) => t.trim());

      return turnos.some((turno) => {
        const [open, close] = turno.split("-").map((p) => p.trim());

        if (!open || !close) return false;

        const [h1, m1] = open.split(":");
        const [h2, m2] = close.split(":");

        const apertura = new Date();
        apertura.setHours(Number(h1), Number(m1), 0);

        const cierre = new Date();
        cierre.setHours(Number(h2), Number(m2), 0);

        return now >= apertura && now <= cierre;
      });
    } catch {
      return false;
    }
  };

  if (!business || checkingAccess) {
    return (
      <Layout fullWidth>
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-center text-slate-500">Cargando vidriera...</p>
        </div>
      </Layout>
    );
  }

  const isDraft = (business.status || "published") === "draft";

  if (isDraft && !canPreviewDraft) {
    return (
      <Layout fullWidth>
        <Helmet>
          <title>Vidriera no publicada | Tus Comercios</title>
          <meta
            name="description"
            content="Esta vidriera todavía no está publicada en Tus Comercios."
          />
        </Helmet>

        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg text-center border">
            <div className="text-5xl mb-4">📝</div>

            <h1 className="text-3xl font-black text-slate-900 mb-3">
              Esta vidriera todavía no está publicada
            </h1>

            <p className="text-slate-600 mb-6">
              El comercio está completando la información para que la vidriera se vea profesional.
            </p>

            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-700 transition"
            >
              Volver a Tus Comercios
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  let images = [];

  if (Array.isArray(business.images)) {
    images = business.images.filter(
      (img) => img && typeof img === "string" && img.includes("supabase.co")
    );
  }

  if (
    images.length === 0 &&
    business.image &&
    business.image.includes("supabase.co")
  ) {
    images.push(business.image);
  }

  const currentImage =
    images[index] || "https://placehold.co/1200x700?text=Tus+Comercios";

  const shareUrl = window.location.href;
  const shareText = `Mirá ${business.negocio} en Tus Comercios`;

  const message = encodeURIComponent(
    `Hola ${business.negocio}, vi tu negocio en Tus Comercios`
  );

  const whatsappNumber = formatWhatsappNumber(business.whatsapp);

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${message}`
    : "#";

  const hasSocials =
    business.facebook ||
    business.instagram ||
    business.tiktok ||
    business.email ||
    business.web;

  const isPremium = business.plan === "premium";
  const isStandard = business.plan === "standard";
  const isFree = business.plan === "free";

  const planLabel = isPremium
    ? "Premium"
    : isStandard
    ? "Estándar"
    : "Gratis";

  const getPlanMessage = () => {
    if (isFree) {
      return "Este negocio forma parte de Tus Comercios.";
    }

    if (isStandard) {
      return "Negocio destacado en Tus Comercios.";
    }

    return "Negocio Premium destacado en Tus Comercios.";
  };

  const planStyles = {
    heroOverlay: isPremium
      ? "from-slate-950/95 via-slate-950/65 to-slate-950/15"
      : isStandard
      ? "from-blue-950/90 via-blue-900/60 to-blue-800/10"
      : "from-white/95 via-white/80 to-white/20",

    heroText: isFree ? "text-slate-950" : "text-white",

    heroSubText: isFree ? "text-slate-700" : "text-white/85",

    badge: isPremium
      ? "bg-amber-400 text-slate-950"
      : isStandard
      ? "bg-violet-600 text-white"
      : "bg-blue-600 text-white",

    cardAccent: isPremium
      ? "border-amber-200 bg-amber-50/70"
      : isStandard
      ? "border-violet-200 bg-violet-50/70"
      : "border-blue-200 bg-blue-50/70",

    footer: isPremium
      ? "bg-slate-950 text-white"
      : isStandard
      ? "bg-blue-700 text-white"
      : "bg-slate-900 text-white",
  };

  async function handleWhatsappClick() {
    if ((business.status || "published") !== "published") return;
    await registerWhatsappClick(business.id);
  }

  async function shareBusiness() {
    const shareData = {
      title: business.negocio,
      text: shareText,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copiado al portapapeles");
      }
    } catch (error) {
      console.log(error);
    }
  }

  function openImage(i) {
    setIndex(i);
    setLightboxOpen(true);
  }

  function nextImage(e) {
    e?.stopPropagation();

    if (images.length === 0) return;

    setIndex((prev) => (prev + 1) % images.length);
  }

  function prevImage(e) {
    e?.stopPropagation();

    if (images.length === 0) return;

    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  const visibleGallery = images.slice(0, isPremium ? 10 : isStandard ? 8 : 4);
  const serviciosDestacados = getServiciosDestacados();
  const hasPremiumMap = isPremium && (business.lat || business.lng || business.direccion);

  return (
    <Layout fullWidth>
      <Helmet>
        <title>
          {business.negocio} en {business.ciudad} | Tus Comercios
        </title>

        <meta
          name="description"
          content={
            business.descripcion ||
            `${business.negocio} en ${business.ciudad}`
          }
        />

        <meta
          property="og:title"
          content={`${business.negocio} | Tus Comercios`}
        />
        <meta property="og:description" content={business.descripcion} />
        <meta property="og:image" content={business.image || currentImage} />
        <meta
          property="og:image:secure_url"
          content={business.image || currentImage}
        />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${business.negocio} | Tus Comercios`}
        />
        <meta name="twitter:description" content={business.descripcion} />
        <meta name="twitter:image" content={business.image || currentImage} />
      </Helmet>

      <div className="bg-slate-50 min-h-screen pb-28 md:pb-8">
        {isDraft && canPreviewDraft && (
          <div className="bg-yellow-400 text-yellow-950 px-4 py-3 text-center font-black">
            📝 Vista previa: esta vidriera está en borrador y todavía no aparece públicamente.
          </div>
        )}

        <section className="relative overflow-hidden bg-slate-900">
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage: `url(${currentImage})`,
            }}
          />

          <div
            className={`absolute inset-0 bg-gradient-to-r ${planStyles.heroOverlay}`}
          />

          <div className="relative max-w-7xl mx-auto px-4 py-14 sm:py-20 md:py-28">
            <div className="max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 md:gap-8">
                <div
                  onClick={() => openImage(index)}
                  className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full bg-white shadow-2xl border-4 border-white overflow-hidden shrink-0 cursor-zoom-in"
                >
                  <img
                    src={currentImage}
                    alt={business.negocio}
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/400x400?text=Tus+Comercios";
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${planStyles.badge}`}
                    >
                      {planLabel}
                    </span>

                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        isOpenNow()
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isOpenNow() ? "Abierto ahora" : "Cerrado"}
                    </span>
                  </div>

                  <h1
                    className={`text-3xl sm:text-4xl md:text-6xl font-black leading-tight ${planStyles.heroText}`}
                  >
                    {business.negocio}
                  </h1>

                  <p
                    className={`mt-3 text-base sm:text-lg md:text-xl font-medium ${planStyles.heroSubText}`}
                  >
                    {business.descripcion
                      ? business.descripcion.split(".")[0]
                      : "Encontrá este comercio en Tus Comercios."}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-5">
                    <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur text-slate-800 px-4 py-3 rounded-2xl text-sm font-bold shadow">
                      <span>📍</span>
                      <span>
                        {business.ciudad}, {business.provincia}
                      </span>
                    </div>

                    {business.horarios && (
                      <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur text-slate-800 px-4 py-3 rounded-2xl text-sm font-bold shadow">
                        <span>🕒</span>
                        <span>
                          {formatHorario(
                            business.horarios[
                              [
                                "domingo",
                                "lunes",
                                "martes",
                                "miercoles",
                                "jueves",
                                "viernes",
                                "sabado",
                              ][new Date().getDay()]
                            ] || "Cerrado"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    {whatsappNumber ? (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={handleWhatsappClick}
                        className="hidden md:inline-flex justify-center items-center bg-green-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-green-700 transition"
                      >
                        💬 Contactar por WhatsApp
                      </a>
                    ) : (
                      <div className="hidden md:inline-flex justify-center items-center bg-gray-200 text-gray-600 px-6 py-3 rounded-2xl font-black">
                        WhatsApp no disponible
                      </div>
                    )}

                    <button
                      onClick={shareBusiness}
                      className="inline-flex justify-center items-center bg-white/90 backdrop-blur text-slate-800 px-6 py-3 rounded-2xl font-black shadow hover:bg-white transition"
                    >
                      ↗ Compartir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
          <section className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
              <div className="p-4 md:p-6 text-center">
                <div className="text-2xl mb-2">✨</div>
                <p className="font-black text-slate-900 text-sm md:text-base">
                  Buena atención
                </p>
              </div>

              <div className="p-4 md:p-6 text-center">
                <div className="text-2xl mb-2">📍</div>
                <p className="font-black text-slate-900 text-sm md:text-base">
                  Comercio local
                </p>
              </div>

              <div className="p-4 md:p-6 text-center">
                <div className="text-2xl mb-2">💬</div>
                <p className="font-black text-slate-900 text-sm md:text-base">
                  Contacto directo
                </p>
              </div>

              <div className="p-4 md:p-6 text-center">
                <div className="text-2xl mb-2">❤️</div>
                <p className="font-black text-slate-900 text-sm md:text-base">
                  En Tus Comercios
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-white rounded-3xl shadow border border-slate-100 p-5 md:p-7">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl md:text-2xl font-black text-slate-950">
                    Sobre nosotros
                  </h2>

                  <span
                    className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-black ${planStyles.badge}`}
                  >
                    {getPlanMessage()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                  <div className="whitespace-pre-line text-slate-700 leading-relaxed text-base">
                    {business.descripcion ||
                      "Este comercio todavía no cargó una descripción."}
                  </div>

                  <div
                    onClick={() => openImage(index)}
                    className="rounded-2xl overflow-hidden bg-slate-100 h-56 md:h-64 cursor-zoom-in shadow-inner"
                  >
                    <img
                      src={currentImage}
                      alt={business.negocio}
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/800x500?text=Sin+Imagen";
                      }}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                  </div>
                </div>
              </div>

              {isPremium && serviciosDestacados.length > 0 && (
                <div className="bg-white rounded-3xl shadow border border-amber-100 p-5 md:p-7">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl md:text-2xl font-black text-slate-950">
                      Servicios destacados
                    </h2>

                    <span className="hidden sm:inline-flex bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black">
                      Premium
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {serviciosDestacados.map((servicio) => (
                      <div
                        key={servicio}
                        className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3"
                      >
                        <span className="text-xl">⭐</span>
                        <span className="font-bold text-slate-800">
                          {servicio}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {visibleGallery.length > 0 && (
                <div className="bg-white rounded-3xl shadow border border-slate-100 p-5 md:p-7">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl md:text-2xl font-black text-slate-950">
                      Galería
                    </h2>

                    <span className="text-sm font-bold text-slate-400">
                      {visibleGallery.length} fotos
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {visibleGallery.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => openImage(i)}
                        className={`relative overflow-hidden rounded-2xl bg-slate-100 aspect-square shadow-sm border-2 ${
                          i === index ? "border-blue-600" : "border-transparent"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                          className="w-full h-full object-cover hover:scale-110 transition duration-500"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-3xl shadow border border-slate-100 p-5 md:p-6">
                <h2 className="text-xl font-black text-slate-950 mb-4">
                  Contacto y redes
                </h2>

                <div className="space-y-3">
                  {whatsappNumber && (business.status || "published") === "published" && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={handleWhatsappClick}
                      className="flex items-center justify-between gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl font-black hover:bg-green-100 transition"
                    >
                      <span>💬 Contactar por WhatsApp</span>
                      <span>›</span>
                    </a>
                  )}

                  {business.facebook && (
                    <a
                      href={formatUrl(business.facebook)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-2xl font-bold hover:bg-blue-100 transition"
                    >
                      <span>Facebook</span>
                      <span>›</span>
                    </a>
                  )}

                  {business.instagram && (
                    <a
                      href={formatUrl(business.instagram)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded-2xl font-bold hover:bg-pink-100 transition"
                    >
                      <span>Instagram</span>
                      <span>›</span>
                    </a>
                  )}

                  {business.tiktok && (
                    <a
                      href={formatUrl(business.tiktok)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl font-bold hover:bg-slate-100 transition"
                    >
                      <span>TikTok</span>
                      <span>›</span>
                    </a>
                  )}

                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex items-center justify-between gap-3 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-2xl font-bold hover:bg-orange-100 transition"
                    >
                      <span>Email</span>
                      <span>›</span>
                    </a>
                  )}

                  {business.web && (
                    <a
                      href={formatUrl(business.web)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl font-bold hover:bg-slate-100 transition"
                    >
                      <span>Sitio web</span>
                      <span>›</span>
                    </a>
                  )}

                  {!hasSocials && !whatsappNumber && (
                    <p className="text-slate-500 text-sm">
                      Este comercio todavía no cargó medios de contacto.
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`rounded-3xl shadow border p-5 md:p-6 ${planStyles.cardAccent}`}
              >
                <h2 className="text-xl font-black text-slate-950 mb-3">
                  👑 Negocio Destacado
                </h2>

                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {getPlanMessage()}
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow border border-slate-100 p-5 md:p-6">
                <h2 className="text-xl font-black text-slate-950 mb-4">
                  Horarios de atención
                </h2>

                <div className="space-y-2 text-sm">
                  {DIAS_ORDEN.map((dia) => {
                    const horario = business.horarios?.[dia] || "Cerrado";
                    const cerrado = horario === "Cerrado";

                    return (
                      <div
                        key={dia}
                        className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0"
                      >
                        <span className="capitalize font-bold text-slate-700">
                          {dia}
                        </span>

                        <span
                          className={`text-right font-bold ${
                            cerrado ? "text-red-500" : "text-slate-600"
                          }`}
                        >
                          {formatHorario(horario)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {hasPremiumMap && (
                <div className="bg-white rounded-3xl shadow border border-amber-100 overflow-hidden">
                  <div className="p-5 md:p-6">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h2 className="text-xl font-black text-slate-950">
                        Ubicación Premium
                      </h2>

                      <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black">
                        Mapa visible
                      </span>
                    </div>

                    {business.direccion && (
                      <p className="text-sm text-slate-600 font-bold mb-4">
                        📍 {business.direccion}, {business.ciudad}, {business.provincia}
                      </p>
                    )}

                    <a
                      href={getMapsUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full text-center bg-slate-950 text-white px-4 py-3 rounded-2xl font-black hover:bg-slate-800 transition mb-4"
                    >
                      📍 Cómo llegar
                    </a>
                  </div>

                  <iframe
                    src={getEmbedMapUrl()}
                    title={`Mapa de ${business.negocio}`}
                    className="w-full h-72 border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}

              {!isPremium && business.ubicacion && (
                <div className="bg-white rounded-3xl shadow border border-slate-100 p-5 md:p-6">
                  <h2 className="text-xl font-black text-slate-950 mb-4">
                    Ubicación
                  </h2>

                  <a
                    href={formatUrl(business.ubicacion)}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center bg-slate-900 text-white px-4 py-3 rounded-2xl font-black hover:bg-slate-800 transition"
                  >
                    📍 Ver en Google Maps
                  </a>
                </div>
              )}
            </aside>
          </section>

          <footer
            className={`mt-6 rounded-3xl px-5 py-5 md:px-7 flex flex-col md:flex-row items-center justify-between gap-3 text-sm ${planStyles.footer}`}
          >
            <p>© 2025 Tus Comercios. Todos los derechos reservados.</p>

            <p className="font-bold">
              Creado con ❤️ por Tus Comercios
            </p>
          </footer>
        </main>
      </div>

      {whatsappNumber && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 p-3 shadow-2xl">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            onClick={handleWhatsappClick}
            className="block w-full bg-green-600 text-white py-4 rounded-2xl text-center font-black text-lg shadow-lg active:scale-[0.98] transition"
          >
            💬 Contactar por WhatsApp
          </a>
        </div>
      )}

      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            className="absolute top-4 right-4 bg-white text-black w-11 h-11 rounded-full text-2xl font-black"
          >
            ×
          </button>

          {images.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-3 md:left-8 bg-white/90 text-black w-12 h-12 rounded-full text-3xl font-black"
            >
              ‹
            </button>
          )}

          <img
            src={currentImage}
            alt={business.negocio}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
          />

          {images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-3 md:right-8 bg-white/90 text-black w-12 h-12 rounded-full text-3xl font-black"
            >
              ›
            </button>
          )}

          {images.length > 0 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/90 text-black px-4 py-2 rounded-full text-sm font-bold">
              {index + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}