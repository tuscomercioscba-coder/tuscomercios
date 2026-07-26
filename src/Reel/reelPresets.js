export const REEL_FORMAT = {
  width: 1080,
  height: 1920,
  fps: 30,
};

export const REEL_MODELS = [
  {
    id: "cinematic",
    name: "Cinemático",
    description:
      "Movimientos suaves, textos elegantes y transiciones tipo filmmaker.",
  },
  {
    id: "commercial",
    name: "Comercial dinámico",
    description:
      "Cortes rápidos, textos fuertes y ritmo pensado para promociones.",
  },
  {
    id: "minimal",
    name: "Minimal premium",
    description:
      "Composición limpia, refinada y con protagonismo del producto.",
  },
];

export const REEL_DURATIONS = [
  {
    value: 10,
    label: "10 segundos",
  },
  {
    value: 15,
    label: "15 segundos",
  },
  {
    value: 20,
    label: "20 segundos",
  },
  {
    value: 30,
    label: "30 segundos",
  },
];

export const REEL_FONTS = [
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
    id: "bebas",
    name: "Bebas / Impacto",
    family: "'Bebas Neue', Impact, 'Arial Black', sans-serif",
  },
  {
    id: "playfair",
    name: "Playfair",
    family: "'Playfair Display', Georgia, serif",
  },
  {
    id: "georgia",
    name: "Georgia",
    family: "Georgia, serif",
  },
];

export const REEL_TEXT_POSITIONS = [
  {
    id: "top",
    name: "Arriba",
  },
  {
    id: "center",
    name: "Centro",
  },
  {
    id: "bottom",
    name: "Abajo",
  },
];

export const REEL_TEXT_ALIGNS = [
  {
    id: "left",
    name: "Izquierda",
  },
  {
    id: "center",
    name: "Centro",
  },
  {
    id: "right",
    name: "Derecha",
  },
];

export const REEL_CAMERA_MOVEMENTS = [
  {
    id: "zoomIn",
    name: "Zoom de entrada",
  },
  {
    id: "zoomOut",
    name: "Zoom de salida",
  },
  {
    id: "panLeft",
    name: "Paneo a la izquierda",
  },
  {
    id: "panRight",
    name: "Paneo a la derecha",
  },
  {
    id: "panUp",
    name: "Paneo hacia arriba",
  },
  {
    id: "panDown",
    name: "Paneo hacia abajo",
  },
  {
    id: "diagonal",
    name: "Movimiento diagonal",
  },
  {
    id: "static",
    name: "Sin movimiento",
  },
];

export const REEL_TRANSITIONS = [
  {
    id: "fade",
    name: "Fundido",
  },
  {
    id: "blur",
    name: "Desenfoque",
  },
  {
    id: "slideLeft",
    name: "Barrido izquierdo",
  },
  {
    id: "slideRight",
    name: "Barrido derecho",
  },
  {
    id: "zoom",
    name: "Zoom",
  },
  {
    id: "flash",
    name: "Flash suave",
  },
  {
    id: "cut",
    name: "Corte limpio",
  },
];

