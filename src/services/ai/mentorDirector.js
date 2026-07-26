import { trimToWordLimit } from "../../MentorIA/Utils/MentorPrompt";

function businessName(business) {
  return business?.negocio || business?.name || "tu negocio";
}

function action(text) {
  return `\n\nAcción recomendada: ${text}`;
}

export function createMentorDemoResponse({ message, business, marketingProfile }) {
  const clean = String(message || "").trim();
  const lower = clean.toLowerCase();
  const name = businessName(business);
  const products = String(marketingProfile?.products || "").trim();

  let response;

  if (!clean) {
    response = `Contame qué problema querés resolver en ${name}: ventas, redes sociales, promociones, clientes o contenido.${action("Escribí una situación concreta para recibir una recomendación práctica.")}`;
  } else if (lower.includes("poca") && lower.includes("venta") || lower.includes("vender más") || lower.includes("no vendo")) {
    response = `${name} necesita una oferta fácil de entender y visible para los vecinos. Elegí un producto de compra frecuente, mostrale un beneficio claro y repetí la comunicación durante varios días. Usá un cartel que se lea desde la calle, estados de WhatsApp y un Reel corto mostrando el producto real. También pedí a los clientes habituales que recomienden el comercio. No empieces con publicidad paga hasta comprobar qué oferta genera consultas.${action("Elegí hoy un producto de buena salida y promocionalo durante tres días con una oferta simple y visible.")}`;
  } else if (lower.includes("reel") || lower.includes("video")) {
    response = `Creá un Reel de 10 a 15 segundos con tres partes: un gancho inicial, el producto o servicio en acción y un llamado a consultar. Mostrá material real de ${name}; evitá textos largos y usá una sola idea. El primer texto debe explicar rápidamente el beneficio para el cliente. Cerrá con nombre, localidad y WhatsApp.${action("Grabá hoy tres clips cortos: exterior del local, producto destacado y entrega al cliente; después armalo en Reels Studio.")}`;
  } else if (lower.includes("public") || lower.includes("instagram") || lower.includes("facebook")) {
    response = `Publicá contenido que responda tres preguntas: qué vendés, por qué conviene y cómo comprar. Alterná productos reales, testimonios, promociones y escenas del trabajo diario. No publiques solamente precios: mostrales a las personas el resultado o la experiencia. Para ${name}, conviene mantener una frecuencia sostenible antes que publicar mucho durante pocos días.${action("Prepará una publicación con un producto principal, un beneficio concreto y un llamado directo a WhatsApp.")}`;
  } else if (lower.includes("promo") || lower.includes("oferta") || lower.includes("descuento")) {
    response = `La promoción debe ser simple, tener una duración clara y proteger tu ganancia. En lugar de descontar todo, combiná un producto atractivo con otro de buen margen. Comunicá una sola condición y evitá letras pequeñas. Si tenés productos principales cargados, priorizá ${products || "uno que tenga buena rotación"}.${action("Definí una promoción válida por 48 horas y publicala con precio, beneficio, fecha límite y botón de WhatsApp.")}`;
  } else if (lower.includes("cliente") || lower.includes("barrio") || lower.includes("vecino")) {
    response = `Para atraer clientes cercanos, trabajá la repetición y la recomendación. Hacé que el local sea fácil de identificar, mostrale a los vecinos una oferta diaria y utilizá WhatsApp para recordar novedades sin saturar. Un beneficio pequeño para quienes vuelven o recomiendan puede funcionar mejor que un descuento general. Registrá qué acciones generan visitas reales.${action("Creá una oferta exclusiva para vecinos y pedí a cinco clientes habituales que la compartan en sus estados.")}`;
  } else {
    response = `Para darte una recomendación útil necesito convertir tu consulta en una acción concreta. Pensá qué querés mejorar primero en ${name}: conseguir más visitas, vender un producto, recuperar clientes o comunicar una promoción. Elegir un objetivo evita gastar tiempo y dinero en acciones que no se pueden medir.${action("Elegí un único objetivo para los próximos siete días y contame qué producto o servicio querés impulsar.")}`;
  }

  return trimToWordLimit(response);
}
