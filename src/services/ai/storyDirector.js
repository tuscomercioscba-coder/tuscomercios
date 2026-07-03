export function buildStoryPrompt({ business, idea, style = "rápido y vendedor" }) {
  return `
Actuá como un community manager profesional especializado en historias de Instagram y Facebook para comercios.

OBJETIVO:
Crear una historia vertical 9:16 pensada para generar consultas rápidas.

NEGOCIO:
${business?.negocio || "Negocio"}

RUBRO:
${business?.rubro || "Comercio"}

CIUDAD:
${business?.ciudad || "Argentina"}

IDEA:
${idea || "Crear una historia para promocionar el negocio."}

ESTILO:
${style}

INSTRUCCIONES:
- Formato vertical 9:16.
- Mensaje claro y directo.
- Ideal para publicar durante 24 horas.
- Debe tener un llamado a la acción fuerte.
- Dejar espacio para logo del negocio.
- Puede incluir frases como "Consultanos", "Hoy", "Oferta", "Disponible".
- Diseño moderno, limpio y vendedor.
- No sobrecargar de texto.
- Que parezca una pieza hecha por un diseñador.
`;
}