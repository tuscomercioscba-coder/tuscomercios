import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import Layout from "../components/Layout";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;

function formatWhatsappNumber(number) {
  if (!number) return "";

  let clean = number.toString().replace(/\D/g, "");

  if (clean.startsWith("00")) clean = clean.slice(2);
  if (clean.startsWith("549")) return clean;
  if (clean.startsWith("54")) return clean;
  if (clean.startsWith("0")) clean = clean.slice(1);

  return `549${clean}`;
}

function getPlanDuration(plan) {
  if (plan === "premium") return 20;
  if (plan === "standard") return 15;
  return 10;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCoverImage(ctx, img, x, y, w, h, zoom = 1) {
  const iw = img.width;
  const ih = img.height;

  const scale = Math.max(w / iw, h / ih) * zoom;
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawText(ctx, text, x, y, maxWidth, lineHeight, options = {}) {
  const words = String(text || "").split(" ");
  let line = "";
  let lines = [];

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;

    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line);
  if (options.maxLines) lines = lines.slice(0, options.maxLines);

  lines.forEach((item, index) => {
    ctx.fillText(item, x, y + index * lineHeight);
  });
}

function getServices(business) {
  if (!business?.servicios) return [];

  return business.servicios
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function getImages(business) {
  const images = [];

  if (Array.isArray(business?.images)) {
    business.images.forEach((img) => {
      if (img && typeof img === "string" && img.includes("http")) {
        images.push(img);
      }
    });
  }

  if (business?.image && business.image.includes("http")) {
    images.unshift(business.image);
  }

  const unique = [...new Set(images)];
  return unique.length > 0 ? unique : ["/logo.png"];
}

export default function ReelGenerator() {
  const { id } = useParams();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  const duration = useMemo(
    () => getPlanDuration(business?.plan || "free"),
    [business]
  );

  useEffect(() => {
    loadBusiness();
  }, [id]);

  useEffect(() => {
    if (business) drawPreview();
  }, [business]);

  async function loadBusiness() {
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

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setError("No pudimos encontrar este negocio.");
        return;
      }

      const isOwner = data.user_id === user.id;
      const isAdmin = profile?.role === "admin";

      if (!isOwner && !isAdmin) {
        setError("Solo el dueño del negocio puede generar este Reel.");
        return;
      }

      setBusiness(data);
    } finally {
      setLoading(false);
    }
  }

  async function drawPreview() {
    const canvas = canvasRef.current;
    if (!canvas || !business) return;

    const ctx = canvas.getContext("2d");
    const images = getImages(business);

    let img = null;

    try {
      img = await loadImage(images[0]);
    } catch {
      img = await loadImage("/logo.png");
    }

    drawFrame(ctx, {
      business,
      image: img,
      logo: null,
      progress: 0.15,
      scene: 1,
      sceneProgress: 0.5,
      services: getServices(business),
    });
  }

  function drawFrame(ctx, data) {
    const { business, image, logo, progress, scene, sceneProgress, services } =
      data;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(0.45, "#1d4ed8");
    gradient.addColorStop(1, "#7c3aed");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (scene < 5 && image) {
      const zoom = 1.02 + sceneProgress * 0.06;
      ctx.save();
      ctx.globalAlpha = scene === 0 ? 0.35 : 0.55;
      drawCoverImage(ctx, image, 0, 0, WIDTH, HEIGHT, zoom);
      ctx.restore();

      const overlay = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      overlay.addColorStop(0, "rgba(15,23,42,0.25)");
      overlay.addColorStop(0.48, "rgba(15,23,42,0.50)");
      overlay.addColorStop(1, "rgba(15,23,42,0.92)");
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    ctx.fillStyle = "rgba(255,255,255,0.14)";
    drawRoundedRect(ctx, 70, 72, 400, 62, 31);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 30px Arial";
    ctx.fillText("TusComercios.com.ar", 95, 114);

    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 34px Arial";
    ctx.translate(WIDTH - 54, HEIGHT / 2 + 330);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("www.tuscomercios.com.ar", 0, 0);
    ctx.restore();

    if (scene === 0) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 72px Arial";
      drawText(
        ctx,
        `¿Buscás ${business.rubro || "un comercio"}?`,
        80,
        760,
        900,
        86,
        { maxLines: 3 }
      );

      ctx.fillStyle = "#dbeafe";
      ctx.font = "700 42px Arial";
      ctx.fillText("Encontralo en Tus Comercios", 80, 1010);
    }

    if (scene === 1) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 78px Arial";
      drawText(ctx, business.negocio || "Negocio", 80, 720, 900, 86, {
        maxLines: 3,
      });

      ctx.fillStyle = "#bfdbfe";
      ctx.font = "800 42px Arial";
      ctx.fillText(`📍 ${business.ciudad || ""}`, 80, 1020);

      if (business.rubro) {
        ctx.fillStyle = "#facc15";
        ctx.font = "900 38px Arial";
        ctx.fillText(business.rubro, 80, 1090);
      }
    }

    if (scene === 2) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 58px Arial";
      ctx.fillText("Una vidriera digital", 80, 700);

      ctx.fillStyle = "#e0f2fe";
      ctx.font = "700 42px Arial";
      drawText(
        ctx,
        business.descripcion ||
          "Conocé este comercio, sus servicios y contactá directo.",
        80,
        790,
        900,
        56,
        { maxLines: 5 }
      );
    }

    if (scene === 3) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 58px Arial";
      ctx.fillText("Servicios destacados", 80, 560);

      const list =
        services.length > 0
          ? services
          : [
              business.rubro || "Atención personalizada",
              "Contacto directo por WhatsApp",
              "Información actualizada",
            ];

      list.slice(0, 5).forEach((service, i) => {
        const y = 680 + i * 110;

        ctx.fillStyle = "rgba(255,255,255,0.16)";
        drawRoundedRect(ctx, 80, y - 54, 890, 82, 28);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "800 36px Arial";
        ctx.fillText(`✓ ${service}`, 115, y);
      });
    }

    if (scene === 4) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 64px Arial";
      ctx.fillText("Contactá directo", 80, 700);

      ctx.fillStyle = "#22c55e";
      drawRoundedRect(ctx, 80, 820, 760, 120, 36);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 44px Arial";
      ctx.fillText("💬 WhatsApp", 120, 895);

      const number = formatWhatsappNumber(business.whatsapp);
      if (number) {
        ctx.font = "700 34px Arial";
        ctx.fillText(`+${number}`, 120, 1015);
      }

      ctx.fillStyle = "#dbeafe";
      ctx.font = "800 36px Arial";
      ctx.fillText("Desde la vidriera de Tus Comercios", 80, 1130);
    }

    if (scene === 5) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      if (logo) {
        const logoW = 620;
        const logoH = (logo.height * logoW) / logo.width;
        ctx.drawImage(logo, (WIDTH - logoW) / 2, 620, logoW, logoH);
      } else {
        ctx.fillStyle = "#2563eb";
        ctx.font = "900 72px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Tus Comercios", WIDTH / 2, 820);
      }

      ctx.fillStyle = "#0f172a";
      ctx.font = "900 54px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Conectando personas", WIDTH / 2, 1110);
      ctx.fillText("con negocios", WIDTH / 2, 1180);

      ctx.fillStyle = "#2563eb";
      ctx.font = "800 38px Arial";
      ctx.fillText("www.tuscomercios.com.ar", WIDTH / 2, 1300);
      ctx.textAlign = "left";
    }

    ctx.fillStyle = "rgba(255,255,255,0.28)";
    drawRoundedRect(ctx, 80, HEIGHT - 110, 920, 14, 7);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, 80, HEIGHT - 110, 920 * progress, 14, 7);
    ctx.fill();
  }

  async function generateReel() {
    if (!business || generating) return;

    try {
      setGenerating(true);
      setVideoUrl("");

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const imageUrls = getImages(business);
      const images = [];

      for (const url of imageUrls.slice(0, 10)) {
        try {
          const img = await loadImage(url);
          images.push(img);
        } catch (error) {
          console.log("No se pudo cargar imagen:", url, error);
        }
      }

      if (images.length === 0) images.push(await loadImage("/logo.png"));

      let logo = null;

      try {
        logo = await loadImage("/logo.png");
      } catch {}

      const stream = canvas.captureStream(FPS);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000,
      });

      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      const finished = new Promise((resolve) => {
        recorder.onstop = resolve;
      });

      recorder.start();

      const totalFrames = duration * FPS;
      const services = getServices(business);

      for (let frame = 0; frame < totalFrames; frame++) {
        const progress = frame / totalFrames;
        const scene = Math.min(5, Math.floor(progress * 6));
        const sceneProgress = (progress * 6) % 1;
        const img = images[frame % images.length];

        drawFrame(ctx, {
          business,
          image: img,
          logo,
          progress,
          scene,
          sceneProgress,
          services,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000 / FPS));
      }

      recorder.stop();
      await finished;

      const blob = new Blob(chunks, {
        type: recorder.mimeType || mimeType,
      });

      const url = URL.createObjectURL(blob);
      setVideoUrl(url);

      setTimeout(() => {
        videoRef.current?.load();
      }, 100);
    } catch (error) {
      console.error(error);
      alert("No se pudo generar el Reel. Probá nuevamente.");
    } finally {
      setGenerating(false);
    }
  }

  function downloadReel() {
    if (!videoUrl || !business) return;

    const fileName = `reel-${business.slug || business.negocio || "tus-comercios"}.webm`;

    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = fileName;
    a.click();
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow p-6">
            Cargando generador...
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow p-8 text-center">
          <h1 className="text-3xl font-black mb-3">No disponible</h1>
          <p className="text-gray-500 mb-6">{error}</p>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black"
          >
            Volver al panel
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900">
                  🚀 Crear contenido para redes
                </h1>

                <p className="text-gray-500 mt-1">
                  Generá un Reel vertical 9:16 listo para Instagram, Facebook o TikTok.
                </p>
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="bg-slate-100 px-5 py-3 rounded-2xl font-bold hover:bg-slate-200 transition"
              >
                Volver al panel
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl shadow p-6">
              <h2 className="text-2xl font-black mb-4">
                Configuración
              </h2>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4">
                  <p className="font-black">{business?.negocio}</p>
                  <p className="text-sm mt-1">
                    Plan: <b>{business?.plan || "free"}</b> · Duración:{" "}
                    <b>{duration} segundos</b> · Formato: <b>1080×1920</b>
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-sm text-gray-500">Rubro</p>
                    <p className="font-black">{business?.rubro || "-"}</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-sm text-gray-500">Localidad</p>
                    <p className="font-black">{business?.ciudad || "-"}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="font-black mb-2">Incluye automáticamente:</p>

                  <ul className="text-sm text-slate-600 space-y-2">
                    <li>✔ Nombre del negocio</li>
                    <li>✔ Rubro y ciudad</li>
                    <li>✔ Fotos de la vidriera</li>
                    <li>✔ Servicios destacados si existen</li>
                    <li>✔ WhatsApp</li>
                    <li>✔ Logo final Tus Comercios</li>
                    <li>✔ Marca de agua www.tuscomercios.com.ar</li>
                  </ul>
                </div>

                <button
                  onClick={generateReel}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-60"
                >
                  {generating ? "Generando Reel..." : "Generar vista previa"}
                </button>

                {videoUrl && (
                  <button
                    onClick={downloadReel}
                    className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-700 transition"
                  >
                    Descargar Reel
                  </button>
                )}

                <p className="text-xs text-gray-400">
                  Consejo: agregá música desde Instagram al subirlo para mejorar el alcance.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow p-6">
              <h2 className="text-2xl font-black mb-4">
                Vista previa
              </h2>

              <div className="mx-auto w-full max-w-[340px] bg-black rounded-[2rem] p-3 shadow-2xl">
                <div className="bg-black rounded-[1.5rem] overflow-hidden aspect-[9/16]">
                  {!videoUrl ? (
                    <canvas
                      ref={canvasRef}
                      width={WIDTH}
                      height={HEIGHT}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <canvas
                        ref={canvasRef}
                        width={WIDTH}
                        height={HEIGHT}
                        className="hidden"
                      />

                      <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </>
                  )}
                </div>
              </div>

              {generating && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Esto puede tardar unos segundos. No cierres esta pantalla.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
