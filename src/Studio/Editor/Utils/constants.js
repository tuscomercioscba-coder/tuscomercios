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

export const MODERN_ICON_PATHS = {
  phone: "M22 16.92v3a08a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3.08a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.13 9.93a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92z",
  message: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm18 2-10 7L2 6",
  "map-pin": "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-14v4l3 2",
  calendar: "M3 5h18v16H3zM16 3v4M8 3v4M3 10h18",
  home: "M3 11 12 3l9 8v10h-6v-6H9v6H3z",
  store: "M3 9l2-6h14l2 6v3a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zm2 5v7h14v-7",
  cart: "M3 3h2l2.4 11.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6M10 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm9 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z",
  bag: "M6 8h12l1 13H5L6 8zm3 0V6a3 3 0 0 1 6 0v2",
  package: "M21 8 12 13 3 8l9-5 9 5zm-18 0v9l9 5 9-5V8M12 13v9",
  gift: "M20 12v10H4V12M2 7h20v5H2zM12 7H7.5A2.5 2.5 0 1 1 10 4.5L12 7zm0 0h4.5A2.5 2.5 0 1 0 14 4.5L12 7zm0 0v15",
  card: "M3 5h18v14H3zM3 10h18M7 15h2",
  truck: "M3 6h11v11H3zM14 10h4l3 3v4h-7zM8 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  megaphone: "M3 11v2l14 5V6L3 11zm0 0v2M7 14l1 6h4l-2-5",
  tag: "M20 13 13 20 4 11V4h7zM8.5 8.5h.01",
  percent: "M19 5 5 19M7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z",
  star: "m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 22 7 15.2 2 10.3l6.9-1z",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z",
  check: "M20 6 9 17l-5-5",
  sparkles: "m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3zm7 12 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z",
  camera: "M3 7h4l2-3h6l2 3h4v13H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  music: "M9 18V5l10-2v13M9 18a3 3 0 1 1-3-3h3m10 1a3 3 0 1 1-3-3h3",
  wrench: "M14.7 6.3a4 4 0 0 0-5-5L7.3 3.7l3 3-3.6 3.6-3-3-2.4 2.4a4 4 0 0 0 5 5L15 6zM13 11l8 8-2 2-8-8",
  paw: "M8 14c-2 0-4 2-4 4s2 3 4 3c1.5 0 2.5-1 4-1s2.5 1 4 1c2 0 4-1 4-3s-2-4-4-4c-1.5 0-2.5 1-4 1s-2.5-1-4-1zM5 11a2 3 0 1 0 0-6 2 3 0 0 0 0 6zm5-2a2 3 0 1 0 0-6 2 3 0 0 0 0 6zm4 0a2 3 0 1 0 0-6 2 3 0 0 0 0 6zm5 2a2 3 0 1 0 0-6 2 3 0 0 0 0 6z",
  cake: "M4 10h16v11H4zM8 10V7m4 3V6m4 4V7M3 15c2 2 4-2 6 0s4 2 6 0 4 2 6 0M8 4h.01M12 3h.01M16 4h.01",
  tree: "m12 2-5 7h3l-5 7h5v6h4v-6h5l-5-7h3z",
  sun: "M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42",
  balloon: "M12 16c4 0 7-3.1 7-7s-3.1-7-7-7-7 3.1-7 7 3 7 7 7zm0 0-2 3h4l-2-3zm0 3v3",
  flag: "M5 22V3m0 1c5-3 9 3 14 0v10c-5 3-9-3-14 0",
};

