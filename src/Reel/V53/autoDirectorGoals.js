export const AUTO_DIRECTOR_GOALS = [
  {
    id: "promotion",
    label: "Vender una promoción",
    description: "Oferta clara, ritmo rápido y llamado a la acción.",
    suggestedStyle: "offer",
    duration: 15,
  },
  {
    id: "products",
    label: "Mostrar productos",
    description: "Prioriza fotos, videos y detalles del catálogo.",
    suggestedStyle: "commercial",
    duration: 15,
  },
  {
    id: "presentation",
    label: "Presentar mi negocio",
    description: "Explica quién sos, qué ofrecés y dónde encontrarte.",
    suggestedStyle: "premium",
    duration: 20,
  },
  {
    id: "service",
    label: "Promocionar un servicio",
    description: "Muestra beneficios y genera consultas.",
    suggestedStyle: "commercial",
    duration: 15,
  },
  {
    id: "event",
    label: "Promocionar un evento",
    description: "Fecha, lugar, expectativa y llamado a participar.",
    suggestedStyle: "cinematic",
    duration: 20,
  },
  {
    id: "news",
    label: "Contar una novedad",
    description: "Presentación rápida y visual de algo nuevo.",
    suggestedStyle: "elegant",
    duration: 15,
  },
];

export const SURPRISE_VARIANTS = [
  {
    id: "commercial",
    label: "Comercial",
    description: "Directo, vendedor y con mucho ritmo.",
    style: "commercial",
    model: "dynamic",
  },
  {
    id: "premium",
    label: "Premium",
    description: "Elegante, limpio y con movimientos suaves.",
    style: "premium",
    model: "cinematic",
  },
  {
    id: "viral",
    label: "Dinámico",
    description: "Más cambios, textos grandes y energía.",
    style: "offer",
    model: "impact",
  },
];

export function buildGoalIdea({
  goal,
  customIdea = "",
  business = {},
}) {
  const name =
    business.negocio ||
    business.nombre ||
    "el negocio";

  const city = business.ciudad
    ? ` en ${business.ciudad}`
    : "";

  const custom = String(customIdea || "").trim();

  if (custom) {
    return custom;
  }

  switch (goal) {
    case "products":
      return `Mostrar los productos principales de ${name}${city}`;
    case "presentation":
      return `Presentar ${name}, sus servicios y por qué elegirlo${city}`;
    case "service":
      return `Promocionar el servicio principal de ${name}${city}`;
    case "event":
      return `Promocionar un evento de ${name}${city}`;
    case "news":
      return `Contar una novedad importante de ${name}${city}`;
    case "promotion":
    default:
      return `Promocionar una oferta de ${name}${city}`;
  }
}
