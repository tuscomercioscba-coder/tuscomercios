export const ELEMENT_TYPES = {
  IMAGE: "image",
  TEXT: "text",
  LOGO: "logo",
  SHAPE: "shape",
  ICON: "icon",
  STICKER: "sticker",
  LINE: "line",
};

export const FORMAT_SIZES = {
  "1:1": { width: 1080, height: 1080, label: "Post cuadrado" },
  "4:5": { width: 1080, height: 1350, label: "Post vertical" },
  "9:16": { width: 1080, height: 1920, label: "Historia / Reel" },
  "16:9": { width: 1920, height: 1080, label: "Banner horizontal" },
};


export const SOCIAL_PRESETS = [
  {
    id: "instagram-post",
    label: "Instagram publicación",
    format: "1:1",
    width: 1080,
    height: 1080,
  },
  {
    id: "instagram-portrait",
    label: "Instagram vertical",
    format: "4:5",
    width: 1080,
    height: 1350,
  },
  {
    id: "story",
    label: "Historia / Estado",
    format: "9:16",
    width: 1080,
    height: 1920,
  },
  {
    id: "reel-cover",
    label: "Portada de Reel",
    format: "9:16",
    width: 1080,
    height: 1920,
  },
  {
    id: "facebook",
    label: "Facebook horizontal",
    format: "16:9",
    width: 1920,
    height: 1080,
  },
  {
    id: "google-business",
    label: "Google Business",
    format: "4:5",
    width: 1080,
    height: 1350,
  },
];

export const DESIGN_CATEGORIES = [
  {
    id: "sale",
    name: "Oferta fuerte",
    title: "OFERTA ESPECIAL",
    subtitle: "Aprovechá esta oportunidad por tiempo limitado.",
    badge: "PROMO",
    background: {
      type: "linear",
      colors: ["#7f1d1d", "#dc2626", "#f97316"],
      stops: [0, 0.55, 1],
    },
    titleColor: "#ffffff",
    subtitleColor: "#fee2e2",
    accentColor: "#facc15",
  },
  {
    id: "premium",
    name: "Premium",
    title: "DESTACADO",
    subtitle: "Calidad, atención y una propuesta diferente.",
    badge: "NUEVO",
    background: {
      type: "linear",
      colors: ["#020617", "#111827", "#27272a"],
      stops: [0, 0.55, 1],
    },
    titleColor: "#ffffff",
    subtitleColor: "#d1d5db",
    accentColor: "#d4af37",
  },
  {
    id: "modern",
    name: "Moderno",
    title: "NOVEDAD",
    subtitle: "Descubrí una nueva forma de elegir.",
    badge: "HOY",
    background: {
      type: "linear",
      colors: ["#0f172a", "#1d4ed8", "#06b6d4"],
      stops: [0, 0.55, 1],
    },
    titleColor: "#ffffff",
    subtitleColor: "#e0f2fe",
    accentColor: "#38bdf8",
  },
  {
    id: "clean",
    name: "Limpio",
    title: "CONOCÉ MÁS",
    subtitle: "Información clara, simple y profesional.",
    badge: "INFO",
    background: {
      type: "solid",
      color: "#f8fafc",
    },
    titleColor: "#0f172a",
    subtitleColor: "#475569",
    accentColor: "#2563eb",
  },
];

