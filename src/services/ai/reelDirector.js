export function buildReelPrompt({ business, idea, reelType = "dinámico" }) {
  return `
Actuá como un editor de video profesional especializado en Reels para comercios.

OBJETIVO:
Crear la estructura de un Reel vertical 9:16 para redes sociales.

NEGOCIO:
${business?.negocio || "Negocio"}

RUBRO:
${business?.rubro || "Comercio"}

CIUDAD:
${business?.ciudad || "Argentina"}

IDEA:
${idea || "Crear un Reel para promocionar el negocio."}

TIPO DE REEL:
${reelType}

INSTRUCCIONES:
- Formato vertical 9:16.
- Duración sugerida: 10 a 20 segundos.
- Gancho fuerte en los primeros 2 segundos.
- Usar fotos, textos, logo y datos de la vidriera.
- No depender de video IA generativo.
- Pensado para Instagram, TikTok, Facebook y WhatsApp.
- Debe terminar con logo del comercio y TusComercios.
- Debe parecer editado por un estudio profesional.
- Proponer escenas claras, transiciones y texto en pantalla.
`;
}