export const REEL_STYLE_PRESETS = {
  cinematic: {
    id: "cinematic",
    name: "Cinemático",
    overlay:
      "linear-gradient(180deg, rgba(2,6,23,.12), rgba(2,6,23,.28), rgba(2,6,23,.82))",
    canvasBackground: "#020617",

    titleFont: "playfair",
    subtitleFont: "montserrat",

    titleColor: "#ffffff",
    subtitleColor: "#e2e8f0",
    accentColor: "#d4af37",
    buttonColor: "#ffffff",
    buttonTextColor: "#111827",

    titleSize: 104,
    subtitleSize: 38,

    titleWeight: 800,
    subtitleWeight: 600,

    titleTransform: "none",
    titleSpacing: "-0.035em",

    defaultCamera: "zoomIn",
    defaultTransition: "blur",

    textPosition: "bottom",
    textAlign: "left",

    overlayOpacity: 0.5,
    imageSaturation: 0.92,
    imageContrast: 1.08,
    imageBrightness: 0.9,

    transitionDuration: 0.55,
  },

  commercial: {
    id: "commercial",
    name: "Comercial dinámico",
    overlay:
      "linear-gradient(180deg, rgba(15,23,42,.08), rgba(15,23,42,.22), rgba(15,23,42,.74))",
    canvasBackground: "#0f172a",

    titleFont: "bebas",
    subtitleFont: "poppins",

    titleColor: "#ffffff",
    subtitleColor: "#ffffff",
    accentColor: "#facc15",
    buttonColor: "#22c55e",
    buttonTextColor: "#ffffff",

    titleSize: 120,
    subtitleSize: 40,

    titleWeight: 900,
    subtitleWeight: 800,

    titleTransform: "uppercase",
    titleSpacing: "-0.025em",

    defaultCamera: "zoomOut",
    defaultTransition: "flash",

    textPosition: "center",
    textAlign: "left",

    overlayOpacity: 0.44,
    imageSaturation: 1.15,
    imageContrast: 1.12,
    imageBrightness: 0.94,

    transitionDuration: 0.32,
  },

  minimal: {
    id: "minimal",
    name: "Minimal premium",
    overlay:
      "linear-gradient(180deg, rgba(15,23,42,.04), rgba(15,23,42,.12), rgba(15,23,42,.56))",
    canvasBackground: "#f8fafc",

    titleFont: "montserrat",
    subtitleFont: "inter",

    titleColor: "#ffffff",
    subtitleColor: "#f1f5f9",
    accentColor: "#ffffff",
    buttonColor: "#ffffff",
    buttonTextColor: "#111827",

    titleSize: 92,
    subtitleSize: 34,

    titleWeight: 800,
    subtitleWeight: 600,

    titleTransform: "none",
    titleSpacing: "-0.035em",

    defaultCamera: "panRight",
    defaultTransition: "fade",

    textPosition: "bottom",
    textAlign: "center",

    overlayOpacity: 0.34,
    imageSaturation: 0.96,
    imageContrast: 1.04,
    imageBrightness: 1,

    transitionDuration: 0.5,
  },
};

export const REEL_PRESETS = [
  {
    id: "cinematic-product",
    name: "Producto cinematográfico",
    description:
      "Presentación elegante con acercamientos suaves y cierre premium.",
    model: "cinematic",
    duration: 15,
    defaultSceneDuration: 3,
    transition: "blur",
    camera: "zoomIn",
    title: "DESCUBRÍ ALGO ESPECIAL",
    subtitle: "Calidad, detalle y una propuesta pensada para vos.",
  },
  {
    id: "commercial-offer",
    name: "Oferta dinámica",
    description:
      "Ideal para descuentos, promociones y productos destacados.",
    model: "commercial",
    duration: 15,
    defaultSceneDuration: 2.5,
    transition: "flash",
    camera: "zoomOut",
    title: "OFERTA IMPERDIBLE",
    subtitle: "Aprovechá esta oportunidad por tiempo limitado.",
  },
  {
    id: "minimal-brand",
    name: "Marca premium",
    description:
      "Reel limpio y moderno para marcas que quieren verse profesionales.",
    model: "minimal",
    duration: 15,
    defaultSceneDuration: 3,
    transition: "fade",
    camera: "panRight",
    title: "UNA MARCA QUE SE DESTACA",
    subtitle: "Diseño, calidad y atención personalizada.",
  },
];

export function getReelStyle(model = "cinematic") {
  return REEL_STYLE_PRESETS[model] || REEL_STYLE_PRESETS.cinematic;
}

export function getFontFamily(fontId = "inter") {
  const font = REEL_FONTS.find((item) => item.id === fontId);
  return font?.family || REEL_FONTS[0].family;
}

