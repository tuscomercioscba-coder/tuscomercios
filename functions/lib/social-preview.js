import { SECURITY_HEADERS } from "./security.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeImageUrl(value, origin) {
  try {
    const url = new URL(String(value || ""), origin);
    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : `${origin}/logo.png`;
  } catch {
    return `${origin}/logo.png`;
  }
}

export function shouldRenderSocialPreview(requestUrl, userAgent) {
  const url = new URL(requestUrl);
  const forcePreview = url.searchParams.get("preview") === "1";
  const isBot =
    /facebookexternalhit|Facebot|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Discordbot/i.test(
      userAgent || ""
    );
  return forcePreview || isBot;
}

export async function renderSocialPreview({ request, env }) {
  const url = new URL(request.url);
  const slug = decodeURIComponent(url.pathname.replace(/^\/|\/$/g, ""));

  if (!slug || slug.startsWith("api") || slug.includes("/")) {
    return null;
  }

  const params = new URLSearchParams({
    slug: `eq.${slug}`,
    status: "eq.published",
    select: "slug,negocio,descripcion,image,images,status",
    limit: "1",
  });

  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/businesses?${params.toString()}`,
    {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
    }
  );

  if (!response.ok) return null;

  const business = (await response.json())?.[0];
  if (!business) return null;

  const image = safeImageUrl(
    business.image || business.images?.[0],
    url.origin
  );
  const title = `${business.negocio || "Comercio"} | Tus Comercios`;
  const description =
    business.descripcion ||
    `Encontrá ${business.negocio || "este comercio"} en Tus Comercios`;
  const canonicalUrl = `${url.origin}/${encodeURIComponent(business.slug)}`;

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "public, max-age=300",
      ...SECURITY_HEADERS,
    },
  });
}
