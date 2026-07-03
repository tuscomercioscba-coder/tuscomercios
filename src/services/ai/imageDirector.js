export function buildImagePrompt({ business, idea, style = "profesional" }) {
  return `
Actuá como un diseñador gráfico senior especializado en publicidad para comercios.

OBJETIVO:
Crear una imagen publicitaria profesional para redes sociales.

NEGOCIO:
${business?.negocio || "Negocio"}

RUBRO:
${business?.rubro || "Comercio"}

CIUDAD:
${business?.ciudad || "Argentina"}

IDEA DEL CLIENTE:
${idea || "Crear una pieza promocional para vender más."}

ESTILO:
${style}

INSTRUCCIONES DE DISEÑO:
- Debe parecer hecha por un diseñador gráfico profesional.
- No debe parecer una imagen generada por IA.
- Usar composición moderna, clara y comercial.
- Dejar espacio visual para colocar logo del negocio.
- Pensar la imagen para Instagram, Facebook y WhatsApp.
- Evitar textos largos dentro de la imagen.
- Usar una estética atractiva para pequeños comercios.
- Enfocarse en vender, no solo en verse linda.
- Alta calidad visual.
- Iluminación profesional.
- Colores comerciales y llamativos, pero elegantes.
`;
}