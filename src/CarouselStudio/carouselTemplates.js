const RUBRO_PROFILES = [
  {
    match: ["panader", "pasteler", "repost", "confiter"],
    id: "panaderia",
    label: "Panadería y pastelería",
    product: "productos recién elaborados",
    benefit: "disfrutar algo rico, fresco y hecho con dedicación",
    examples: ["Facturas y panificados", "Tortas para celebrar", "Promociones para compartir"],
    tip: "Reservá con anticipación para asegurar tus productos favoritos.",
    emoji: "🥐",
  },
  {
    match: ["lubric", "mecanic", "automotor", "repuesto"],
    id: "lubricentro",
    label: "Lubricentro y automotor",
    product: "servicios para cuidar tu vehículo",
    benefit: "manejar con mayor seguridad y prevenir reparaciones costosas",
    examples: ["Cambio de aceite", "Filtros y fluidos", "Control preventivo"],
    tip: "Revisá aceite, filtros y fluidos según el kilometraje de tu vehículo.",
    emoji: "🚗",
  },
  {
    match: ["psic", "abog", "contador", "arquitect", "profesional", "consult"],
    id: "profesional",
    label: "Servicios profesionales",
    product: "asesoramiento profesional personalizado",
    benefit: "tomar mejores decisiones con acompañamiento especializado",
    examples: ["Primera consulta", "Plan personalizado", "Seguimiento profesional"],
    tip: "Una consulta a tiempo puede ayudarte a resolver el problema con mayor claridad.",
    emoji: "💼",
  },
  {
    match: ["restaurant", "comida", "gastronom", "rotiser", "bar", "cafe"],
    id: "gastronomia",
    label: "Gastronomía",
    product: "sabores preparados para vos",
    benefit: "resolver tus comidas y disfrutar una experiencia especial",
    examples: ["Platos destacados", "Opciones para compartir", "Pedidos y reservas"],
    tip: "Consultá el menú del día y reservá tu opción favorita.",
    emoji: "🍽️",
  },
  {
    match: ["estetic", "peluquer", "belleza", "spa", "barber"],
    id: "belleza",
    label: "Belleza y bienestar",
    product: "servicios pensados para cuidarte",
    benefit: "verte y sentirte mejor con atención personalizada",
    examples: ["Tratamientos destacados", "Resultados reales", "Turnos disponibles"],
    tip: "Elegí el tratamiento adecuado con una evaluación personalizada.",
    emoji: "✨",
  },
  {
    match: ["electric", "plomer", "constru", "repar", "tecnic", "instal"],
    id: "servicios",
    label: "Servicios y oficios",
    product: "soluciones confiables para tu hogar o negocio",
    benefit: "resolver problemas rápidamente y con trabajo profesional",
    examples: ["Diagnóstico", "Solución profesional", "Seguimiento del trabajo"],
    tip: "Pedí un diagnóstico claro antes de comenzar cualquier reparación.",
    emoji: "🛠️",
  },
];

const GENERAL_PROFILE = {
  id: "comercio",
  label: "Comercio y emprendimiento",
  product: "productos y servicios pensados para vos",
  benefit: "encontrar una solución práctica, cercana y confiable",
  examples: ["Productos destacados", "Beneficios para clientes", "Atención personalizada"],
  tip: "Consultanos para encontrar la opción más adecuada para vos.",
  emoji: "🏪",
};

export function resolveRubroProfile(rubro = "") {
  const normalized = String(rubro).toLowerCase();
  return RUBRO_PROFILES.find((profile) =>
    profile.match.some((term) => normalized.includes(term))
  ) || GENERAL_PROFILE;
}

export const CAROUSEL_OBJECTIVES = [
  { id: "sell", label: "Vender productos", emoji: "🛍️" },
  { id: "educate", label: "Dar consejos", emoji: "💡" },
  { id: "services", label: "Mostrar servicios", emoji: "⭐" },
  { id: "story", label: "Presentar el negocio", emoji: "👋" },
  { id: "promotion", label: "Lanzar una promoción", emoji: "🔥" },
  { id: "trust", label: "Generar confianza", emoji: "🤝" },
];

