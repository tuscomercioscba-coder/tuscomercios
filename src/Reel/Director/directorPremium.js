import {
  SCENE_TYPES,
  buildDirectorContext,
  createDirectedScene,
  createEndScene,
  cycleMedia,
  distributeDurations,
} from "./directorBase";

export function buildPremiumDirectorPlan(input = {}) {
  const context = buildDirectorContext({ ...input, style: "premium" });

  const scenes = [
    createDirectedScene({
      type: SCENE_TYPES.HOOK,
      media: cycleMedia(context.media, 0),
      title: context.title || getPremiumHook(context),
      subtitle: context.subtitle || getPremiumSubtitle(context),
      duration: 3,
      camera: "kenBurns",
      transition: "blur",
      model: "minimal",
      textPosition: "bottom",
      textAlign: "center",
      overlayOpacity: 0.38,
      titleSize: 98,
      subtitleSize: 34,
      cameraIntensity: 0.75,
      cameraEasing: "cinematic",
      seed: 11,
    }),
    createDirectedScene({
      type: SCENE_TYPES.DETAIL,
      media: cycleMedia(context.media, 1),
      title: context.mode === "admin" ? "BUSCÁ. DESCUBRÍ. CONECTÁ." : "CADA DETALLE IMPORTA",
      subtitle: "Una experiencia cuidada de principio a fin.",
      duration: 3.5,
      camera: "floating",
      transition: "fade",
      model: "minimal",
      textPosition: "bottom",
      textAlign: "center",
      overlayOpacity: 0.34,
      titleSize: 86,
      subtitleSize: 32,
      cameraIntensity: 0.65,
      cameraEasing: "smooth",
      seed: 12,
    }),
    createDirectedScene({
      type: SCENE_TYPES.PRODUCT,
      media: cycleMedia(context.media, 2),
      title: "CALIDAD QUE SE VE",
      subtitle: context.mode === "admin"
        ? "Una plataforma simple para personas y comercios."
        : "Productos y servicios presentados con una mirada profesional.",
      duration: 3.5,
      camera: "pushOut",
      transition: "fade",
      model: "minimal",
      textPosition: "bottom",
      textAlign: "center",
      overlayOpacity: 0.36,
      cameraIntensity: 0.7,
      cameraEasing: "cinematic",
      seed: 13,
    }),
    createDirectedScene({
      type: SCENE_TYPES.CTA,
      media: cycleMedia(context.media, 3),
      title: context.mode === "admin" ? "DESCUBRÍ TUSCOMERCIOS" : "CONOCÉ MÁS",
      subtitle: context.mode === "admin"
        ? "La plataforma que conecta personas con comercios."
        : context.whatsapp
        ? `Escribinos al ${context.whatsapp}`
        : "Estamos para ayudarte.",
      duration: 3,
      camera: "pushIn",
      transition: "blur",
      model: "minimal",
      textPosition: "center",
      textAlign: "center",
      overlayOpacity: 0.55,
      cameraIntensity: 0.65,
      cameraEasing: "cinematic",
      seed: 14,
    }),
    createEndScene({ context, model: "minimal", seed: 15 }),
  ];

  return {
    id: "premium-director",
    name: "Director Premium",
    mode: context.mode,
    category: context.category,
    model: "minimal",
    targetDuration: context.targetDuration,
    scenes: distributeDurations(scenes, context.targetDuration),
  };
}

function getPremiumHook(context) {
  if (context.mode === "admin") return "TODO TU MUNDO COMERCIAL, EN UN SOLO LUGAR";

  switch (context.category) {
    case "gastronomy": return "UNA EXPERIENCIA PARA DISFRUTAR";
    case "fashion": return "ESTILO QUE HABLA POR VOS";
    case "realestate": return "ESPACIOS QUE INSPIRAN";
    case "tourism": return "MOMENTOS PARA RECORDAR";
    case "beauty": return "BIENESTAR CON IDENTIDAD";
    default: return "UNA PROPUESTA QUE SE DESTACA";
  }
}

function getPremiumSubtitle(context) {
  if (context.mode === "admin") {
    return "Encontrá comercios, servicios y profesionales de tu ciudad.";
  }

  return `${context.businessName}${context.city ? ` · ${context.city}` : ""}`;
}
