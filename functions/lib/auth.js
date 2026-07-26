function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function errorJson(message, status = 400, details = undefined) {
  return json(details ? { error: message, details } : { error: message }, status);
}

export function getBearerToken(request) {
  const header = request.headers.get("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

export async function requireUser(context) {
  const token = getBearerToken(context.request);

  if (!token) {
    return { response: errorJson("Sesión requerida", 401) };
  }

  const supabaseUrl = context.env.SUPABASE_URL;
  const anonKey = context.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return { response: errorJson("Falta configurar Supabase en Cloudflare", 500) };
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return { response: errorJson("Sesión inválida o vencida", 401) };
  }

  const user = await response.json();
  return { user, token };
}

export async function supabaseAdmin(context, path, options = {}) {
  const supabaseUrl = context.env.SUPABASE_URL;
  const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en Cloudflare");
  }

  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

export async function getProfile(context, userId) {
  const response = await supabaseAdmin(
    context,
    `profiles?id=eq.${encodeURIComponent(userId)}&select=id,role,plan&limit=1`
  );

  if (!response.ok) return null;
  const rows = await response.json();
  return rows?.[0] || null;
}

export async function isAdmin(context, userId) {
  const profile = await getProfile(context, userId);
  return profile?.role === "admin";
}
