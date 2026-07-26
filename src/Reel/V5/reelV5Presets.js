export const V5_REEL_GOALS = [
  {
    id: "promotion",
    label: "Vender una promoción",
    description: "Rápido, claro y con llamado a la acción.",
    duration: 15,
    style: "commercial",
  },
  {
    id: "presentation",
    label: "Presentar el negocio",
    description: "Muestra identidad, servicios y confianza.",
    duration: 20,
    style: "premium",
  },
  {
    id: "product",
    label: "Mostrar productos",
    description: "Prioriza fotos, detalles y precios.",
    duration: 15,
    style: "commercial",
  },
  {
    id: "branding",
    label: "Posicionar la marca",
    description: "Elegante, visual y con menos texto.",
    duration: 20,
    style: "premium",
  },
  {
    id: "platform",
    label: "Promocionar TusComercios",
    description: "Usa capturas y grabaciones reales de la plataforma.",
    duration: 20,
    style: "tuscomercios",
  },
];

export const V5_MEDIA_SOURCES = {
  STUDIO: "studio",
  BUSINESS: "business",
  UPLOAD: "upload",
  SCREEN_CAPTURE: "screen-capture",
  SCREEN_RECORDING: "screen-recording",
};

export const V5_QUALITY_LEVELS = [
  { id: "standard", label: "Buena", width: 720, height: 1280, fps: 30 },
  { id: "high", label: "Alta", width: 1080, height: 1920, fps: 30 },
  { id: "maximum", label: "Máxima", width: 1080, height: 1920, fps: 60 },
];

export const V5_SCENE_LENGTHS = {
  image: 2.8,
  video: 4,
  screen: 3.5,
};
