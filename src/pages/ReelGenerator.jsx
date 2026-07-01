import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import Layout from "../components/Layout";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;

const PHONE_X = 95;
const PHONE_Y = 115;
const PHONE_W = 890;
const PHONE_H = 1520;
const SCREEN_X = 135;
const SCREEN_Y = 190;
const SCREEN_W = 810;
const SCREEN_H = 1370;

function normalizePlan(plan) {
  const clean = String(plan || "free").toLowerCase();
  if (clean.includes("premium")) return "premium";
  if (clean.includes("standard") || clean.includes("estandar")) return "standard";
  return "free";
}

function getPlanDuration(plan) {
  const clean = normalizePlan(plan);
  if (clean === "premium") return 20;
  if (clean === "standard") return 15;
  return 10;
}

function formatWhatsappNumber(number) {
  if (!number) return "";
  let clean = number.toString().replace(/\D/g, "");
  if (clean.startsWith("00")) clean = clean.slice(2);
  if (clean.startsWith("549")) return clean;
  if (clean.startsWith("54")) return clean;
  if (clean.startsWith("0")) clean = clean.slice(1);
  return `549${clean}`;
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

function drawCoverImage(ctx, img, x, y, w, h) {
  const iw = img.width;
  const ih = img.height;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
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

function getImages(business) {
  const images = [];

  if (business?.image && business.image.includes("http")) {
    images.push(business.image);
  }

  if (Array.isArray(business?.images)) {
    business.images.forEach((img) => {
      if (img && typeof img === "string" && img.includes("http")) {
        images.push(img);
      }
    });
  }

  const unique = [...new Set(images)];
  return unique.length ? unique : ["/logo.png"];
}

function getServices(business) {
  const raw =
    business?.servicios ||
    business?.services ||
    business?.productos ||
    business?.products ||
    "";

  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean).slice(0, 8);
  }

  return String(raw)
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function ReelGenerator() {
  const { id } = useParams();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  const [business, setBusiness] = useState(null);
  const [loadedImages, setLoadedImages] = useState([]);
  const [logoImage, setLogoImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  const plan = useMemo(() => normalizePlan(business?.plan), [business]);
  const duration = useMemo(() => getPlanDuration(business?.plan), [business]);

  useEffect(() => {
    loadBusiness();
  }, [id]);

  useEffect(() => {
    if (business) prepareAssets();
  }, [business]);

  useEffect(() => {
    if (business && loadedImages.length) drawPreview();
  }, [business, loadedImages, logoImage]);

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

      if (error || !data) {
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

  async function prepareAssets() {
    const urls = getImages(business);
    const imgs = [];

    for (const url of urls.slice(0, 10)) {
      try {
        imgs.push(await loadImage(url));
      } catch (error) {
        console.log("No se pudo cargar imagen:", url, error);
      }
    }

    if (!imgs.length) imgs.push(await loadImage("/logo.png"));
    setLoadedImages(imgs);

    try {
      setLogoImage(await loadImage("/logo.png"));
    } catch {
      setLogoImage(null);
    }
  }

  function drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, "#020617");
    gradient.addColorStop(0.45, "#0f172a");
    gradient.addColorStop(1, "#1d4ed8");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "rgba(37,99,235,0.35)";
    ctx.beginPath();
    ctx.arc(970, 280, 290, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(124,58,237,0.28)";
    ctx.beginPath();
    ctx.arc(80, 1630, 310, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 34px Arial";
    ctx.fillText("TusComercios.com.ar", 70, 68);

    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 30px Arial";
    ctx.translate(WIDTH - 38, 1210);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("www.tuscomercios.com.ar", 0, 0);
    ctx.restore();
  }

  function drawPhone(ctx) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 45;
    ctx.shadowOffsetY = 24;
    ctx.fillStyle = "#020617";
    drawRoundedRect(ctx, PHONE_X, PHONE_Y, PHONE_W, PHONE_H, 74);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#111827";
    drawRoundedRect(ctx, PHONE_X + 16, PHONE_Y + 16, PHONE_W - 32, PHONE_H - 32, 58);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H, 42);
    ctx.fill();

    ctx.fillStyle = "#020617";
    drawRoundedRect(ctx, WIDTH / 2 - 118, PHONE_Y + 34, 236, 34, 18);
    ctx.fill();
  }

  function drawHomeScreen(ctx, typingProgress = 1) {
    ctx.save();
    drawRoundedRect(ctx, SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H, 42);
    ctx.clip();

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, 145);

    if (logoImage) {
      const logoW = 350;
      const logoH = (logoImage.height * logoW) / logoImage.width;
      ctx.drawImage(logoImage, SCREEN_X + 38, SCREEN_Y + 30, logoW, logoH);
    } else {
      ctx.fillStyle = "#2563eb";
      ctx.font = "900 44px Arial";
      ctx.fillText("Tus Comercios", SCREEN_X + 42, SCREEN_Y + 85);
    }

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 58px Arial";
    drawText(ctx, "Encontrá lo que necesitás cerca tuyo", SCREEN_X + 45, SCREEN_Y + 260, SCREEN_W - 90, 66, { maxLines: 3 });

    ctx.fillStyle = "#475569";
    ctx.font = "500 30px Arial";
    drawText(ctx, "Comercios, servicios y profesionales en un solo lugar.", SCREEN_X + 45, SCREEN_Y + 470, SCREEN_W - 90, 40, { maxLines: 2 });

    const rubro = business?.rubro || "Comercio";
    const typed = rubro.slice(0, Math.max(1, Math.floor(rubro.length * typingProgress)));

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, SCREEN_X + 45, SCREEN_Y + 590, SCREEN_W - 90, 86, 24);
    ctx.fill();
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 34px Arial";
    ctx.fillText(typed, SCREEN_X + 78, SCREEN_Y + 645);

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, SCREEN_X + 45, SCREEN_Y + 710, SCREEN_W - 90, 82, 24);
    ctx.fill();

    ctx.fillStyle = "#64748b";
    ctx.font = "600 28px Arial";
    ctx.fillText(business?.ciudad || "Ciudad", SCREEN_X + 78, SCREEN_Y + 762);

    ctx.fillStyle = "#2563eb";
    drawRoundedRect(ctx, SCREEN_X + 45, SCREEN_Y + 825, SCREEN_W - 90, 86, 24);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 31px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Buscar", SCREEN_X + SCREEN_W / 2, SCREEN_Y + 880);
    ctx.textAlign = "left";

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 36px Arial";
    ctx.fillText("Categorías destacadas", SCREEN_X + 45, SCREEN_Y + 1020);

    const cats = ["Comercios", "Servicios", "Profesionales", "Gastronomía"];
    cats.forEach((cat, i) => {
      const x = SCREEN_X + 45 + (i % 2) * 365;
      const y = SCREEN_Y + 1080 + Math.floor(i / 2) * 130;

      ctx.fillStyle = "#ffffff";
      drawRoundedRect(ctx, x, y, 330, 90, 28);
      ctx.fill();

      ctx.fillStyle = "#1d4ed8";
      ctx.font = "800 25px Arial";
      ctx.fillText(cat, x + 34, y + 57);
    });

    ctx.restore();
  }

  function drawResultsScreen(ctx) {
    ctx.save();
    drawRoundedRect(ctx, SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H, 42);
    ctx.clip();

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, 145);

    if (logoImage) {
      const logoW = 300;
      const logoH = (logoImage.height * logoW) / logoImage.width;
      ctx.drawImage(logoImage, SCREEN_X + 38, SCREEN_Y + 32, logoW, logoH);
    }

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 40px Arial";
    ctx.fillText(`Resultados para "${business?.rubro || "Comercio"}"`, SCREEN_X + 45, SCREEN_Y + 220);

    ctx.fillStyle = "#64748b";
    ctx.font = "600 26px Arial";
    ctx.fillText(business?.ciudad || "Tu ciudad", SCREEN_X + 45, SCREEN_Y + 264);

    const cardY = SCREEN_Y + 330;

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, SCREEN_X + 40, cardY, SCREEN_W - 80, 320, 34);
    ctx.fill();
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 5;
    ctx.stroke();

    if (loadedImages[0]) {
      ctx.save();
      drawRoundedRect(ctx, SCREEN_X + 75, cardY + 35, 250, 190, 26);
      ctx.clip();
      drawCoverImage(ctx, loadedImages[0], SCREEN_X + 75, cardY + 35, 250, 190);
      ctx.restore();
    }

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 35px Arial";
    drawText(ctx, business?.negocio || "Negocio", SCREEN_X + 355, cardY + 82, 500, 42, { maxLines: 2 });

    ctx.fillStyle = "#2563eb";
    ctx.font = "800 25px Arial";
    ctx.fillText(business?.rubro || "Rubro", SCREEN_X + 355, cardY + 175);

    ctx.fillStyle = "#64748b";
    ctx.font = "700 24px Arial";
    ctx.fillText(`📍 ${business?.ciudad || ""}`, SCREEN_X + 355, cardY + 218);

    ctx.fillStyle = "#22c55e";
    drawRoundedRect(ctx, SCREEN_X + 355, cardY + 248, 170, 48, 18);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 21px Arial";
    ctx.fillText("Contactar", SCREEN_X + 390, cardY + 279);

    ctx.fillStyle = "rgba(37,99,235,0.18)";
    ctx.beginPath();
    ctx.arc(SCREEN_X + 705, cardY + 210, 55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1d4ed8";
    ctx.font = "900 55px Arial";
    ctx.fillText("👆", SCREEN_X + 668, cardY + 230);

    [1, 2, 3].forEach((_, i) => {
      const y = cardY + 370 + i * 160;
      ctx.fillStyle = "#ffffff";
      drawRoundedRect(ctx, SCREEN_X + 40, y, SCREEN_W - 80, 125, 28);
      ctx.fill();
      ctx.fillStyle = "#cbd5e1";
      drawRoundedRect(ctx, SCREEN_X + 75, y + 24, 150, 78, 20);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "800 25px Arial";
      ctx.fillText("Otro resultado", SCREEN_X + 250, y + 55);
      ctx.fillText("...", SCREEN_X + 250, y + 92);
    });

    ctx.restore();
  }

  function drawBusinessPage(ctx, scrollY) {
    ctx.save();
    drawRoundedRect(ctx, SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H, 42);
    ctx.clip();

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H);

    let y = SCREEN_Y - scrollY;

    if (loadedImages[0]) {
      drawCoverImage(ctx, loadedImages[0], SCREEN_X, y, SCREEN_W, 430);
    } else {
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(SCREEN_X, y, SCREEN_W, 430);
    }

    const overlay = ctx.createLinearGradient(0, y, 0, y + 430);
    overlay.addColorStop(0, "rgba(15,23,42,0.12)");
    overlay.addColorStop(1, "rgba(15,23,42,0.65)");
    ctx.fillStyle = overlay;
    ctx.fillRect(SCREEN_X, y, SCREEN_W, 430);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 52px Arial";
    drawText(ctx, business?.negocio || "Negocio", SCREEN_X + 45, y + 285, SCREEN_W - 90, 58, { maxLines: 2 });

    ctx.fillStyle = "#dbeafe";
    ctx.font = "800 28px Arial";
    ctx.fillText(`📍 ${business?.ciudad || ""}`, SCREEN_X + 45, y + 390);

    y += 470;

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, SCREEN_X + 35, y, SCREEN_W - 70, 360, 32);
    ctx.fill();

    ctx.fillStyle = "#2563eb";
    ctx.font = "900 28px Arial";
    ctx.fillText(business?.rubro || "Comercio destacado", SCREEN_X + 75, y + 60);

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 40px Arial";
    ctx.fillText("Descripción", SCREEN_X + 75, y + 120);

    ctx.fillStyle = "#475569";
    ctx.font = "500 27px Arial";
    drawText(ctx, business?.descripcion || "Conocé esta vidriera, sus productos, servicios e información importante.", SCREEN_X + 75, y + 175, SCREEN_W - 150, 38, { maxLines: plan === "premium" ? 5 : 4 });

    y += 405;

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, SCREEN_X + 35, y, SCREEN_W - 70, 560, 32);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 40px Arial";
    ctx.fillText("Galería", SCREEN_X + 75, y + 65);

    const gallery = loadedImages.length > 1 ? loadedImages.slice(0, 4) : loadedImages;
    gallery.forEach((img, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const imgX = SCREEN_X + 75 + col * 345;
      const imgY = y + 105 + row * 205;
      ctx.save();
      drawRoundedRect(ctx, imgX, imgY, 310, 175, 24);
      ctx.clip();
      drawCoverImage(ctx, img, imgX, imgY, 310, 175);
      ctx.restore();
    });

    y += 605;

    const services = getServices(business);
    const visibleServices = services.length > 0 ? services : [business?.rubro || "Atención personalizada", "Contacto directo por WhatsApp", "Información actualizada"];

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, SCREEN_X + 35, y, SCREEN_W - 70, plan === "premium" ? 470 : 335, 32);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 40px Arial";
    ctx.fillText("Servicios", SCREEN_X + 75, y + 65);

    visibleServices.slice(0, plan === "premium" ? 6 : 3).forEach((service, i) => {
      const itemY = y + 125 + i * 55;
      ctx.fillStyle = "#eff6ff";
      drawRoundedRect(ctx, SCREEN_X + 75, itemY - 35, SCREEN_W - 150, 44, 18);
      ctx.fill();
      ctx.fillStyle = "#1e40af";
      ctx.font = "800 24px Arial";
      ctx.fillText(`✓ ${service}`, SCREEN_X + 100, itemY - 5);
    });

    y += plan === "premium" ? 515 : 380;

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, SCREEN_X + 35, y, SCREEN_W - 70, 300, 32);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 40px Arial";
    ctx.fillText("Información", SCREEN_X + 75, y + 68);

    ctx.fillStyle = "#475569";
    ctx.font = "700 27px Arial";
    ctx.fillText(`📍 ${business?.ciudad || ""}, ${business?.provincia || ""}`, SCREEN_X + 75, y + 130);
    ctx.fillText("🕒 Horarios disponibles en la vidriera", SCREEN_X + 75, y + 185);

    ctx.fillStyle = "#22c55e";
    drawRoundedRect(ctx, SCREEN_X + 75, y + 215, SCREEN_W - 150, 65, 22);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("WhatsApp directo", SCREEN_X + SCREEN_W / 2, y + 257);
    ctx.textAlign = "left";

    y += 345;

    ctx.fillStyle = "#dbeafe";
    drawRoundedRect(ctx, SCREEN_X + 35, y, SCREEN_W - 70, 250, 32);
    ctx.fill();

    ctx.fillStyle = "#1e3a8a";
    ctx.font = "900 38px Arial";
    ctx.fillText("Encontrá todo en un solo lugar", SCREEN_X + 75, y + 85);

    ctx.fillStyle = "#2563eb";
    ctx.font = "800 28px Arial";
    ctx.fillText("www.tuscomercios.com.ar", SCREEN_X + 75, y + 145);

    ctx.restore();
  }

  function drawEndCard(ctx, progress) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (logoImage) {
      const logoW = 650;
      const logoH = (logoImage.height * logoW) / logoImage.width;
      ctx.drawImage(logoImage, (WIDTH - logoW) / 2, 610, logoW, logoH);
    } else {
      ctx.fillStyle = "#2563eb";
      ctx.font = "900 78px Arial";
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

    drawProgress(ctx, progress);
  }

  function drawProgress(ctx, progress) {
    ctx.fillStyle = "rgba(255,255,255,0.24)";
    drawRoundedRect(ctx, 90, HEIGHT - 105, 900, 14, 7);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, 90, HEIGHT - 105, 900 * progress, 14, 7);
    ctx.fill();
  }

  function drawFrame(ctx, progress) {
    drawBackground(ctx);
    drawPhone(ctx);

    if (progress < 0.18) {
      drawHomeScreen(ctx, easeInOut(progress / 0.18));
    } else if (progress < 0.32) {
      drawResultsScreen(ctx);
    } else if (progress < 0.86) {
      const t = (progress - 0.32) / 0.54;
      const scrollMax = plan === "premium" ? 1650 : plan === "standard" ? 1370 : 1080;
      const scrollY = easeInOut(t) * scrollMax;
      drawBusinessPage(ctx, scrollY);
    } else {
      drawEndCard(ctx, progress);
      return;
    }

    drawProgress(ctx, progress);
  }

  function drawPreview() {
    const canvas = canvasRef.current;
    if (!canvas || !business) return;
    const ctx = canvas.getContext("2d");
    drawFrame(ctx, 0.42);
  }

  async function generateReel() {
    if (!business || generating) return;

    try {
      setGenerating(true);
      setVideoUrl("");

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const stream = canvas.captureStream(FPS);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 9000000,
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

      for (let frame = 0; frame < totalFrames; frame++) {
        const progress = frame / totalFrames;
        drawFrame(ctx, progress);
        await new Promise((resolve) => setTimeout(resolve, 1000 / FPS));
      }

      recorder.stop();
      await finished;

      const blob = new Blob(chunks, { type: recorder.mimeType || mimeType });
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
          <div className="bg-white rounded-2xl shadow p-6">Cargando generador...</div>
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
          <button onClick={() => navigate("/dashboard")} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black">
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
                <h1 className="text-3xl font-black text-slate-900">🚀 Crear contenido para redes</h1>
                <p className="text-gray-500 mt-1">Reel vertical 9:16: busca el rubro, muestra resultados y recorre la vidriera.</p>
              </div>
              <button onClick={() => navigate("/dashboard")} className="bg-slate-100 px-5 py-3 rounded-2xl font-bold hover:bg-slate-200 transition">
                Volver al panel
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl shadow p-6">
              <h2 className="text-2xl font-black mb-4">Configuración</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4">
                  <p className="font-black">{business?.negocio}</p>
                  <p className="text-sm mt-1">Plan: <b>{business?.plan || "free"}</b> · Duración: <b>{duration} segundos</b> · Formato: <b>1080×1920</b></p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="font-black mb-2">El Reel muestra:</p>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li>✔ Home de TusComercios</li>
                    <li>✔ Búsqueda automática por rubro</li>
                    <li>✔ Resultado con la card del negocio</li>
                    <li>✔ Ingreso a la vidriera</li>
                    <li>✔ Recorrido lento de arriba hacia abajo</li>
                    <li>✔ Descripción, galería, servicios, ubicación y WhatsApp</li>
                    <li>✔ Cierre con logo y slogan</li>
                  </ul>
                </div>

                <button onClick={generateReel} disabled={generating} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-60">
                  {generating ? "Generando Reel..." : "Generar vista previa"}
                </button>

                {videoUrl && (
                  <button onClick={downloadReel} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-700 transition">
                    Descargar Reel
                  </button>
                )}

                <p className="text-xs text-gray-400">Consejo: agregá música desde Instagram al subirlo para mejorar el alcance.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow p-6">
              <h2 className="text-2xl font-black mb-4">Vista previa</h2>
              <div className="mx-auto w-full max-w-[340px] bg-black rounded-[2rem] p-3 shadow-2xl">
                <div className="bg-black rounded-[1.5rem] overflow-hidden aspect-[9/16]">
                  {!videoUrl ? (
                    <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="hidden" />
                      <video ref={videoRef} src={videoUrl} controls playsInline className="w-full h-full object-cover" />
                    </>
                  )}
                </div>
              </div>

              {generating && <p className="text-center text-sm text-gray-500 mt-4">Esto puede tardar unos segundos. No cierres esta pantalla.</p>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