export const MODERN_ICON_LIBRARY = [
  ["phone", "Teléfono", "Contacto"], ["message", "Mensaje", "Contacto"], ["mail", "Correo", "Contacto"],
  ["map-pin", "Ubicación", "Información"], ["clock", "Horarios", "Información"], ["calendar", "Calendario", "Información"], ["home", "Domicilio", "Información"],
  ["store", "Comercio", "Negocios"], ["cart", "Carrito", "Negocios"], ["bag", "Compras", "Negocios"], ["package", "Producto", "Negocios"], ["gift", "Regalo", "Negocios"],
  ["card", "Tarjeta", "Ventas"], ["truck", "Envíos", "Ventas"], ["megaphone", "Promoción", "Ventas"], ["tag", "Etiqueta", "Ventas"], ["percent", "Descuento", "Ventas"],
  ["star", "Destacado", "Social"], ["heart", "Corazón", "Social"], ["check", "Aprobado", "Social"], ["sparkles", "Brillos", "Social"],
  ["camera", "Fotografía", "Contenido"], ["music", "Música", "Contenido"], ["wrench", "Servicios", "Profesiones"], ["paw", "Mascotas", "Profesiones"],
  ["cake", "Cumpleaños", "Fechas"], ["tree", "Navidad", "Fechas"], ["sun", "Verano", "Fechas"], ["balloon", "Celebración", "Fechas"], ["flag", "Argentina", "Fechas"],
].map(([id, label, category]) => ({
  id: `modern-${id}`,
  label,
  category,
  path: MODERN_ICON_PATHS[id],
}));

export const MODERN_STICKER_LIBRARY = [
  ["new", "NUEVO", "#2563eb", "#ffffff", 999, "Lanzamientos"],
  ["just-arrived", "RECIÉN LLEGADO", "#111827", "#ffffff", 18, "Lanzamientos"],
  ["limited", "EDICIÓN LIMITADA", "#7c3aed", "#ffffff", 8, "Lanzamientos"],
  ["promo", "PROMO", "#e11d48", "#ffffff", 999, "Promociones"],
  ["offer", "OFERTA ESPECIAL", "#dc2626", "#ffffff", 18, "Promociones"],
  ["flash", "OFERTA FLASH", "#facc15", "#111827", 8, "Promociones"],
  ["off10", "10% OFF", "#0f172a", "#ffffff", 999, "Descuentos"],
  ["off20", "20% OFF", "#f97316", "#ffffff", 18, "Descuentos"],
  ["off30", "30% OFF", "#db2777", "#ffffff", 8, "Descuentos"],
  ["off50", "50% OFF", "#7c3aed", "#ffffff", 999, "Descuentos"],
  ["2x1", "2 × 1", "#0891b2", "#ffffff", 18, "Descuentos"],
  ["3x2", "3 × 2", "#059669", "#ffffff", 8, "Descuentos"],
  ["today", "SOLO HOY", "#16a34a", "#ffffff", 999, "Urgencia"],
  ["last", "ÚLTIMAS UNIDADES", "#991b1b", "#ffffff", 18, "Urgencia"],
  ["until", "HASTA AGOTAR STOCK", "#334155", "#ffffff", 8, "Urgencia"],
  ["delivery", "ENVÍOS", "#0284c7", "#ffffff", 999, "Servicios"],
  ["free-delivery", "ENVÍO GRATIS", "#0f766e", "#ffffff", 18, "Servicios"],
  ["takeaway", "PEDÍ Y RETIRÁ", "#4f46e5", "#ffffff", 8, "Servicios"],
  ["open", "ABIERTO", "#22c55e", "#052e16", 999, "Estado"],
  ["closed", "CERRADO", "#e2e8f0", "#334155", 18, "Estado"],
  ["reserve", "RESERVÁ AHORA", "#9333ea", "#ffffff", 8, "Acción"],
  ["write", "ESCRIBINOS", "#2563eb", "#ffffff", 999, "Acción"],
  ["more", "CONOCÉ MÁS", "#111827", "#ffffff", 18, "Acción"],
  ["recommended", "RECOMENDADO", "#d4af37", "#111827", 8, "Confianza"],
].map(([id, text, fill, color, cornerRadius, category]) => ({
  id: `modern-${id}`,
  label: text,
  text,
  fill,
  color,
  cornerRadius,
  category,
  stroke: "rgba(255,255,255,.35)",
  strokeWidth: 2,
}));

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
    icon: "🔥",
    description: "Para descuentos y oportunidades",
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
    icon: "✨",
    description: "Para lanzamientos y nuevos ingresos",
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
    icon: "⭐",
    description: "Para destacar calidad y confianza",
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
  {
    id: "service",
    name: "Servicio",
    icon: "🛠️",
    description: "Para explicar qué hacés y recibir consultas",
    title: "ESTAMOS PARA AYUDARTE",
    subtitle: "Atención profesional. Escribinos y pedí tu presupuesto.",
    titleColor: "#ffffff",
    subtitleColor: "#dbeafe",
    background: {
      type: "linear",
      colors: ["#0f172a", "#1d4ed8", "#2563eb"],
      stops: [0, 0.55, 1],
    },
  },
  {
    id: "event",
    name: "Evento",
    icon: "🎉",
    description: "Para fechas especiales y convocatorias",
    title: "¡TE ESPERAMOS!",
    subtitle: "Agendá la fecha y compartí este anuncio.",
    titleColor: "#ffffff",
    subtitleColor: "#fef3c7",
    background: {
      type: "linear",
      colors: ["#581c87", "#c026d3", "#f97316"],
      stops: [0, 0.55, 1],
    },
  },
  {
    id: "hours",
    name: "Horarios",
    icon: "🕒",
    description: "Para comunicar atención y disponibilidad",
    title: "NUESTROS HORARIOS",
    subtitle: "Consultanos para coordinar tu visita.",
    titleColor: "#0f172a",
    subtitleColor: "#475569",
    background: {
      type: "solid",
      color: "#f8fafc",
    },
  },
];