export const ICON_LIBRARY = [
  // Contacto
  { id: "phone", label: "Teléfono", symbol: "📞", category: "Contacto" },
  { id: "mobile", label: "Celular", symbol: "📱", category: "Contacto" },
  { id: "message", label: "Mensaje", symbol: "💬", category: "Contacto" },
  { id: "email", label: "Correo", symbol: "✉️", category: "Contacto" },
  { id: "announcement", label: "Anuncio", symbol: "📢", category: "Contacto" },

  // Ubicación y horarios
  { id: "location", label: "Ubicación", symbol: "📍", category: "Información" },
  { id: "map", label: "Mapa", symbol: "🗺️", category: "Información" },
  { id: "clock", label: "Horario", symbol: "🕒", category: "Información" },
  { id: "calendar", label: "Calendario", symbol: "📅", category: "Información" },
  { id: "home", label: "Domicilio", symbol: "🏠", category: "Información" },

  // Comercio y productos
  { id: "shopping-bag", label: "Compras", symbol: "🛍️", category: "Comercio" },
  { id: "cart", label: "Carrito", symbol: "🛒", category: "Comercio" },
  { id: "store", label: "Tienda", symbol: "🏪", category: "Comercio" },
  { id: "package", label: "Producto", symbol: "📦", category: "Comercio" },
  { id: "gift", label: "Regalo", symbol: "🎁", category: "Comercio" },
  { id: "new-product", label: "Nuevo producto", symbol: "🆕", category: "Comercio" },
  { id: "barcode", label: "Código", symbol: "🏷️", category: "Comercio" },

  // Pagos
  { id: "card", label: "Tarjeta", symbol: "💳", category: "Pagos" },
  { id: "cash", label: "Efectivo", symbol: "$", category: "Pagos" },
  { id: "money", label: "Dinero", symbol: "$$", category: "Pagos" },
  { id: "bank", label: "Banco", symbol: "🏦", category: "Pagos" },
  { id: "receipt", label: "Comprobante", symbol: "🧾", category: "Pagos" },
  { id: "discount", label: "Descuento", symbol: "🏷️", category: "Pagos" },

  // Envíos
  { id: "delivery", label: "Delivery", symbol: "🛵", category: "Envíos" },
  { id: "truck", label: "Envío", symbol: "🚚", category: "Envíos" },
  { id: "fast-delivery", label: "Envío rápido", symbol: "⚡", category: "Envíos" },
  { id: "pickup", label: "Retiro", symbol: "🤝", category: "Envíos" },
  { id: "world", label: "Envíos nacionales", symbol: "🌎", category: "Envíos" },

  // Promociones
  { id: "fire", label: "Oferta destacada", symbol: "🔥", category: "Promociones" },
  { id: "megaphone", label: "Promoción", symbol: "📣", category: "Promociones" },
  { id: "party", label: "Celebración", symbol: "🎉", category: "Promociones" },
  { id: "confetti", label: "Novedad", symbol: "🎊", category: "Promociones" },
  { id: "rocket", label: "Lanzamiento", symbol: "🚀", category: "Promociones" },
  { id: "lightning", label: "Oferta flash", symbol: "⚡", category: "Promociones" },
  { id: "hundred", label: "Imperdible", symbol: "💯", category: "Promociones" },

  // Valoraciones
  { id: "star", label: "Estrella", symbol: "⭐", category: "Valoraciones" },
  { id: "heart", label: "Corazón", symbol: "❤️", category: "Valoraciones" },
  { id: "like", label: "Me gusta", symbol: "👍", category: "Valoraciones" },
  { id: "check", label: "Aprobado", symbol: "✅", category: "Valoraciones" },
  { id: "recommended", label: "Recomendado", symbol: "🏆", category: "Valoraciones" },
  { id: "quality", label: "Calidad", symbol: "💎", category: "Valoraciones" },
  { id: "verified", label: "Verificado", symbol: "🛡️", category: "Valoraciones" },

  // Gastronomía
  { id: "food", label: "Comida", symbol: "🍽️", category: "Gastronomía" },
  { id: "burger", label: "Hamburguesa", symbol: "🍔", category: "Gastronomía" },
  { id: "pizza", label: "Pizza", symbol: "🍕", category: "Gastronomía" },
  { id: "coffee", label: "Café", symbol: "☕", category: "Gastronomía" },
  { id: "bakery", label: "Panadería", symbol: "🥐", category: "Gastronomía" },
  { id: "cake", label: "Pastelería", symbol: "🎂", category: "Gastronomía" },
  { id: "ice-cream", label: "Helado", symbol: "🍦", category: "Gastronomía" },
  { id: "drink", label: "Bebida", symbol: "🥤", category: "Gastronomía" },

  // Belleza y salud
  { id: "beauty", label: "Belleza", symbol: "💄", category: "Belleza" },
  { id: "hair", label: "Peluquería", symbol: "💇", category: "Belleza" },
  { id: "nails", label: "Manicura", symbol: "💅", category: "Belleza" },
  { id: "spa", label: "Spa", symbol: "🧖", category: "Belleza" },
  { id: "health", label: "Salud", symbol: "⚕️", category: "Salud" },
  { id: "medical", label: "Atención médica", symbol: "🩺", category: "Salud" },
  { id: "pharmacy", label: "Farmacia", symbol: "💊", category: "Salud" },

  // Servicios
  { id: "tools", label: "Herramientas", symbol: "🛠️", category: "Servicios" },
  { id: "repair", label: "Reparación", symbol: "🔧", category: "Servicios" },
  { id: "electricity", label: "Electricidad", symbol: "💡", category: "Servicios" },
  { id: "construction", label: "Construcción", symbol: "🏗️", category: "Servicios" },
  { id: "cleaning", label: "Limpieza", symbol: "🧹", category: "Servicios" },
  { id: "security", label: "Seguridad", symbol: "🔒", category: "Servicios" },
  { id: "technology", label: "Tecnología", symbol: "💻", category: "Servicios" },

  // Vehículos
  { id: "car", label: "Automóvil", symbol: "🚗", category: "Vehículos" },
  { id: "motorcycle", label: "Moto", symbol: "🏍️", category: "Vehículos" },
  { id: "mechanic", label: "Mecánica", symbol: "🔩", category: "Vehículos" },
  { id: "fuel", label: "Combustible", symbol: "⛽", category: "Vehículos" },
  { id: "wash", label: "Lavado", symbol: "🫧", category: "Vehículos" },

  // Mascotas
  { id: "pets", label: "Mascotas", symbol: "🐾", category: "Mascotas" },
  { id: "dog", label: "Perro", symbol: "🐶", category: "Mascotas" },
  { id: "cat", label: "Gato", symbol: "🐱", category: "Mascotas" },

  // Otros
  { id: "camera", label: "Fotografía", symbol: "📸", category: "Otros" },
  { id: "music", label: "Música", symbol: "🎵", category: "Otros" },
  { id: "education", label: "Educación", symbol: "🎓", category: "Otros" },
  { id: "sport", label: "Deportes", symbol: "⚽", category: "Otros" },
  { id: "idea", label: "Idea", symbol: "💡", category: "Otros" },
  { id: "sparkles", label: "Destacado", symbol: "✨", category: "Otros" },
];

