import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    return new Response("Missing server configuration", { status: 500 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: expired, error } = await supabase
    .from("business_stories")
    .select("id,media_url")
    .lt("expires_at", new Date().toISOString())
    .limit(500);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const paths = (expired || [])
    .map((story) => {
      const marker = "/business-images/";
      return decodeURIComponent(String(story.media_url).split(marker)[1] || "");
    })
    .filter(Boolean);

  if (paths.length) {
    await supabase.storage.from("business-images").remove(paths);
  }

  const ids = (expired || []).map((story) => story.id);
  if (ids.length) {
    const { error: deleteError } = await supabase
      .from("business_stories")
      .delete()
      .in("id", ids);
    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }
  }

  return Response.json({ removed: ids.length });
});
