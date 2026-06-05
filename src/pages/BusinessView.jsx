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
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setBusiness(data);

    if (data?.id) {
      await registerView(data.id);
    }
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

  if (!business) {
    return (
      <Layout>
        <p className="text-center mt-10">Cargando...</p>
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
    images[index] || "https://placehold.co/800x500?text=Sin+Imagen";

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

  const getPlanMessage = () => {
    if (business.plan === "free") {
      return "Este negocio forma parte de Tus Comercios.";
    }

    if (business.plan === "standard") {
      return "Negocio destacado en Tus Comercios.";
    }

    return "Negocio Premium destacado en Tus Comercios.";
  };

  async function handleWhatsappClick() {
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

  return (
    <Layout>
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

        <meta property="og:title" content={`${business.negocio} | Tus Comercios`} />
        <meta property="og:description" content={business.descripcion} />
        <meta property="og:image" content={business.image || currentImage} />
        <meta property="og:image:secure_url" content={business.image || currentImage} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${business.negocio} | Tus Comercios`} />
        <meta name="twitter:description" content={business.descripcion} />
        <meta name="twitter:image" content={business.image || currentImage} />
      </Helmet>

      <div className="max-w-6xl mx-auto p-4 pb-28 md:pb-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <div className="relative">
                <img
                  src={currentImage}
                  alt={business.negocio}
                  onClick={() => openImage(index)}
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/800x500?text=Sin+Imagen";
                  }}
                  className="w-full h-80 object-contain rounded-xl bg-gray-100 cursor-zoom-in hover:opacity-95 transition"
                />

                {images.length > 0 && (
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                    Ver fotos
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-1/2 flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{business.negocio}</h1>

                <p className="text-gray-500 mb-2">
                  📍 {business.ciudad}, {business.provincia}
                </p>

                <span
                  className={`inline-block px-3 py-1 text-sm rounded-full font-bold mb-4 ${
                    isOpenNow()
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {isOpenNow() ? "🟢 Abierto ahora" : "🔴 Cerrado"}
                </span>

                <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                  {business.descripcion}
                </div>
              </div>

              {hasSocials && (
                <div className="mt-6 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <h3 className="font-bold mb-3">Redes y contacto</h3>

                  <div className="flex flex-wrap gap-2">
                    {business.facebook && (
                      <a
                        href={formatUrl(business.facebook)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
                      >
                        Facebook
                      </a>
                    )}

                    {business.instagram && (
                      <a
                        href={formatUrl(business.instagram)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-pink-700 transition"
                      >
                        Instagram
                      </a>
                    )}

                    {business.tiktok && (
                      <a
                        href={formatUrl(business.tiktok)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition"
                      >
                        TikTok
                      </a>
                    )}

                    {business.email && (
                      <a
                        href={`mailto:${business.email}`}
                        className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition"
                      >
                        Email
                      </a>
                    )}

                    {business.web && (
                      <a
                        href={formatUrl(business.web)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition"
                      >
                        Web
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <p className="text-sm text-blue-800 font-medium">
                  🚀 {getPlanMessage()}
                </p>
              </div>

              {whatsappNumber ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleWhatsappClick}
                  className="hidden md:block mt-6 bg-green-600 text-white py-3 rounded-xl text-center font-bold text-lg hover:bg-green-700 transition"
                >
                  💬 Contactar por WhatsApp
                </a>
              ) : (
                <div className="mt-6 bg-gray-200 text-gray-600 py-3 rounded-xl text-center font-bold text-lg">
                  WhatsApp no disponible
                </div>
              )}

              <button
                onClick={shareBusiness}
                className="mt-3 bg-slate-100 text-slate-700 py-3 rounded-xl text-center font-bold text-lg hover:bg-slate-200 transition"
              >
                ↗ Compartir
              </button>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => openImage(i)}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                  className={`w-24 h-24 object-cover rounded cursor-pointer border-2 ${
                    i === index ? "border-blue-600" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Horarios</h2>

          <div className="space-y-2 text-sm">
            {DIAS_ORDEN.map((dia) => {
              const horario = business.horarios?.[dia] || "Cerrado";

              return (
                <div key={dia} className="flex justify-between gap-4 border-b pb-1">
                  <span className="capitalize font-medium">{dia}</span>

                  <span className="text-gray-600 text-right">
                    {formatHorario(horario)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
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