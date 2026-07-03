export function buildFlyerPrompt({ business, idea, offer = "", style = "comercial" }) {
  return `
Actuá como un diseñador gráfico senior especializado en flyers publicitarios para comercios.

OBJETIVO:
Crear un flyer comercial claro, vendedor y profesional.

NEGOCIO:
${business?.negocio || "Negocio"}

RUBRO:
${business?.rubro || "Comercio"}

CIUDAD:
${business?.ciudad || "Argentina"}

IDEA:
${idea || "Crear un flyer para promocionar el negocio."}

OFERTA:
${offer || "Sin oferta específica."}

ESTILO:
${style}

INSTRUCCIONES:
- Debe parecer diseñado por un profesional.
- Debe servir para WhatsApp, Facebook, Instagram e impresión simple.
- Usar jerarquía visual clara.
- Título fuerte y comercial.
- Espacio para precio, oferta o llamado a la acción.
- Espacio para logo del negocio.
- Diseño limpio, moderno y vendedor.
- No sobrecargar de texto.
- Evitar estética artificial o genérica de IA.
- Alta calidad visual.
`;
}