const VISUAL_STYLES = [
  {
    id: "bold",
    name: "Impacto moderno",
    colors: ["#0f172a", "#2563eb", "#22c55e", "#ffffff"],
    font: "Poppins",
    filter: "contrast(1.12) saturate(1.18)",
    imageStyle: "framed",
    decoration: "orbs",
  },
  {
    id: "editorial",
    name: "Editorial elegante",
    colors: ["#18181b", "#7c3aed", "#f5d0fe", "#ffffff"],
    font: "Georgia",
    filter: "sepia(.16) contrast(1.08) saturate(.82)",
    imageStyle: "editorial",
    decoration: "lines",
  },
  {
    id: "warm",
    name: "Cálido comercial",
    colors: ["#7c2d12", "#f97316", "#facc15", "#fff7ed"],
    font: "Trebuchet MS",
    filter: "sepia(.18) saturate(1.15) contrast(1.05)",
    imageStyle: "rounded",
    decoration: "sun",
  },
  {
    id: "fresh",
    name: "Fresco y cercano",
    colors: ["#064e3b", "#10b981", "#5eead4", "#ecfdf5"],
    font: "Arial",
    filter: "saturate(1.15) brightness(1.04)",
    imageStyle: "organic",
    decoration: "wave",
  },
  {
    id: "minimal",
    name: "Minimal premium",
    colors: ["#111827", "#374151", "#d1d5db", "#ffffff"],
    font: "Helvetica",
    filter: "grayscale(.82) contrast(1.16)",
    imageStyle: "minimal",
    decoration: "grid",
  },
  {
    id: "social",
    name: "Social vibrante",
    colors: ["#4c1d95", "#db2777", "#fb7185", "#ffffff"],
    font: "Verdana",
    filter: "saturate(1.35) contrast(1.08)",
    imageStyle: "full",
    decoration: "spark",
  },
  {
    id: "cinema",
    name: "Cinematográfico",
    colors: ["#020617", "#1e293b", "#d4af37", "#f8fafc"],
    font: "Georgia",
    filter: "contrast(1.22) saturate(.72) brightness(.82)",
    imageStyle: "cinema",
    decoration: "frame",
  },
  {
    id: "pastel",
    name: "Pastel contemporáneo",
    colors: ["#fdf2f8", "#f9a8d4", "#a78bfa", "#3b0764"],
    font: "Poppins",
    filter: "saturate(.82) brightness(1.08)",
    imageStyle: "soft",
    decoration: "bubbles",
  },
  {
    id: "tech",
    name: "Tecnología neón",
    colors: ["#020617", "#0f172a", "#22d3ee", "#ecfeff"],
    font: "Courier New",
    filter: "contrast(1.18) saturate(1.3) hue-rotate(8deg)",
    imageStyle: "tech",
    decoration: "grid",
  },
  {
    id: "magazine",
    name: "Revista premium",
    colors: ["#fafaf9", "#292524", "#dc2626", "#1c1917"],
    font: "Times New Roman",
    filter: "contrast(1.12) saturate(.88)",
    imageStyle: "magazine",
    decoration: "lines",
  },
  {
    id: "nature",
    name: "Natural orgánico",
    colors: ["#052e16", "#166534", "#bef264", "#f7fee7"],
    font: "Trebuchet MS",
    filter: "saturate(1.18) sepia(.08) brightness(.95)",
    imageStyle: "organic",
    decoration: "leaf",
  },
  {
    id: "luxury",
    name: "Lujo nocturno",
    colors: ["#09090b", "#27272a", "#eab308", "#fefce8"],
    font: "Garamond",
    filter: "grayscale(.25) contrast(1.2) brightness(.78)",
    imageStyle: "luxury",
    decoration: "frame",
  },
];

export const CAROUSEL_VISUAL_STYLES = VISUAL_STYLES;

