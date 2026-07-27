const BASE_MODERN_STICKERS = [
  {
    "id": "badge-0",
    "category": "ventas",
    "name": "NUEVO",
    "src": "/stickers/badge-0.svg"
  },
  {
    "id": "badge-1",
    "category": "ventas",
    "name": "OFERTA",
    "src": "/stickers/badge-1.svg"
  },
  {
    "id": "badge-2",
    "category": "ventas",
    "name": "SALE",
    "src": "/stickers/badge-2.svg"
  },
  {
    "id": "badge-3",
    "category": "ventas",
    "name": "-20%",
    "src": "/stickers/badge-3.svg"
  },
  {
    "id": "badge-4",
    "category": "ventas",
    "name": "-30%",
    "src": "/stickers/badge-4.svg"
  },
  {
    "id": "badge-5",
    "category": "ventas",
    "name": "-50%",
    "src": "/stickers/badge-5.svg"
  },
  {
    "id": "badge-6",
    "category": "ventas",
    "name": "2x1",
    "src": "/stickers/badge-6.svg"
  },
  {
    "id": "badge-7",
    "category": "ventas",
    "name": "3x2",
    "src": "/stickers/badge-7.svg"
  },
  {
    "id": "badge-8",
    "category": "ventas",
    "name": "HOY",
    "src": "/stickers/badge-8.svg"
  },
  {
    "id": "badge-9",
    "category": "ventas",
    "name": "AHORA",
    "src": "/stickers/badge-9.svg"
  },
  {
    "id": "badge-10",
    "category": "ventas",
    "name": "TOP",
    "src": "/stickers/badge-10.svg"
  },
  {
    "id": "badge-11",
    "category": "ventas",
    "name": "WOW",
    "src": "/stickers/badge-11.svg"
  },
  {
    "id": "badge-12",
    "category": "ventas",
    "name": "PREMIUM",
    "src": "/stickers/badge-12.svg"
  },
  {
    "id": "badge-13",
    "category": "ventas",
    "name": "ÚLTIMOS",
    "src": "/stickers/badge-13.svg"
  },
  {
    "id": "badge-14",
    "category": "ventas",
    "name": "ENVÍO",
    "src": "/stickers/badge-14.svg"
  },
  {
    "id": "arrow-right",
    "category": "flechas",
    "name": "Flecha derecha",
    "src": "/stickers/arrow-right.svg"
  },
  {
    "id": "arrow-left",
    "category": "flechas",
    "name": "Flecha izquierda",
    "src": "/stickers/arrow-left.svg"
  },
  {
    "id": "arrow-up",
    "category": "flechas",
    "name": "Flecha arriba",
    "src": "/stickers/arrow-up.svg"
  },
  {
    "id": "arrow-down",
    "category": "flechas",
    "name": "Flecha abajo",
    "src": "/stickers/arrow-down.svg"
  },
  {
    "id": "reaction-love",
    "category": "reacciones",
    "name": "Corazón",
    "src": "/stickers/reaction-love.svg"
  },
  {
    "id": "reaction-wow",
    "category": "reacciones",
    "name": "Sorpresa",
    "src": "/stickers/reaction-wow.svg"
  },
  {
    "id": "reaction-like",
    "category": "reacciones",
    "name": "Me gusta",
    "src": "/stickers/reaction-like.svg"
  },
  {
    "id": "reaction-fire",
    "category": "reacciones",
    "name": "Fuego",
    "src": "/stickers/reaction-fire.svg"
  },
  {
    "id": "reaction-star",
    "category": "reacciones",
    "name": "Estrella",
    "src": "/stickers/reaction-star.svg"
  },
  {
    "id": "shop",
    "category": "comercio",
    "name": "Comercio",
    "src": "/stickers/shop.svg"
  },
  {
    "id": "cart",
    "category": "comercio",
    "name": "Carrito",
    "src": "/stickers/cart.svg"
  },
  {
    "id": "delivery",
    "category": "comercio",
    "name": "Delivery",
    "src": "/stickers/delivery.svg"
  },
  {
    "id": "location",
    "category": "comercio",
    "name": "Ubicación",
    "src": "/stickers/location.svg"
  },
  {
    "id": "phone",
    "category": "comercio",
    "name": "Contacto",
    "src": "/stickers/phone.svg"
  },
  {
    "id": "clock",
    "category": "comercio",
    "name": "Horario",
    "src": "/stickers/clock.svg"
  },
  {
    "id": "gift",
    "category": "comercio",
    "name": "Regalo",
    "src": "/stickers/gift.svg"
  },
  {
    "id": "megaphone",
    "category": "comercio",
    "name": "Anuncio",
    "src": "/stickers/megaphone.svg"
  },
  {
    "id": "calendar",
    "category": "comercio",
    "name": "Evento",
    "src": "/stickers/calendar.svg"
  },
  {
    "id": "money",
    "category": "comercio",
    "name": "Precio",
    "src": "/stickers/money.svg"
  },
  {
    "id": "sparkles",
    "category": "decoracion",
    "name": "Brillos",
    "src": "/stickers/sparkles.svg"
  },
  {
    "id": "check",
    "category": "decoracion",
    "name": "Aprobado",
    "src": "/stickers/check.svg"
  },
  {
    "id": "bolt",
    "category": "decoracion",
    "name": "Rápido",
    "src": "/stickers/bolt.svg"
  },
  {
    "id": "rocket",
    "category": "decoracion",
    "name": "Cohete",
    "src": "/stickers/rocket.svg"
  }
];

