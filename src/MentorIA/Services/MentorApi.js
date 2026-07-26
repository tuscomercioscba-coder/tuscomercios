import { supabase } from "../../supabase";

function normalizeHistory(history = []) {
  return history
    .filter((item) => item?.role === "user" || item?.role === "assistant")
    .slice(-6)
    .map((item) => ({
      role: item.role,
      content: String(item.content || "").slice(0, 1200),
    }));
}

function getEntityPayload(business) {
  return {
    name: business?.negocio || business?.name || "Comercio",
    category: business?.rubro || business?.category || "Comercio",
    city: business?.ciudad || business?.localidad || business?.city || "Argentina",
    description:
      business?.descripcion || business?.description || "Sin descripción cargada",
    plan: business?.plan || "free",
  };
}

export async function getMentorStatus({ entityType, entityId }) {
  const { data, error } = await supabase.functions.invoke("mentor-ia", {
    body: {
      action: "status",
      entityType,
      entityId,
    },
  });

  if (error) {
    throw new Error(error.message || "No se pudo consultar el límite de Mentor IA.");
  }

  if (!data?.ok) {
    throw new Error(data?.error || "No se pudo consultar Mentor IA.");
  }

  return data;
}

export async function requestMentorResponse({
  message,
  business,
  marketingProfile,
  history,
  entityType,
  entityId,
  studioContext = null,
  responseMode = "standard",
}) {
  const cleanMessage = String(message || "").trim();

  if (!cleanMessage) {
    throw new Error("Escribí una consulta antes de enviarla.");
  }

  const { data, error } = await supabase.functions.invoke("mentor-ia", {
    body: {
      action: "respond",
      entityType,
      entityId,
      message: cleanMessage.slice(0, 700),
      business: getEntityPayload(business),
      marketingProfile: {
        audience: String(marketingProfile?.audience || "").slice(0, 300),
        products: String(marketingProfile?.products || "").slice(0, 400),
        goal: String(marketingProfile?.goal || "Vender más").slice(0, 200),
        tone: String(
          marketingProfile?.tone || "Cercano y profesional"
        ).slice(0, 120),
      },
      history: normalizeHistory(history),
      studioContext,
      responseMode,
    },
  });

  if (error) {
    throw new Error(error.message || "No se pudo obtener la respuesta de Mentor IA.");
  }

  if (!data?.ok) {
    const serverError = new Error(data?.error || "Mentor IA no pudo responder.");
    serverError.code = data?.code || "MENTOR_ERROR";
    serverError.status = data?.status || 400;
    throw serverError;
  }

  return {
    content: data.content,
    remaining: data.remaining,
    used: data.used,
    limit: data.limit,
    model: data.model,
    demo: false,
  };
}
