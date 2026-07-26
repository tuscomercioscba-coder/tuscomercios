import { createSceneId, getReelStyle } from "../reelPresets";

export const DIRECTOR_MODES = { BUSINESS: "business", ADMIN: "admin" };
export const DIRECTOR_STYLES = {
  COMMERCIAL: "commercial",
  PREMIUM: "premium",
  CINEMATIC: "cinematic",
  ELEGANT: "elegant",
  OFFER: "offer",
  TUSCOMERCIOS: "tuscomercios",
};
export const SCENE_TYPES = {
  HOOK: "hook",
  PRODUCT: "product",
  DETAIL: "detail",
  PROMOTION: "promotion",
  LOCATION: "location",
  SOCIAL: "social",
  LOGO: "logo",
  CTA: "cta",
  END: "end",
};

export function buildDirectorContext({
  business = {},
  media = [],
  photos = [],
  videos = [],
  mode = DIRECTOR_MODES.BUSINESS,
  style = DIRECTOR_STYLES.COMMERCIAL,
  targetDuration = 15,
  idea = "",
  title = "",
  subtitle = "",
} = {}) {
  const normalizedMedia = normalizeMedia({ media, photos, videos, business });

  return {
    business,
    mode: mode === DIRECTOR_MODES.ADMIN ? DIRECTOR_MODES.ADMIN : DIRECTOR_MODES.BUSINESS,
    style,
    targetDuration: clamp(Number(targetDuration) || 15, 8, 60),
    idea: String(idea || "").trim(),
    title: String(title || "").trim(),
    subtitle: String(subtitle || "").trim(),
    media: normalizedMedia,
    category: normalizeCategory(business?.rubro || ""),
    city: String(business?.ciudad || "").trim(),
    businessName: String(business?.negocio || business?.nombre || "Tu comercio").trim(),
    whatsapp: String(business?.whatsapp || business?.telefono || "").trim(),
    logo: business?.logo || business?.image || normalizedMedia[0]?.src || "",
  };
}