export const HOLIDAY_TEMPLATES = [
  {
    id: "father-blue", holiday: "Día del Padre", variant: "Clásica", icon: "👔",
    title: "FELIZ DÍA, PAPÁ", subtitle: "Celebramos a quienes siempre están.",
    titleColor: "#ffffff", subtitleColor: "#dbeafe",
    background: { type: "linear", colors: ["#172554", "#1d4ed8", "#38bdf8"], stops: [0, .55, 1] },
  },
  {
    id: "father-warm", holiday: "Día del Padre", variant: "Cálida", icon: "🧔",
    title: "GRACIAS, PAPÁ", subtitle: "Hoy queremos homenajearte.",
    titleColor: "#fff7ed", subtitleColor: "#fed7aa",
    background: { type: "linear", colors: ["#431407", "#c2410c", "#f59e0b"], stops: [0, .55, 1] },
  },
  {
    id: "father-sale", holiday: "Día del Padre", variant: "Promoción", icon: "🎁",
    title: "REGALOS PARA PAPÁ", subtitle: "Encontrá el detalle perfecto. Consultanos.",
    titleColor: "#ffffff", subtitleColor: "#fef3c7",
    background: { type: "linear", colors: ["#111827", "#374151", "#d4af37"], stops: [0, .62, 1] },
  },
  {
    id: "mother-pink", holiday: "Día de la Madre", variant: "Clásica", icon: "💐",
    title: "FELIZ DÍA, MAMÁ", subtitle: "Todo nuestro amor para vos.",
    titleColor: "#ffffff", subtitleColor: "#fce7f3",
    background: { type: "linear", colors: ["#831843", "#db2777", "#fb7185"], stops: [0, .55, 1] },
  },
  {
    id: "mother-soft", holiday: "Día de la Madre", variant: "Delicada", icon: "🌷",
    title: "GRACIAS, MAMÁ", subtitle: "Por tu amor que hace especial cada día.",
    titleColor: "#4c1d3d", subtitleColor: "#831843",
    background: { type: "linear", colors: ["#fff1f2", "#fce7f3", "#fbcfe8"], stops: [0, .55, 1] },
  },
  {
    id: "mother-sale", holiday: "Día de la Madre", variant: "Promoción", icon: "🎁",
    title: "UN REGALO PARA MAMÁ", subtitle: "Elegí algo tan especial como ella.",
    titleColor: "#ffffff", subtitleColor: "#fdf2f8",
    background: { type: "linear", colors: ["#4a044e", "#a21caf", "#f472b6"], stops: [0, .55, 1] },
  },
  {
    id: "children-color", holiday: "Día del Niño", variant: "Divertida", icon: "🎈",
    title: "FELIZ DÍA DE LAS INFANCIAS", subtitle: "Que nunca falten juegos, sueños y sonrisas.",
    titleColor: "#ffffff", subtitleColor: "#fef9c3",
    background: { type: "linear", colors: ["#1d4ed8", "#7c3aed", "#ec4899"], stops: [0, .5, 1] },
  },
  {
    id: "children-sky", holiday: "Día del Niño", variant: "Alegre", icon: "🧸",
    title: "HOY FESTEJAMOS", subtitle: "Un día lleno de alegría para los más chicos.",
    titleColor: "#0f172a", subtitleColor: "#334155",
    background: { type: "linear", colors: ["#bae6fd", "#fde68a", "#fbcfe8"], stops: [0, .52, 1] },
  },
  {
    id: "children-sale", holiday: "Día del Niño", variant: "Promoción", icon: "🎁",
    title: "REGALOS QUE SORPRENDEN", subtitle: "Promociones especiales para celebrar.",
    titleColor: "#ffffff", subtitleColor: "#e0f2fe",
    background: { type: "linear", colors: ["#075985", "#0284c7", "#22c55e"], stops: [0, .55, 1] },
  },
  {
    id: "christmas-red", holiday: "Navidad", variant: "Tradicional", icon: "🎄",
    title: "¡FELIZ NAVIDAD!", subtitle: "Que la magia de estas fiestas llegue a cada hogar.",
    titleColor: "#ffffff", subtitleColor: "#fef3c7",
    background: { type: "linear", colors: ["#7f1d1d", "#dc2626", "#166534"], stops: [0, .58, 1] },
  },
  {
    id: "christmas-night", holiday: "Navidad", variant: "Elegante", icon: "✨",
    title: "NAVIDAD ES COMPARTIR", subtitle: "Nuestros mejores deseos para esta noche especial.",
    titleColor: "#fef3c7", subtitleColor: "#ffffff",
    background: { type: "linear", colors: ["#020617", "#14532d", "#b45309"], stops: [0, .65, 1] },
  },
  {
    id: "christmas-sale", holiday: "Navidad", variant: "Promoción", icon: "🎅",
    title: "REGALOS DE NAVIDAD", subtitle: "Encontrá tu regalo ideal. Consultanos hoy.",
    titleColor: "#ffffff", subtitleColor: "#fee2e2",
    background: { type: "linear", colors: ["#991b1b", "#ef4444", "#f59e0b"], stops: [0, .6, 1] },
  },
  {
    id: "newyear-gold", holiday: "Año Nuevo", variant: "Elegante", icon: "🥂",
    title: "¡FELIZ AÑO NUEVO!", subtitle: "Brindamos por nuevos sueños y oportunidades.",
    titleColor: "#fef3c7", subtitleColor: "#ffffff",
    background: { type: "linear", colors: ["#020617", "#312e81", "#d4af37"], stops: [0, .62, 1] },
  },
  {
    id: "newyear-color", holiday: "Año Nuevo", variant: "Festiva", icon: "🎆",
    title: "UN NUEVO AÑO COMIENZA", subtitle: "Gracias por acompañarnos. Vamos por más.",
    titleColor: "#ffffff", subtitleColor: "#e0e7ff",
    background: { type: "linear", colors: ["#4c1d95", "#2563eb", "#ec4899"], stops: [0, .55, 1] },
  },
  {
    id: "newyear-thanks", holiday: "Año Nuevo", variant: "Agradecimiento", icon: "⭐",
    title: "GRACIAS POR ELEGIRNOS", subtitle: "Deseamos compartir otro gran año junto a vos.",
    titleColor: "#ffffff", subtitleColor: "#dcfce7",
    background: { type: "linear", colors: ["#064e3b", "#059669", "#0ea5e9"], stops: [0, .55, 1] },
  },
  {
    id: "friend-red", holiday: "Día del Amigo", variant: "Clásica", icon: "🤝",
    title: "¡FELIZ DÍA DEL AMIGO!", subtitle: "Celebremos a quienes hacen mejor cada día.",
    titleColor: "#ffffff", subtitleColor: "#fee2e2",
    background: { type: "linear", colors: ["#7f1d1d", "#e11d48", "#f97316"], stops: [0, .55, 1] },
  },
  {
    id: "friend-blue", holiday: "Día del Amigo", variant: "Moderna", icon: "💙",
    title: "JUNTOS ES MEJOR", subtitle: "Compartí este día con tus personas favoritas.",
    titleColor: "#ffffff", subtitleColor: "#dbeafe",
    background: { type: "linear", colors: ["#172554", "#2563eb", "#06b6d4"], stops: [0, .55, 1] },
  },
  {
    id: "friend-sale", holiday: "Día del Amigo", variant: "Promoción", icon: "🎁",
    title: "PROMO PARA COMPARTIR", subtitle: "Una propuesta especial para disfrutar con amigos.",
    titleColor: "#ffffff", subtitleColor: "#fef9c3",
    background: { type: "linear", colors: ["#581c87", "#c026d3", "#facc15"], stops: [0, .62, 1] },
  },
];