function objectiveCopy(objective, profile, businessName) {
  const name = businessName || "Tu negocio";
  const commonClosing = {
    eyebrow: name,
    title: "¿QUERÉS SABER MÁS?",
    body: "Escribinos y recibí atención personalizada.",
    cta: "GUARDÁ ESTE POST · COMPARTILO",
    emoji: "💬",
  };

  const scripts = {
    sell: [
      { eyebrow: profile.label, title: "UNA PROPUESTA PARA VOS", body: `Descubrí ${profile.product}.`, cta: "DESLIZÁ PARA VER MÁS", emoji: profile.emoji },
      { eyebrow: "OPCIÓN 1", title: profile.examples[0], body: `Ideal para ${profile.benefit}.`, cta: "ELEGÍ TU FAVORITA", emoji: "01" },
      { eyebrow: "OPCIÓN 2", title: profile.examples[1], body: "Calidad, atención cercana y soluciones a tu medida.", cta: "CONSULTÁ DISPONIBILIDAD", emoji: "02" },
      { eyebrow: "OPCIÓN 3", title: profile.examples[2], body: "Una alternativa preparada para ayudarte a elegir mejor.", cta: "PEDÍ MÁS INFORMACIÓN", emoji: "03" },
      { eyebrow: name, title: "ENCONTRÁ TU OPCIÓN IDEAL", body: "Te ayudamos a elegir según lo que necesitás.", cta: "ESCRIBINOS HOY", emoji: "✨" },
      commonClosing,
    ],
    educate: [
      { eyebrow: "GUÍA RÁPIDA", title: `CÓMO APROVECHAR MEJOR ${profile.product.toUpperCase()}`, body: "Consejos simples que podés aplicar desde hoy.", cta: "DESLIZÁ Y GUARDALO", emoji: "💡" },
      { eyebrow: "CONSEJO 1", title: "EMPEZÁ POR TU NECESIDAD", body: "Definí qué querés resolver antes de elegir.", cta: "PASO 1 DE 4", emoji: "1" },
      { eyebrow: "CONSEJO 2", title: "COMPARÁ LAS OPCIONES", body: "No mires solamente el precio: considerá calidad y atención.", cta: "PASO 2 DE 4", emoji: "2" },
      { eyebrow: "CONSEJO 3", title: "CONSULTÁ A UN PROFESIONAL", body: profile.tip, cta: "PASO 3 DE 4", emoji: "3" },
      { eyebrow: "CONSEJO 4", title: "ELEGÍ CON CONFIANZA", body: "Una buena decisión combina información y acompañamiento.", cta: "PASO 4 DE 4", emoji: "4" },
      commonClosing,
    ],
    services: [
      { eyebrow: name, title: "TODO LO QUE PODEMOS HACER POR VOS", body: `Conocé nuestros ${profile.product}.`, cta: "DESLIZÁ", emoji: profile.emoji },
      ...profile.examples.map((example, index) => ({ eyebrow: `SERVICIO 0${index + 1}`, title: example, body: `Una solución pensada para ${profile.benefit}.`, cta: "CONSULTANOS", emoji: String(index + 1) })),
      { eyebrow: "NUESTRO DIFERENCIAL", title: "ATENCIÓN PERSONALIZADA", body: "Escuchamos tu necesidad y buscamos la mejor solución.", cta: "ESTAMOS PARA AYUDARTE", emoji: "🤝" },
      commonClosing,
    ],
    story: [
      { eyebrow: "CONOCENOS", title: `SOMOS ${name.toUpperCase()}`, body: `Trabajamos para ofrecerte ${profile.product}.`, cta: "ESTA ES NUESTRA HISTORIA", emoji: "👋" },
      { eyebrow: "NUESTRO PROPÓSITO", title: "AYUDARTE DE VERDAD", body: `Queremos que puedas ${profile.benefit}.`, cta: "LO QUE NOS MUEVE", emoji: "🎯" },
      { eyebrow: "CÓMO TRABAJAMOS", title: "CERCANÍA Y COMPROMISO", body: "Atención clara, soluciones concretas y seguimiento.", cta: "NUESTRO MÉTODO", emoji: "🧭" },
      { eyebrow: "POR QUÉ ELEGIRNOS", title: "CONFIANZA EN CADA PASO", body: "Cuidamos cada detalle para ofrecer una buena experiencia.", cta: "NUESTRO COMPROMISO", emoji: "⭐" },
      commonClosing,
    ],
    promotion: [
      { eyebrow: "OPORTUNIDAD ESPECIAL", title: "PROMOCIÓN POR TIEMPO LIMITADO", body: `Aprovechá nuestros ${profile.product}.`, cta: "DESLIZÁ PARA CONOCERLA", emoji: "🔥" },
      { eyebrow: "EL BENEFICIO", title: "MÁS VALOR PARA VOS", body: `Una propuesta para ${profile.benefit}.`, cta: "APROVECHÁ HOY", emoji: "🎁" },
      { eyebrow: "CÓMO ACCEDER", title: "ES MUY SIMPLE", body: "Escribinos, mencioná esta publicación y consultá disponibilidad.", cta: "RESERVÁ TU LUGAR", emoji: "📲" },
      { eyebrow: "IMPORTANTE", title: "CUPOS LIMITADOS", body: "La promoción está disponible hasta agotar disponibilidad.", cta: "NO TE QUEDES AFUERA", emoji: "⏰" },
      commonClosing,
    ],
    trust: [
      { eyebrow: name, title: "ELEGIR BIEN TAMBIÉN ES SENTIR CONFIANZA", body: `Te acompañamos con ${profile.product}.`, cta: "CONOCÉ CÓMO TRABAJAMOS", emoji: "🤝" },
      { eyebrow: "CLARIDAD", title: "TE EXPLICAMOS CADA PASO", body: "Información sencilla para que puedas decidir con seguridad.", cta: "SIN SORPRESAS", emoji: "💬" },
      { eyebrow: "COMPROMISO", title: "CUIDAMOS LOS DETALLES", body: "Trabajamos con responsabilidad y atención personalizada.", cta: "SIEMPRE CERCA", emoji: "🛡️" },
      { eyebrow: "EXPERIENCIA", title: "SOLUCIONES PARA PERSONAS REALES", body: `Nuestro objetivo es ayudarte a ${profile.benefit}.`, cta: "CONTÁ CON NOSOTROS", emoji: "⭐" },
      commonClosing,
    ],
  };

  return scripts[objective] || scripts.sell;
}

