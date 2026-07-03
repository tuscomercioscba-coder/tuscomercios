export function buildPrompt({
  business,
  objective,
  product,
  audience,
  promotion,
  format,
}) {
  return `
Sos un diseñador gráfico senior especializado en marketing para pequeños comercios.

Información del negocio:

Nombre:
${business.negocio}

Rubro:
${business.rubro}

Ciudad:
${business.ciudad}

Objetivo:

${objective}

Producto o servicio:

${product}

Oferta:

${promotion}

Público objetivo:

${audience}

Formato solicitado:

${format}

Instrucciones:

Crear una pieza gráfica profesional.

No hacer una imagen con apariencia de IA.

Debe parecer realizada por un diseñador gráfico profesional.

Usar composición moderna.

Dejar espacios para logo.

Usar colores acordes al negocio.

Generar una imagen publicitaria pensada para aumentar ventas.

No colocar marcas de agua.

Calidad ultra profesional.
`;
}