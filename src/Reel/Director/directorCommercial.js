import {
  SCENE_TYPES,
  buildDirectorContext,
  createDirectedScene,
  createEndScene,
  cycleMedia,
  distributeDurations,
} from "./directorBase";

export function buildCommercialDirectorPlan(input = {}) {
  const context = buildDirectorContext({ ...input, style: "commercial" });

  const scenes = [
    createDirectedScene({
      type: SCENE_TYPES.HOOK,
      media: cycleMedia(context.media, 0),
      title: context.title || getCommercialHook(context),
      subtitle: context.subtitle || getCommercialSubtitle(context),
      duration: 2,
      camera: "pushIn",
      transition: "flash",
      model: "commercial",
      textPosition: "center",
      textAlign: "left",
      overlayOpacity: 0.45,
      titleSize: 124,
      subtitleSize: 40,
      cameraIntensity: 1.2,
      cameraEasing: "dynamic",
      seed: 1,
    }),
    createDirectedScene({
      type: SCENE_TYPES.PRODUCT,
      media: cycleMedia(context.media, 1),
      title: getProductTitle(context),
      subtitle: "Calidad, atención y una propuesta pensada para vos.",
      duration: 3,
      camera: "panRight",
      transition: "slideLeft",
      model: "commercial",
      textPosition: "bottom",
      textAlign: "left",
      overlayOpacity: 0.42,
      cameraIntensity: 1,
      cameraEasing: "smooth",
      seed: 2,
    }),
    createDirectedScene({
      type: SCENE_TYPES.DETAIL,
      media: cycleMedia(context.media, 2),
      title: "MIRÁ CADA DETALLE",
      subtitle: context.mode === "admin"
        ? "Buscá por rubro, ciudad y nombre del comercio."
        : "Conocé lo que hace diferente a este negocio.",
      duration: 3,
      camera: "kenBurns",
      transition: "blur",
      model: "commercial",
      textPosition: "bottom",
      textAlign: "left",
      overlayOpacity: 0.4,
      cameraIntensity: 0.9,
      cameraEasing: "cinematic",
      seed: 3,
    }),
    createDirectedScene({
      type: SCENE_TYPES.PROMOTION,
      media: cycleMedia(context.media, 3),
      title:
        context.mode === "admin"
          ? "TU COMERCIO TAMBIÉN PUEDE ESTAR"
          : context.idea
          ? context.idea.toUpperCase()
          : "CONSULTÁ HOY",
      subtitle: context.whatsapp
        ? "Consultanos ahora por WhatsApp."
        : "Escribinos para conocer más.",
      duration: 2.5,
      camera: "diagonalPush",
      transition: "zoom",
      model: "commercial",
      textPosition: "center",
      textAlign: "center",
      overlayOpacity: 0.58,
      titleSize: 118,
      subtitleSize: 38,
      cameraIntensity: 1.15,
      cameraEasing: "dynamic",
      seed: 4,
    }),
    createEndScene({ context, model: "commercial", seed: 5 }),
  ];

  return {
    id: "commercial-director",
    name: "Director Comercial",
    mode: context.mode,
    category: context.category,
    model: "commercial",
    targetDuration: context.targetDuration,
    scenes: distributeDurations(scenes, context.targetDuration),
  };
}

function getCommercialHook(context) {
  if (context.mode === "admin") return "TODO LO QUE BUSCÁS, CERCA TUYO";

  switch (context.category) {
    case "gastronomy": return "UN SABOR QUE TENÉS QUE PROBAR";
    case "hardware": return "TODO PARA HACERLO REALIDAD";
    case "fashion": return "TU PRÓXIMO LOOK ESTÁ ACÁ";
    case "beauty": return "RENOVÁ TU ESTILO";
    case "automotive": return "POTENCIA QUE SE NOTA";
    default: return "DESCUBRÍ ALGO IMPERDIBLE";
  }
}

function getCommercialSubtitle(context) {
  if (context.mode === "admin") {
    return "Comercios, profesionales y servicios en un solo lugar.";
  }

  return `${context.businessName}${context.city ? ` · ${context.city}` : ""}`;
}

function getProductTitle(context) {
  if (context.mode === "admin") return "ENCONTRÁ COMERCIOS Y SERVICIOS";

  switch (context.category) {
    case "gastronomy": return "HECHO PARA DISFRUTAR";
    case "hardware": return "HERRAMIENTAS QUE RINDEN";
    case "fashion": return "NUEVAS TENDENCIAS";
    case "beauty": return "CUIDADO Y BIENESTAR";
    case "automotive": return "CALIDAD EN CADA DETALLE";
    default: return "PRODUCTOS Y SERVICIOS";
  }
}
