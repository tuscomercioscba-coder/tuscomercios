const OCCASIONS = [
  ["birthday", "Cumpleaños", "Celebraciones", "HOY FESTEJAMOS", "Un nuevo año, nuevos motivos para celebrar.", ["#111827", "#7c3aed", "#f472b6"]],
  ["valentine", "San Valentín", "Celebraciones", "CELEBRÁ EL AMOR", "Una propuesta especial para compartir.", ["#4c0519", "#e11d48", "#fb7185"]],
  ["carnival", "Carnaval", "Temporada", "VIVÍ EL CARNAVAL", "Color, alegría y una propuesta imperdible.", ["#312e81", "#ec4899", "#facc15"]],
  ["women", "Día de la Mujer", "Institucionales", "MUJERES QUE INSPIRAN", "Reconocemos su fuerza, talento y compromiso.", ["#3b0764", "#9333ea", "#f0abfc"]],
  ["school", "Vuelta al cole", "Temporada", "VUELTA AL COLE", "Todo listo para empezar una nueva etapa.", ["#0c4a6e", "#0ea5e9", "#fde047"]],
  ["easter", "Pascuas", "Celebraciones", "FELICES PASCUAS", "Deseamos que disfrutes un día muy especial.", ["#4c1d95", "#a78bfa", "#fef3c7"]],
  ["worker", "Día del Trabajador", "Institucionales", "EL TRABAJO NOS IMPULSA", "Celebramos el esfuerzo que transforma cada día.", ["#111827", "#2563eb", "#38bdf8"]],
  ["may25", "25 de Mayo", "Argentina", "¡VIVA LA PATRIA!", "Celebremos juntos nuestra historia.", ["#075985", "#38bdf8", "#ffffff"]],
  ["father", "Día del Padre", "Celebraciones", "FELIZ DÍA, PAPÁ", "Celebramos a quienes siempre están.", ["#0f172a", "#2563eb", "#38bdf8"]],
  ["flag", "Día de la Bandera", "Argentina", "NUESTRA BANDERA", "Un símbolo que nos une como argentinos.", ["#075985", "#7dd3fc", "#ffffff"]],
  ["friend", "Día del Amigo", "Celebraciones", "JUNTOS ES MEJOR", "Celebrá con tus personas favoritas.", ["#4c1d95", "#8b5cf6", "#fb7185"]],
  ["july9", "9 de Julio", "Argentina", "DÍA DE LA INDEPENDENCIA", "Orgullo, historia y libertad.", ["#075985", "#0ea5e9", "#ffffff"]],
  ["children", "Día de las Infancias", "Celebraciones", "HOY FESTEJAMOS", "Juegos, sueños y muchas sonrisas.", ["#1d4ed8", "#7c3aed", "#ec4899"]],
  ["spring", "Primavera", "Temporada", "LLEGÓ LA PRIMAVERA", "Una nueva temporada para florecer.", ["#14532d", "#22c55e", "#facc15"]],
  ["mother", "Día de la Madre", "Celebraciones", "FELIZ DÍA, MAMÁ", "Todo nuestro amor para vos.", ["#831843", "#db2777", "#fb7185"]],
  ["halloween", "Halloween", "Temporada", "NOCHE DE HALLOWEEN", "Una propuesta aterradoramente buena.", ["#111827", "#7c3aed", "#f97316"]],
  ["blackfriday", "Black Friday", "Comerciales", "BLACK FRIDAY", "Una oportunidad única por tiempo limitado.", ["#000000", "#27272a", "#facc15"]],
  ["christmas", "Navidad", "Celebraciones", "FELIZ NAVIDAD", "Que la magia llegue a cada hogar.", ["#450a0a", "#dc2626", "#166534"]],
  ["newyear", "Año Nuevo", "Celebraciones", "FELIZ AÑO NUEVO", "Nuevos sueños y oportunidades.", ["#020617", "#312e81", "#d4af37"]],
];

const STYLES = [
  {
    id: "dynamic",
    name: "Dinámico",
    transitions: ["flash", "push-left", "zoom"],
    animations: ["pop", "slide-left", "zoom-fade", "bounce"],
    motions: ["zoom-in", "pan-right", "zoom-out", "pan-left"],
  },
  {
    id: "elegant",
    name: "Elegante",
    transitions: ["fade", "blur", "black-flash"],
    animations: ["fade", "slide-up", "typewriter", "zoom-fade"],
    motions: ["zoom-in", "pan-left", "zoom-in", "none"],
  },
  {
    id: "impact",
    name: "Impacto",
    transitions: ["shake", "spin", "wipe-up"],
    animations: ["bounce", "rotate", "pop", "pulse"],
    motions: ["zoom-out", "pan-right", "zoom-in", "pan-left"],
  },
];

export const REEL_TEMPLATES = OCCASIONS.flatMap(
  ([id, name, category, title, subtitle, palette]) =>
    STYLES.map((style, styleIndex) => ({
      id: `${id}-${style.id}`,
      occasionId: id,
      name,
      category,
      styleName: style.name,
      title,
      subtitle,
      palette:
        styleIndex === 0
          ? palette
          : styleIndex === 1
            ? [palette[0], "#111827", palette[2]]
            : [palette[1], palette[0], palette[2]],
      transitions: style.transitions,
      animations: style.animations,
      motions: style.motions,
      scenes: [
        { eyebrow: name, text: title },
        { eyebrow: "DESCUBRÍ", text: "UNA PROPUESTA PENSADA PARA VOS" },
        { eyebrow: "TUSCOMERCIOS", text: subtitle.toUpperCase() },
        { eyebrow: "HABLEMOS", text: "ESCRIBINOS HOY" },
      ],
    }))
);

export const REEL_TEMPLATE_CATEGORIES = [
  "Todas",
  ...new Set(REEL_TEMPLATES.map((template) => template.category)),
];
