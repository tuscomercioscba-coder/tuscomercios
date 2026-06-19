export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  const forcePreview = url.searchParams.get("preview") === "1";
  const ua = request.headers.get("user-agent") || "";

  const isBot =
    /facebookexternalhit|Facebot|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Discordbot/i.test(
      ua
    );

  if (
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".") ||
    (!isBot && !forcePreview)
  ) {
    return next();
  }

  const slug = url.pathname.replace(/^\/|\/$/g, "");

  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/businesses?slug=eq.${slug}&select=*`,
      {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
      }
    );

    const businesses = await response.json();
    const business = businesses?.[0];

    if (!business) return next();

    const image =
      business.image ||
      business.images?.[0] ||
      `${url.origin}/logo.png`;

    const title = `${business.negocio} | Tus Comercios`;

    const description =
      business.descripcion || `Encontrá ${business.negocio} en Tus Comercios`;

    return new Response(
      `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>

  <meta name="description" content="${description}" />

  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:url" content="${url.origin}/${slug}" />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <img src="${image}" style="max-width:400px;" />
</body>
</html>`,
      {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
        },
      }
    );
  } catch (error) {
    return next();
  }
}