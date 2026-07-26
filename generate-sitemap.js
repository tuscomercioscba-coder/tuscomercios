import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://czbukztebwrfpvbvycje.supabase.co";
const supabaseKey = "sb_publishable_zGkiDLovJGeugSjhgbTo_g_xkoO9sgS";

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("slug")
    .eq("status", "published")
    .not("slug", "is", null);

  if (error) {
    console.error("Error generando sitemap:", error);
    process.exit(1);
  }

  const urls = (businesses || [])
    .filter((b) => b.slug)
    .map((b) => {
      const safeSlug = encodeURIComponent(String(b.slug).trim());
      return `  <url>
    <loc>https://tuscomercios.com.ar/${safeSlug}</loc>
  </url>`
    })
    .join("\n");

  const sitemap =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tuscomercios.com.ar/</loc>
  </url>
  <url>
    <loc>https://tuscomercios.com.ar/planes</loc>
  </url>
${urls}
</urlset>`;

  fs.writeFileSync("./public/sitemap.xml", sitemap.trim());

  console.log("✅ sitemap generado correctamente");
}

generateSitemap();