export const STICKER_LIBRARY = [
  { id: "new", label: "NUEVO", text: "NUEVO", fill: "#2563eb", color: "#ffffff" },
  { id: "promo", label: "PROMO", text: "PROMO", fill: "#dc2626", color: "#ffffff" },
  { id: "off", label: "20% OFF", text: "20% OFF", fill: "#facc15", color: "#7f1d1d" },
  { id: "today", label: "HOY", text: "HOY", fill: "#16a34a", color: "#ffffff" },
  { id: "recommended", label: "RECOMENDADO", text: "RECOMENDADO", fill: "#7c3aed", color: "#ffffff" },
];

export const SAFE_MARGIN_PRESETS = [
  { id: "none", label: "Sin márgenes", value: 0 },
  { id: "small", label: "Pequeños", value: 48 },
  { id: "medium", label: "Recomendados", value: 80 },
  { id: "large", label: "Amplios", value: 120 },
];

export const FONT_OPTIONS = [
  "Arial",
  "Inter",
  "Poppins",
  "Montserrat",
  "Impact",
  "Georgia",
];

export const BACKGROUND_PRESETS = [
  { id: "dark", label: "Oscuro", value: { type: "solid", color: "#0f172a" } },
  { id: "blue", label: "Azul", value: { type: "solid", color: "#1d4ed8" } },
  { id: "violet", label: "Violeta", value: { type: "solid", color: "#5b21b6" } },
  { id: "green", label: "Verde", value: { type: "solid", color: "#166534" } },
  { id: "white", label: "Blanco", value: { type: "solid", color: "#ffffff" } },
  {
    id: "premium",
    label: "Premium",
    value: {
      type: "linear",
      colors: ["#020617", "#312e81", "#0f172a"],
      stops: [0, 0.5, 1],
    },
  },
  {
    id: "modern",
    label: "Moderno",
    value: {
      type: "linear",
      colors: ["#0f172a", "#1d4ed8", "#06b6d4"],
      stops: [0, 0.55, 1],
    },
  },
  {
    id: "warm",
    label: "Cálido",
    value: {
      type: "linear",
      colors: ["#7c2d12", "#ea580c", "#f59e0b"],
      stops: [0, 0.55, 1],
    },
  },
];

