export function buildImagePrompt({ business, idea, style = "premium" }) {
  return `
Actuá como un diseñador gráfico profesional senior especializado en publicidad para comercios reales.

Tenés que crear una pieza publicitaria PREMIUM, moderna, elegante y comercial.
La imagen debe parecer diseñada por un estudio gráfico profesional, NO por una IA.

NEGOCIO:
${business?.negocio || "Negocio"}

RUBRO:
${business?.rubro || "Comercio"}

CIUDAD:
${business?.ciudad || "Argentina"}

IDEA DEL CLIENTE:
${idea || "Crear una imagen promocional para vender más."}

ESTILO GENERAL:
${style}

FORMATO:
Imagen cuadrada para redes sociales, Instagram, Facebook y WhatsApp.

DIRECCIÓN CREATIVA:
- Diseño premium.
- Composición limpia y profesional.
- Estética moderna, comercial y realista.
- Buen uso de iluminación, sombras y profundidad.
- Colores elegantes y bien combinados.
- Que parezca una campaña hecha por diseñador gráfico.
- Que sea atractiva para vender.
- No usar estética genérica de IA.
- No deformar productos.
- No poner textos largos.
- Evitar letras mal escritas.
- Si agregás texto, que sea poco, grande y claro.
- Dejar espacio visual para colocar logo luego.
- No agregar marcas de agua.
- No agregar logos inventados.
- No agregar texto pequeño ilegible.
- No hacer collage desordenado.
- No usar estilo infantil.
- No usar exceso de elementos.

OBJETIVO COMERCIAL:
La imagen debe generar deseo, confianza y ganas de consultar por WhatsApp.

CALIDAD:
Ultra profesional, alta calidad, diseño publicitario premium.
`;
}