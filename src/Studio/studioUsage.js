import { supabase } from "../supabase";

export async function claimStudioUsage({ businessId, contentType }) {
  const { data, error } = await supabase.rpc("claim_studio_usage", {
    p_business_id: businessId,
    p_content_type: contentType,
  });

  if (error) {
    throw new Error(
      error.message || "No se pudo validar el límite diario de Studio."
    );
  }

  const result = Array.isArray(data) ? data[0] : data;

  if (!result?.allowed) {
    const limit = Number(result?.daily_limit || 0);
    throw new Error(
      limit > 0
        ? `Alcanzaste el límite diario de ${limit} ${
            contentType === "reel" ? "Reels" : "imágenes"
          }.`
        : "Studio requiere un plan Estándar o Premium."
    );
  }

  return result;
}

export async function releaseStudioUsage(usageId) {
  if (!usageId) return;

  const { error } = await supabase.rpc("release_studio_usage", {
    p_usage_id: String(usageId),
  });

  if (error) {
    console.error("No se pudo liberar el uso reservado:", error);
  }
}