export function createDefaultScene(index = 0, options = {}) {
  const model = options.model || "cinematic";
  const style = getReelStyle(model);

  return {
    id: createSceneId(),

    media: "",
    mediaType: "image",
    fileName: "",

    title: index === 0 ? "TU NEGOCIO MERECE DESTACARSE" : "",
    subtitle:
      index === 0
        ? "Mostrá tus productos y servicios con contenido profesional."
        : "",

    duration: Number(options.duration || 3),

    camera: options.camera || style.defaultCamera,
    transition: options.transition || style.defaultTransition,

    textPosition: style.textPosition,
    textAlign: style.textAlign,

    titleFont: style.titleFont,
    subtitleFont: style.subtitleFont,

    titleColor: style.titleColor,
    subtitleColor: style.subtitleColor,

    titleSize: style.titleSize,
    subtitleSize: style.subtitleSize,

    overlayOpacity: style.overlayOpacity,

    enabled: true,
  };
}

export function createEndScene(business = {}, model = "cinematic") {
  const style = getReelStyle(model);

  return {
    id: createSceneId(),

    media: business?.logo || business?.image || "",
    mediaType: "image",
    fileName: "",

    title: business?.negocio || "Tu comercio",
    subtitle:
      business?.whatsapp || business?.telefono
        ? `WhatsApp: ${business.whatsapp || business.telefono}`
        : "Encontranos en TusComercios",

    duration: 3,

    camera: "zoomIn",
    transition: "fade",

    textPosition: "center",
    textAlign: "center",

    titleFont: style.titleFont,
    subtitleFont: style.subtitleFont,

    titleColor: style.titleColor,
    subtitleColor: style.subtitleColor,

    titleSize: 94,
    subtitleSize: 36,

    overlayOpacity: 0.64,

    isEndScene: true,
    enabled: true,
  };
}

export function createInitialScenes(business = {}, model = "cinematic") {
  const images = getBusinessImages(business);
  const style = getReelStyle(model);

  const scenes = images.slice(0, 4).map((image, index) => {
    const scene = createDefaultScene(index, {
      model,
      duration: index === 0 ? 3.5 : 3,
      camera: getAlternatingCamera(index, style.defaultCamera),
      transition: getAlternatingTransition(index, style.defaultTransition),
    });

    return {
      ...scene,
      media: image,
      title:
        index === 0
          ? business?.negocio || "CONOCÉ NUESTRO NEGOCIO"
          : index === 1
          ? "PRODUCTOS Y SERVICIOS"
          : index === 2
          ? "ATENCIÓN PERSONALIZADA"
          : "TODO EN UN SOLO LUGAR",
      subtitle:
        index === 0
          ? business?.descripcion ||
            "Una propuesta pensada para nuestros clientes."
          : "",
    };
  });

  if (!scenes.length) {
    scenes.push(
      createDefaultScene(0, {
        model,
        duration: 3.5,
      })
    );
  }

  scenes.push(createEndScene(business, model));

  return scenes;
}

export function getBusinessImages(business = {}) {
  const images = [];

  if (business?.image && typeof business.image === "string") {
    images.push(business.image);
  }

  if (Array.isArray(business?.images)) {
    business.images.forEach((image) => {
      if (image && typeof image === "string") {
        images.push(image);
      }
    });
  }

  if (business?.logo && typeof business.logo === "string") {
    images.push(business.logo);
  }

  return [...new Set(images)].filter(Boolean);
}

export function createSceneId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `scene-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getAlternatingCamera(index, fallback) {
  const cameras = [
    fallback,
    "panRight",
    "zoomOut",
    "panLeft",
    "panUp",
    "diagonal",
  ];

  return cameras[index % cameras.length];
}

function getAlternatingTransition(index, fallback) {
  const transitions = [
    fallback,
    "fade",
    "slideLeft",
    "blur",
    "zoom",
    "slideRight",
  ];

  return transitions[index % transitions.length];
}