export function normalizeMedia({ media = [], photos = [], videos = [], business = {} } = {}) {
  const normalized = [];

  const pushMedia = (item, fallbackType = "image") => {
    if (!item) return;

    if (typeof item === "string") {
      normalized.push({ id: createSceneId(), src: item, type: fallbackType, fileName: "" });
      return;
    }

    if (typeof item === "object" && item.src) {
      normalized.push({
        id: item.id || createSceneId(),
        src: item.src,
        type: item.type === "video" || item.mediaType === "video" ? "video" : "image",
        fileName: item.fileName || "",
      });
    }
  };

  media.forEach((item) => pushMedia(item));
  photos.forEach((item) => pushMedia(item, "image"));
  videos.forEach((item) => pushMedia(item, "video"));

  if (business?.image) pushMedia(business.image, "image");
  if (Array.isArray(business?.images)) {
    business.images.forEach((item) => pushMedia(item, "image"));
  }

  const seen = new Set();
  return normalized.filter((item) => {
    if (!item.src || seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
}

export function createDirectedScene({
  type = SCENE_TYPES.PRODUCT,
  media = null,
  title = "",
  subtitle = "",
  duration = 3,
  camera = "pushIn",
  transition = "fade",
  model = "cinematic",
  textPosition = "bottom",
  textAlign = "left",
  overlayOpacity,
  titleSize,
  subtitleSize,
  titleFont,
  subtitleFont,
  titleColor,
  subtitleColor,
  cameraIntensity = 1,
  cameraEasing = "cinematic",
  seed = 0,
  isEndScene = false,
} = {}) {
  const style = getDirectorVisualStyle(model);

  return {
    id: createSceneId(),
    sceneType: type,
    media: media?.src || "",
    mediaType: media?.type || "image",
    fileName: media?.fileName || "",
    title,
    subtitle,
    duration: clamp(Number(duration) || 3, 1, 10),
    camera,
    cameraIntensity: clamp(Number(cameraIntensity) || 1, 0.2, 2),
    cameraEasing,
    cameraSeed: seed,
    transition,
    textPosition,
    textAlign,
    titleFont: titleFont || style.titleFont,
    subtitleFont: subtitleFont || style.subtitleFont,
    titleColor: titleColor || style.titleColor,
    subtitleColor: subtitleColor || style.subtitleColor,
    titleSize: Number(titleSize) || style.titleSize,
    subtitleSize: Number(subtitleSize) || style.subtitleSize,
    overlayOpacity:
      overlayOpacity === undefined ? style.overlayOpacity : clamp(Number(overlayOpacity) || 0, 0, 0.95),
    isEndScene,
    enabled: true,
  };
}

export function distributeDurations(scenes = [], targetDuration = 15) {
  if (!scenes.length) return [];
  const safeTarget = clamp(Number(targetDuration) || 15, scenes.length, scenes.length * 10);
  const weights = scenes.map((scene) => getSceneDurationWeight(scene.sceneType));
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);

  return scenes.map((scene, index) => ({
    ...scene,
    duration: clamp((safeTarget * weights[index]) / totalWeight, 1, 10),
  }));
}

export function getSceneDurationWeight(sceneType) {
  switch (sceneType) {
    case SCENE_TYPES.HOOK: return 0.8;
    case SCENE_TYPES.PROMOTION: return 0.9;
    case SCENE_TYPES.DETAIL: return 1.05;
    case SCENE_TYPES.PRODUCT: return 1.1;
    case SCENE_TYPES.LOCATION: return 1;
    case SCENE_TYPES.SOCIAL: return 0.95;
    case SCENE_TYPES.LOGO: return 0.9;
    case SCENE_TYPES.CTA: return 0.9;
    case SCENE_TYPES.END: return 1;
    default: return 1;
  }
}

export function getDirectorVisualStyle(model = "cinematic") {
  const mappedModel =
    model === DIRECTOR_STYLES.PREMIUM || model === DIRECTOR_STYLES.ELEGANT
      ? "minimal"
      : model === DIRECTOR_STYLES.COMMERCIAL || model === DIRECTOR_STYLES.OFFER
      ? "commercial"
      : "cinematic";

  return getReelStyle(mappedModel);
}

export function cycleMedia(media = [], index = 0) {
  if (!media.length) return null;
  return media[index % media.length];
}

export function createEndScene({ context, model = "cinematic", title, subtitle, seed = 99 } = {}) {
  return createDirectedScene({
    type: SCENE_TYPES.END,
    media: context?.logo ? { src: context.logo, type: "image" } : null,
    title: title || context?.businessName || "TusComercios",
    subtitle:
      subtitle ||
      (context?.whatsapp
        ? `WhatsApp: ${context.whatsapp}`
        : context?.mode === DIRECTOR_MODES.ADMIN
        ? "Descubrí comercios, servicios y profesionales"
        : "Encontranos en TusComercios"),
    duration: 3,
    camera: "pushIn",
    transition: "fade",
    model,
    textPosition: "center",
    textAlign: "center",
    overlayOpacity: 0.68,
    titleSize: 94,
    subtitleSize: 36,
    cameraIntensity: 0.75,
    cameraEasing: "cinematic",
    seed,
    isEndScene: true,
  });
}

export function normalizeCategory(value = "") {
  const text = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (text.includes("hamburg") || text.includes("restaurant") || text.includes("comida") ||
      text.includes("panader") || text.includes("pasteler") || text.includes("gastronom")) {
    return "gastronomy";
  }

  if (text.includes("ferreter") || text.includes("herramient")) return "hardware";
  if (text.includes("indument") || text.includes("ropa") || text.includes("moda") || text.includes("boutique")) {
    return "fashion";
  }
  if (text.includes("inmobili") || text.includes("propiedad")) return "realestate";
  if (text.includes("turismo") || text.includes("hotel") || text.includes("cabana") || text.includes("alojamiento")) {
    return "tourism";
  }
  if (text.includes("auto") || text.includes("moto") || text.includes("vehiculo")) return "automotive";
  if (text.includes("estetica") || text.includes("spa") || text.includes("peluquer") || text.includes("belleza")) {
    return "beauty";
  }

  return "general";
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
