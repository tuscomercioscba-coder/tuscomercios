export async function onRequest(context) {
const { request, env } = context;

const url = new URL(request.url);

const ua = request.headers.get("user-agent") || "";

const forcePreview = url.searchParams.get("preview") === "1";

const isBot =
/facebookexternalhit|Facebot|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Discordbot/i.test(
ua
);

if (!isBot && !forcePreview) {
return env.ASSETS.fetch(request);
}

const slug = url.pathname.replace(/^/|/$/g, "");

if (
!slug ||
slug.startsWith("api") ||
slug.includes(".")
) {
return env.ASSETS.fetch(request);
}

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

if (!business) {
return env.ASSETS.fetch(request);
}

const image =
business.image ||
business.images?.[0] ||
`${url.origin}/logo.png`;

const title =
`${business.negocio} | Tus Comercios`;

const description =
business.descripcion ||
`Encontrá ${business.negocio}`;

return new Response(
`

<!DOCTYPE html>

<html>
<head>

<meta charset="utf-8"/>

<title>${title}</title>

<meta property="og:title" content="${title}" />

<meta property="og:description"
content="${description}" />

<meta property="og:image"
content="${image}" />

<meta property="og:url"
content="${url.href}" />

<meta property="og:type"
content="website" />

<meta property="twitter:card"
content="summary_large_image"/>

<meta http-equiv="refresh"
content="0; url=${url.href}" />

</head>

<body></body>

</html>
`,
{
headers: {
"Content-Type":"text/html",
},
}
);

} catch {

return env.ASSETS.fetch(request);

}

}