export const QUICK_TEMPLATES = [
  {
    id: "promo",
    name: "Promoción",
    title: "PROMO ESPECIAL",
    subtitle: "Aprovechá esta oportunidad por tiempo limitado.",
    titleColor: "#ffffff",
    subtitleColor: "#ffffff",
    background: {
      type: "linear",
      colors: ["#7f1d1d", "#dc2626", "#f97316"],
      stops: [0, 0.55, 1],
    },
  },
  {
    id: "new",
    name: "Novedad",
    title: "NOVEDAD",
    subtitle: "Nuevo ingreso disponible. Consultanos.",
    titleColor: "#ffffff",
    subtitleColor: "#dbeafe",
    background: {
      type: "linear",
      colors: ["#020617", "#1d4ed8", "#06b6d4"],
      stops: [0, 0.55, 1],
    },
  },
  {
    id: "premium",
    name: "Premium",
    title: "DESTACADO",
    subtitle: "Calidad, atención y una propuesta diferente.",
    titleColor: "#ffffff",
    subtitleColor: "#d1d5db",
    background: {
      type: "linear",
      colors: ["#030712", "#111827", "#27272a"],
      stops: [0, 0.55, 1],
    },
  },
];

export function createElement(type, overrides = {}) {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (type === ELEMENT_TYPES.TEXT) {
    return {
      id,
      type,
      name: "Texto",
      x: 120,
      y: 120,
      width: 560,
      height: 160,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      text: "Nuevo texto",
      fontSize: 72,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#ffffff",
      align: "left",
      lineHeight: 1.05,
      letterSpacing: 0,
      shadowEnabled: true,
      shadowColor: "#000000",
      shadowOpacity: 0.35,
      shadowBlur: 14,
      shadowOffsetX: 0,
      shadowOffsetY: 6,
      strokeEnabled: false,
      stroke: "#000000",
      strokeWidth: 2,
      ...overrides,
    };
  }

  if (type === ELEMENT_TYPES.SHAPE) {
    return {
      id,
      type,
      name: "Forma",
      x: 140,
      y: 140,
      width: 360,
      height: 180,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      fill: "#2563eb",
      cornerRadius: 28,
      strokeEnabled: false,
      stroke: "#ffffff",
      strokeWidth: 3,
      shadowEnabled: false,
      shadowColor: "#000000",
      shadowOpacity: 0.25,
      shadowBlur: 18,
      shadowOffsetX: 0,
      shadowOffsetY: 8,
      ...overrides,
    };
  }

  if (type === ELEMENT_TYPES.ICON) {
    return { id, type, name: "Ícono", x: 140, y: 140, width: 160, height: 160, rotation: 0, opacity: 1, locked: false, hidden: false, symbol: "★", fill: "#ffffff", fontSize: 130, shadowEnabled: true, shadowColor: "#000000", shadowOpacity: .25, shadowBlur: 12, shadowOffsetX: 0, shadowOffsetY: 5, ...overrides };
  }

  if (type === ELEMENT_TYPES.STICKER) {
    return { id, type, name: "Sticker", x: 140, y: 140, width: 280, height: 100, rotation: -4, opacity: 1, locked: false, hidden: false, text: "NUEVO", fill: "#2563eb", color: "#ffffff", fontSize: 42, fontFamily: "Arial", cornerRadius: 999, shadowEnabled: true, shadowColor: "#000000", shadowOpacity: .25, shadowBlur: 14, shadowOffsetX: 0, shadowOffsetY: 7, ...overrides };
  }

  if (type === ELEMENT_TYPES.LINE) {
    return { id, type, name: "Línea", x: 140, y: 140, width: 420, height: 8, rotation: 0, opacity: 1, locked: false, hidden: false, fill: "#ffffff", dashEnabled: false, dashSize: 18, gapSize: 12, ...overrides };
  }

  return {
    id,
    type,
    name: type === ELEMENT_TYPES.LOGO ? "Logo" : "Imagen",
    x: 120,
    y: 120,
    width: type === ELEMENT_TYPES.LOGO ? 180 : 520,
    height: type === ELEMENT_TYPES.LOGO ? 180 : 520,
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
    src: "",
    fit: "contain",
    imageScale: 1,
    imageRotation: 0,
    flipX: false,
    flipY: false,
    cropOffsetX: 0,
    cropOffsetY: 0,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    grayscale: 0,
    cornerRadius: type === ELEMENT_TYPES.LOGO ? 0 : 24,
    backgroundColor: "transparent",
    shadowEnabled: false,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowBlur: 18,
    shadowOffsetX: 0,
    shadowOffsetY: 8,
    ...overrides,
  };
}