export function createCarouselTemplate({
  rubro,
  objective = "sell",
  businessName,
  styleId = "bold",
  pageCount = 6,
  format = "square",
}) {
  const profile = resolveRubroProfile(rubro);
  const style = VISUAL_STYLES.find((item) => item.id === styleId) || VISUAL_STYLES[0];
  const base = objectiveCopy(objective, profile, businessName);
  const count = Math.max(4, Math.min(10, pageCount));
  const pages = Array.from({ length: count }, (_, index) => {
    const source = base[Math.min(index, base.length - 1)];
    return {
      id: `page-${Date.now()}-${index}`,
      ...source,
      image: "",
      background: index % 2 ? style.colors[1] : style.colors[0],
      accent: index % 3 === 2 ? style.colors[2] : style.colors[1],
      textColor: style.colors[3],
      font: style.font,
      imageFilter: style.filter,
      imageStyle: style.imageStyle,
      decoration: style.decoration,
      layout: ["hero", "split", "number", "quote"][index % 4],
    };
  });
  return { objective, format, styleId, profile, pages };
}

export const CAROUSEL_FORMATS = {
  square: { label: "Cuadrado", width: 1080, height: 1080, ratio: "1 / 1" },
  portrait: { label: "Feed vertical", width: 1080, height: 1350, ratio: "4 / 5" },
  story: { label: "Historia", width: 1080, height: 1920, ratio: "9 / 16" },
};