const MODERN_OCCASIONS = [
  { id: "birthday", holiday: "Cumpleaños", category: "Celebraciones", title: "HOY FESTEJAMOS", subtitle: "Un nuevo año, nuevos motivos para celebrar.", palettes: [["#111827", "#7c3aed", "#f472b6"], ["#fff7ed", "#fb7185", "#7c3aed"], ["#082f49", "#06b6d4", "#facc15"]] },
  { id: "valentine", holiday: "San Valentín", category: "Celebraciones", title: "CELEBRÁ EL AMOR", subtitle: "Una propuesta especial para compartir.", palettes: [["#4c0519", "#e11d48", "#fb7185"], ["#fff1f2", "#be123c", "#881337"], ["#2e1065", "#a855f7", "#f0abfc"]] },
  { id: "carnival", holiday: "Carnaval", category: "Temporada", title: "VIVÍ EL CARNAVAL", subtitle: "Color, alegría y una propuesta imperdible.", palettes: [["#312e81", "#ec4899", "#facc15"], ["#0f766e", "#22c55e", "#fde047"], ["#7c2d12", "#f97316", "#a855f7"]] },
  { id: "women", holiday: "Día de la Mujer", category: "Institucionales", title: "MUJERES QUE INSPIRAN", subtitle: "Reconocemos su fuerza, talento y compromiso.", palettes: [["#3b0764", "#9333ea", "#f0abfc"], ["#4a044e", "#db2777", "#fbcfe8"], ["#172554", "#6366f1", "#c4b5fd"]] },
  { id: "school", holiday: "Vuelta al cole", category: "Temporada", title: "VUELTA AL COLE", subtitle: "Todo listo para empezar una nueva etapa.", palettes: [["#0c4a6e", "#0ea5e9", "#fde047"], ["#14532d", "#22c55e", "#fef08a"], ["#312e81", "#6366f1", "#fb7185"]] },
  { id: "easter", holiday: "Pascuas", category: "Celebraciones", title: "FELICES PASCUAS", subtitle: "Deseamos que disfrutes un día muy especial.", palettes: [["#4c1d95", "#a78bfa", "#fef3c7"], ["#155e75", "#67e8f9", "#fdf2f8"], ["#831843", "#f9a8d4", "#fef9c3"]] },
  { id: "worker", holiday: "Día del Trabajador", category: "Institucionales", title: "EL TRABAJO NOS IMPULSA", subtitle: "Celebramos el esfuerzo que transforma cada día.", palettes: [["#111827", "#2563eb", "#38bdf8"], ["#052e16", "#16a34a", "#86efac"], ["#422006", "#d97706", "#fde68a"]] },
  { id: "may25", holiday: "25 de Mayo", category: "Argentina", title: "¡VIVA LA PATRIA!", subtitle: "Celebramos juntos un nuevo aniversario de la Revolución de Mayo.", palettes: [["#075985", "#38bdf8", "#ffffff"], ["#172554", "#2563eb", "#e0f2fe"], ["#164e63", "#06b6d4", "#f8fafc"]] },
  { id: "father", holiday: "Día del Padre", category: "Celebraciones", title: "FELIZ DÍA, PAPÁ", subtitle: "Celebramos a quienes siempre están.", palettes: [["#0f172a", "#2563eb", "#38bdf8"], ["#431407", "#ea580c", "#fbbf24"], ["#111827", "#374151", "#d4af37"]] },
  { id: "flag", holiday: "Día de la Bandera", category: "Argentina", title: "CELEBREMOS NUESTRA BANDERA", subtitle: "Un símbolo que nos une como argentinos.", palettes: [["#075985", "#7dd3fc", "#ffffff"], ["#172554", "#3b82f6", "#e0f2fe"], ["#0c4a6e", "#06b6d4", "#f8fafc"]] },
  { id: "friend", holiday: "Día del Amigo", category: "Celebraciones", title: "JUNTOS ES MEJOR", subtitle: "Celebrá con las personas que hacen especial cada día.", palettes: [["#4c1d95", "#8b5cf6", "#fb7185"], ["#172554", "#2563eb", "#22d3ee"], ["#881337", "#f43f5e", "#fbbf24"]] },
  { id: "july9", holiday: "9 de Julio", category: "Argentina", title: "DÍA DE LA INDEPENDENCIA", subtitle: "Celebremos la libertad y el orgullo de ser argentinos.", palettes: [["#075985", "#0ea5e9", "#ffffff"], ["#1e3a8a", "#60a5fa", "#e0f2fe"], ["#164e63", "#22d3ee", "#f8fafc"]] },
  { id: "children", holiday: "Día de las Infancias", category: "Celebraciones", title: "HOY FESTEJAMOS", subtitle: "Que nunca falten juegos, sueños y sonrisas.", palettes: [["#1d4ed8", "#7c3aed", "#ec4899"], ["#0369a1", "#22d3ee", "#fde047"], ["#166534", "#4ade80", "#f9a8d4"]] },
  { id: "spring", holiday: "Primavera", category: "Temporada", title: "LLEGÓ LA PRIMAVERA", subtitle: "Una nueva temporada para florecer.", palettes: [["#14532d", "#22c55e", "#facc15"], ["#831843", "#f472b6", "#bef264"], ["#164e63", "#2dd4bf", "#fde047"]] },
  { id: "mother", holiday: "Día de la Madre", category: "Celebraciones", title: "FELIZ DÍA, MAMÁ", subtitle: "Todo nuestro amor para vos.", palettes: [["#831843", "#db2777", "#fb7185"], ["#4a044e", "#c026d3", "#f9a8d4"], ["#881337", "#f43f5e", "#fbbf24"]] },
  { id: "halloween", holiday: "Halloween", category: "Temporada", title: "NOCHE DE HALLOWEEN", subtitle: "Una propuesta aterradoramente buena.", palettes: [["#111827", "#7c3aed", "#f97316"], ["#3b0764", "#a855f7", "#84cc16"], ["#1c1917", "#ea580c", "#facc15"]] },
  { id: "blackfriday", holiday: "Black Friday", category: "Comerciales", title: "BLACK FRIDAY", subtitle: "Una oportunidad única por tiempo limitado.", palettes: [["#000000", "#27272a", "#facc15"], ["#020617", "#7c3aed", "#22d3ee"], ["#18181b", "#dc2626", "#ffffff"]] },
  { id: "christmas", holiday: "Navidad", category: "Celebraciones", title: "FELIZ NAVIDAD", subtitle: "Que la magia de estas fiestas llegue a cada hogar.", palettes: [["#450a0a", "#dc2626", "#166534"], ["#020617", "#14532d", "#d4af37"], ["#7f1d1d", "#ef4444", "#fbbf24"]] },
  { id: "newyear", holiday: "Año Nuevo", category: "Celebraciones", title: "FELIZ AÑO NUEVO", subtitle: "Brindamos por nuevos sueños y oportunidades.", palettes: [["#020617", "#312e81", "#d4af37"], ["#4c1d95", "#2563eb", "#ec4899"], ["#064e3b", "#059669", "#0ea5e9"]] },
];

const MODERN_VARIANTS = [
  { id: "editorial", name: "Editorial", layout: 1 },
  { id: "minimal", name: "Minimal", layout: 2 },
  { id: "impact", name: "Impacto", layout: 3 },
];

export const MODERN_OCCASION_TEMPLATES = MODERN_OCCASIONS.flatMap((occasion) =>
  MODERN_VARIANTS.map((variant, index) => ({
    id: `${occasion.id}-${variant.id}`,
    holiday: occasion.holiday,
    category: occasion.category,
    variant: variant.name,
    layout: variant.layout,
    title: occasion.title,
    subtitle: occasion.subtitle,
    titleColor: index === 1 && ["#fff7ed", "#fff1f2"].includes(occasion.palettes[index][0])
      ? "#0f172a"
      : "#ffffff",
    subtitleColor: index === 1 && ["#fff7ed", "#fff1f2"].includes(occasion.palettes[index][0])
      ? "#475569"
      : "#f8fafc",
    background: {
      type: "linear",
      colors: occasion.palettes[index],
      stops: [0, 0.58, 1],
    },
  }))
);

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