function createInlineSticker({
  id,
  category,
  name,
  emoji,
  from = "#7c3aed",
  to = "#2563eb",
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="560" height="360" viewBox="0 0 560 360">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
        <filter id="s"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity=".22"/></filter>
      </defs>
      <g filter="url(#s)">
        <rect x="28" y="35" width="504" height="290" rx="84" fill="url(#g)"/>
        <circle cx="472" cy="92" r="42" fill="white" opacity=".16"/>
        <path d="M58 257 C180 196 335 318 510 210" fill="none" stroke="white" stroke-width="10" opacity=".14"/>
      </g>
      <text x="280" y="154" text-anchor="middle" font-family="Arial,sans-serif" font-size="76">${emoji}</text>
      <text x="280" y="238" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="38" font-weight="900" letter-spacing="2">${name}</text>
    </svg>`;
  return {
    id,
    category,
    name,
    src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
  };
}

const EMOJI_STICKERS = [
  ["heart", "AMOR", "❤️"], ["fire", "FUEGO", "🔥"],
  ["shine", "BRILLOS", "✨"], ["star-emoji", "ESTRELLA", "⭐"],
  ["party", "FIESTA", "🎉"], ["present", "REGALO", "🎁"],
  ["cake", "CUMPLE", "🎂"], ["balloon", "GLOBOS", "🎈"],
  ["celebrate", "CELEBRAR", "🥳"], ["love-face", "ME ENCANTA", "😍"],
  ["thumb", "GENIAL", "👍"], ["clap", "APLAUSOS", "👏"],
  ["rocket-emoji", "DESPEGÁ", "🚀"], ["idea", "IDEA", "💡"],
  ["pin", "UBICACIÓN", "📍"], ["call", "LLAMANOS", "📞"],
  ["cart", "COMPRÁ", "🛒"], ["delivery", "ENVÍOS", "🚚"],
  ["hundred", "100%", "💯"], ["camera", "MIRÁ", "📸"],
].map(([id, name, emoji], index) =>
  createInlineSticker({
    id: `emoji-${id}`,
    category: "emojis",
    name,
    emoji,
    from: index % 3 === 0 ? "#ec4899" : index % 3 === 1 ? "#7c3aed" : "#0ea5e9",
    to: index % 2 ? "#2563eb" : "#f97316",
  })
);

const DATE_STICKERS = [
  ["navidad", "NAVIDAD", "🎄"], ["new-year", "AÑO NUEVO", "🎆"],
  ["father", "PAPÁ", "💙"], ["mother", "MAMÁ", "🌷"],
  ["friends", "AMIGOS", "🫶"], ["children", "INFANCIAS", "🎠"],
  ["spring", "PRIMAVERA", "🌼"], ["easter", "PASCUAS", "🐰"],
  ["birthday-date", "CUMPLEAÑOS", "🎂"], ["worker", "TRABAJO", "🛠️"],
  ["argentina", "ARGENTINA", "🇦🇷"], ["halloween", "HALLOWEEN", "🎃"],
].map(([id, name, emoji], index) =>
  createInlineSticker({
    id: `date-${id}`,
    category: "fechas",
    name,
    emoji,
    from: index % 2 ? "#0f172a" : "#dc2626",
    to: index % 3 ? "#7c3aed" : "#16a34a",
  })
);

const CTA_STICKERS = [
  ["buy", "COMPRÁ AHORA", "🛍️"], ["write", "ESCRIBINOS", "💬"],
  ["book", "RESERVÁ", "📅"], ["more", "CONOCÉ MÁS", "👀"],
  ["order", "PEDÍ HOY", "📦"], ["visit", "VISITANOS", "📍"],
  ["offer", "OFERTA", "⚡"], ["limited", "ÚLTIMOS DÍAS", "⏰"],
].map(([id, name, emoji], index) =>
  createInlineSticker({
    id: `cta-${id}`,
    category: "llamados",
    name,
    emoji,
    from: index % 2 ? "#2563eb" : "#e11d48",
    to: index % 2 ? "#06b6d4" : "#f97316",
  })
);

export const MODERN_STICKERS = [
  ...BASE_MODERN_STICKERS,
  ...EMOJI_STICKERS,
  ...DATE_STICKERS,
  ...CTA_STICKERS,
];

export const STICKER_CATEGORIES = [
  {
    "id": "ventas",
    "label": "Ventas"
  },
  {
    "id": "flechas",
    "label": "Flechas"
  },
  {
    "id": "reacciones",
    "label": "Reacciones"
  },
  {
    "id": "comercio",
    "label": "Comercio"
  },
  {
    "id": "decoracion",
    "label": "Decoración"
  },
  {
    "id": "emojis",
    "label": "Emojis"
  },
  {
    "id": "fechas",
    "label": "Fechas"
  },
  {
    "id": "llamados",
    "label": "Llamados"
  }
];
