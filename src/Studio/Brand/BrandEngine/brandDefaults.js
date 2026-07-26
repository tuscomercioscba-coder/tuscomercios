export const BRAND_KIT_VERSION = 1;

export const BRAND_STYLE_OPTIONS = [
  { id: "premium", name: "Premium" },
  { id: "modern", name: "Moderno" },
  { id: "minimal", name: "Minimal" },
  { id: "elegant", name: "Elegante" },
  { id: "vintage", name: "Vintage" },
  { id: "strongOffer", name: "Oferta fuerte" },
];

export const BRAND_FONT_OPTIONS = [
  {
    id: "inter",
    name: "Inter",
    family: "Inter, Arial, sans-serif",
  },
  {
    id: "montserrat",
    name: "Montserrat",
    family: "Montserrat, Arial, sans-serif",
  },
  {
    id: "poppins",
    name: "Poppins",
    family: "Poppins, Arial, sans-serif",
  },
  {
    id: "playfair",
    name: "Playfair Display",
    family: "'Playfair Display', Georgia, serif",
  },
  {
    id: "georgia",
    name: "Georgia",
    family: "Georgia, serif",
  },
  {
    id: "impact",
    name: "Impacto",
    family: "Impact, 'Arial Black', sans-serif",
  },
];

export const BRAND_CTA_OPTIONS = [
  "Consultanos por WhatsApp",
  "Escribinos",
  "Reservá ahora",
  "Pedí tu presupuesto",
  "Conocé más",
  "Comprá ahora",
  "Visitá nuestro local",
];

export const WATERMARK_POSITIONS = [
  { id: "topLeft", name: "Arriba izquierda" },
  { id: "topRight", name: "Arriba derecha" },
  { id: "bottomLeft", name: "Abajo izquierda" },
  { id: "bottomRight", name: "Abajo derecha" },
  { id: "center", name: "Centro" },
];

export const DEFAULT_BRAND_KIT = {
  version: BRAND_KIT_VERSION,

  identity: {
    businessName: "",
    slogan: "",
    shortDescription: "",
  },

  logos: {
    primary: "",
    white: "",
    dark: "",
    symbol: "",
  },

  colors: {
    primary: "#2563eb",
    secondary: "#0f172a",
    accent: "#22c55e",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    textSoft: "#64748b",
  },

  typography: {
    primaryFont: "inter",
    secondaryFont: "montserrat",
    titleWeight: 900,
    bodyWeight: 600,
  },

  style: {
    preferredStyle: "premium",
    cornerRadius: 24,
    shadowStrength: 35,
    overlayStrength: 45,
  },

  button: {
    backgroundColor: "#22c55e",
    textColor: "#ffffff",
    borderColor: "#22c55e",
    borderWidth: 0,
    borderRadius: 18,
    shadowStrength: 30,
  },

  watermark: {
    enabled: false,
    source: "primary",
    opacity: 18,
    position: "bottomRight",
    size: 16,
  },

  contact: {
    whatsapp: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    website: "",
  },

  content: {
    preferredCta: "Consultanos por WhatsApp",
    signatureText: "",
    favoriteAnimation: "cinematic",
    favoriteMusic: "",
    reelEnding: "brand",
  },

  metadata: {
    businessId: "",
    createdAt: "",
    updatedAt: "",
  },
};

export function createDefaultBrandKit(overrides = {}) {
  return mergeBrandKit(DEFAULT_BRAND_KIT, overrides);
}

function mergeBrandKit(base, overrides) {
  const result = structuredCloneSafe(base);

  Object.entries(overrides || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = {
        ...result[key],
        ...value,
      };
    } else {
      result[key] = value;
    }
  });

  return result;
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}
