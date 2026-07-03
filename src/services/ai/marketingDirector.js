export function analyzeMarketingIdea({ business, idea }) {
  const cleanIdea = String(idea || "").trim();

  if (!cleanIdea) {
    return {
      needsMoreInfo: true,
      message: "Contame qué querés lograr hoy. Puede ser vender más, conseguir consultas, promocionar una oferta o mostrar un producto.",
      recommendedFormat: null,
    };
  }

  const lower = cleanIdea.toLowerCase();

  if (
    lower.includes("vender más") &&
    cleanIdea.split(" ").length <= 4
  ) {
    return {
      needsMoreInfo: true,
      message: "Perfecto. ¿Qué querés vender más? Puede ser un producto, servicio, promoción o todo el negocio.",
      recommendedFormat: null,
    };
  }

  if (
    lower.includes("oferta") ||
    lower.includes("promo") ||
    lower.includes("descuento") ||
    lower.includes("2x1")
  ) {
    return {
      needsMoreInfo: false,
      message: `Yo haría una campaña comercial para ${business?.negocio || "tu negocio"}: una imagen fuerte, una historia rápida y un flyer claro para WhatsApp.`,
      recommendedFormat: "campaign",
    };
  }

  if (
    lower.includes("reel") ||
    lower.includes("video") ||
    lower.includes("mostrar")
  ) {
    return {
      needsMoreInfo: false,
      message: `Creo que un Reel funcionaría muy bien. Podemos hacerlo con el motor de TusComercios usando fotos, textos, logo y datos de tu vidriera.`,
      recommendedFormat: "reel",
    };
  }

  return {
    needsMoreInfo: false,
    message: `Para ${business?.negocio || "tu negocio"}, yo haría una campaña simple: imagen para redes, historia para mover rápido y flyer para WhatsApp.`,
    recommendedFormat: "campaign",
  };
}