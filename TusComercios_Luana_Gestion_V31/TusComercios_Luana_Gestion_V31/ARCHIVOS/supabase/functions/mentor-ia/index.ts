import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { STUDIO_KNOWLEDGE } from "./knowledge/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash";
const CHAT_MAX_WORDS = 250;
const DIRECTOR_MAX_WORDS = 200;
const LIMITS: Record<string, number> = {
  free: 0,
  gratuito: 0,
  standard: 15,
  estandar: 15,
  premium: 40,
};

const DIRECTOR_LIMITS: Record<string, number> = {
  free: 0,
  gratuito: 0,
  standard: 1,
  estandar: 1,
  premium: 2,
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function normalizePlan(plan: unknown) {
  const value = String(plan || "free")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (value === "estandar") return "standard";
  if (value === "gratuito") return "free";
  return value;
}

function argentinaDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function extractGeminiText(response: any) {
  const parts = response?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";

  return parts
    .map((part: any) => String(part?.text || ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

function capWords(text: string, maxWords: number) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return String(text || "").trim();
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/, "")}…`;
}

function buildInstructions(
  business: any,
  marketing: any,
  studioContext: any = null,
  responseMode = "standard",
) {
  const maxWords = responseMode === "creative-review"
    ? DIRECTOR_MAX_WORDS
    : CHAT_MAX_WORDS;
  return `Sos Mentor IA de TusComercios, asesor de marketing, ventas y crecimiento para pequeños comercios, profesionales, servicios y emprendimientos argentinos.

OBJETIVO:
Ayudar al negocio a vender más, atraer clientes, mejorar su comunicación y tomar mejores decisiones con recomendaciones realistas, económicas y aplicables.

NEGOCIO:
Nombre: ${business?.name || "Comercio"}
Rubro: ${business?.category || "Comercio"}
Localidad: ${business?.city || "Argentina"}
Descripción: ${business?.description || "Sin descripción cargada"}
Público principal: ${marketing?.audience || "Vecinos y clientes de la zona"}
Productos o servicios: ${marketing?.products || "No especificados"}
Objetivo: ${marketing?.goal || "Vender más"}
Tono: ${marketing?.tone || "Cercano y profesional"}

MODO DE RESPUESTA: ${responseMode}

CONTEXTO DEL PROYECTO ABIERTO EN STUDIO:
${studioContext ? JSON.stringify(studioContext, null, 2).slice(0, 14000) : "No se recibió un proyecto abierto."}

${STUDIO_KNOWLEDGE}

REGLAS OBLIGATORIAS:
- Respondé solamente en español argentino.
- Analizá primero la consulta completa y después escribí únicamente la respuesta final.
- Adaptá la extensión a la consulta: breve si es simple, desarrollada si es media y hasta ${maxWords} palabras si es compleja.
- La respuesta completa nunca puede superar ${maxWords} palabras.
- Antes de enviarla, revisá que todas las frases, listas e ideas hayan quedado terminadas.
- Nunca dejes una frase cortada, una lista incompleta ni una idea a medias.
- Si no alcanza el espacio, eliminá detalles secundarios y conservá únicamente las recomendaciones más importantes.
- Sé concreto, preciso, útil, realista y amable.
- No saludes, no te despidas y no repitas la pregunta.
- No inventes datos, precios, resultados ni características del negocio.
- Si falta un dato indispensable, hacé una sola pregunta breve.
- Priorizá acciones que puedan realizarse hoy o esta semana con costo bajo o nulo.
- No prometas ventas garantizadas.
- Escribí en texto limpio, sin asteriscos ni formato Markdown.
- No afirmes que viste píxeles, fotogramas o una imagen visual si no se adjuntó una imagen.
- Cuando recibas CONTEXTO DEL PROYECTO ABIERTO EN STUDIO, sí podés analizar su estructura real: textos, capas, posiciones, tamaños, colores, escenas, tiempos, transiciones, audios y Brand Kit.
- En modo creative-review, comenzá directamente por los 3 cambios prioritarios y luego calificá impacto, legibilidad, marca y conversión del 1 al 10.
- Toda recomendación debe usar exclusivamente herramientas reales documentadas de TusComercios Studio.
- Terminá siempre con una última línea completa que empiece exactamente así:
Acción recomendada:`;
}

function normalizeHistoryForGemini(history: any[], message: string) {
  const contents = (Array.isArray(history) ? history.slice(-4) : [])
    .filter((item: any) => item?.role === "user" || item?.role === "assistant")
    .map((item: any) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: String(item.content || "").slice(0, 900) }],
    }));

  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  return contents;
}

async function readRole(supabaseAdmin: any, userId: string) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return String(data?.role || "").toLowerCase();
}

async function readEntity(
  supabaseAdmin: any,
  entityType: string,
  entityId: string,
  userId: string,
  admin: boolean,
) {
  const table = entityType === "workspace" ? "studio_workspaces" : "businesses";

  const { data, error } = await supabaseAdmin
    .from(table)
    .select("*")
    .eq("id", entityId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("No se encontró el comercio seleccionado.");
  }

  const ownerId = data.user_id || data.owner_id || data.created_by || null;

  if (!admin && ownerId && ownerId !== userId) {
    throw new Error("No tenés permiso para usar Mentor IA en este comercio.");
  }

  return data;
}

async function getUsage(
  supabaseAdmin: any,
  userId: string,
  entityType: string,
  entityId: string,
) {
  const usageDate = argentinaDateKey();

  const { data, error } = await supabaseAdmin
    .from("mentor_daily_usage")
    .select("responses_used")
    .eq("user_id", userId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("usage_date", usageDate)
    .maybeSingle();

  if (error) throw error;

  return {
    used: Number(data?.responses_used || 0),
    usageDate,
  };
}

async function incrementUsage(
  supabaseAdmin: any,
  userId: string,
  entityType: string,
  entityId: string,
  usageDate: string,
  used: number,
) {
  const { error } = await supabaseAdmin.from("mentor_daily_usage").upsert(
    {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      usage_date: usageDate,
      responses_used: used + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,entity_type,entity_id,usage_date" },
  );

  if (error) throw error;
}

function directorEditorType(studioContext: any) {
  const source = String(studioContext?.source || "").toLowerCase();
  if (source === "image-editor") return "image";
  if (source === "reels-studio") return "reel";
  if (source === "carousel-studio") return "carousel";
  return null;
}

async function getDirectorUsage(
  supabaseAdmin: any,
  userId: string,
  entityType: string,
  entityId: string,
  editorType: "image" | "reel" | "carousel",
) {
  const usageDate = argentinaDateKey();

  const { data, error } = await supabaseAdmin
    .from("mentor_director_daily_usage")
    .select("analyses_used")
    .eq("user_id", userId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("editor_type", editorType)
    .eq("usage_date", usageDate)
    .maybeSingle();

  if (error) throw error;

  return {
    used: Number(data?.analyses_used || 0),
    usageDate,
  };
}

async function incrementDirectorUsage(
  supabaseAdmin: any,
  userId: string,
  entityType: string,
  entityId: string,
  editorType: "image" | "reel" | "carousel",
  usageDate: string,
  used: number,
) {
  const { error } = await supabaseAdmin
    .from("mentor_director_daily_usage")
    .upsert(
      {
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        editor_type: editorType,
        usage_date: usageDate,
        analyses_used: used + 1,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict:
          "user_id,entity_type,entity_id,editor_type,usage_date",
      },
    );

  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }

  try {
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authorization = req.headers.get("Authorization") || "";

    if (!authorization.startsWith("Bearer ")) {
      return json({ ok: false, error: "Sesión inválida." }, 401);
    }

    const supabaseUser = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authorization } } },
    );

    const supabaseAdmin = createClient(supabaseUrl, serviceRole);

    const { data: authData, error: authError } = await supabaseUser.auth.getUser();
    const user = authData?.user;

    if (authError || !user) {
      return json({ ok: false, error: "Sesión vencida." }, 401);
    }

    const body = await req.json();
    const action = String(body?.action || "respond");
    const responseMode = String(body?.responseMode || "standard");
    const editorType = directorEditorType(body?.studioContext);
    const isDirectorAnalysis =
      responseMode === "creative-review" && editorType !== null;
    const entityType = body?.entityType === "workspace" ? "workspace" : "business";
    const entityId = String(body?.entityId || "");

    if (!entityId) {
      return json({ ok: false, error: "Falta identificar el comercio." }, 400);
    }

    const accessRole = await readRole(supabaseAdmin, user.id);
    const admin = accessRole === "admin";

    const entity = await readEntity(
      supabaseAdmin,
      entityType,
      entityId,
      user.id,
      admin,
    );

    const workspace = entityType === "workspace";
    const plan = normalizePlan(
      entity?.plan ||
        entity?.settings?.plan ||
        body?.business?.plan ||
        (workspace ? "premium" : "free"),
    );

    const unlimited = admin || accessRole === "content_creator";
    const chatLimit = unlimited ? null : LIMITS[plan] ?? 0;
    const directorLimit = unlimited ? null : DIRECTOR_LIMITS[plan] ?? 0;

    const usage = await getUsage(
      supabaseAdmin,
      user.id,
      entityType,
      entityId,
    );

    const directorUsage = isDirectorAnalysis
      ? await getDirectorUsage(
          supabaseAdmin,
          user.id,
          entityType,
          entityId,
          editorType!,
        )
      : null;

    const activeLimit = isDirectorAnalysis ? directorLimit : chatLimit;
    const activeUsed = isDirectorAnalysis
      ? Number(directorUsage?.used || 0)
      : usage.used;
    const remaining = unlimited
      ? null
      : Math.max(0, Number(activeLimit) - activeUsed);

    if (action === "status") {
      return json({
        ok: true,
        used: usage.used,
        limit: chatLimit,
        remaining: unlimited
          ? null
          : Math.max(0, Number(chatLimit) - usage.used),
        unlimited,
        plan,
      });
    }

    if (!unlimited && Number(activeLimit) <= 0) {
      return json(
        {
          ok: false,
          code: "PLAN_REQUIRED",
          error: isDirectorAnalysis
            ? "El análisis con Mentor IA está disponible en los planes Estándar y Premium."
            : "Mentor IA está disponible en los planes Estándar y Premium.",
        },
        403,
      );
    }

    if (!unlimited && Number(remaining) <= 0) {
      const editorName = editorType === "image"
        ? "Editor de Imágenes"
        : editorType === "carousel"
          ? "Editor de Carruseles"
          : "Reels Studio";

      return json(
        {
          ok: false,
          code: isDirectorAnalysis
            ? "DIRECTOR_DAILY_LIMIT"
            : "DAILY_LIMIT",
          error: isDirectorAnalysis
            ? `Ya utilizaste los ${activeLimit} análisis diarios disponibles en ${editorName}. Se reinician mañana.`
            : "Ya utilizaste todas las respuestas disponibles de hoy.",
          used: activeUsed,
          limit: activeLimit,
          remaining: 0,
          editorType,
        },
        429,
      );
    }

    if (!geminiKey) {
      return json(
        {
          ok: false,
          error: "Falta configurar GEMINI_API_KEY en Supabase.",
        },
        500,
      );
    }

    const message = String(body?.message || "").trim().slice(0, 700);

    if (!message) {
      return json({ ok: false, error: "La consulta está vacía." }, 400);
    }

    const contents = normalizeHistoryForGemini(body?.history, message);

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(geminiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: buildInstructions(
                  body?.business,
                  body?.marketingProfile,
                  body?.studioContext,
                  responseMode,
                ),
              },
            ],
          },
          contents,
          generationConfig: {
            maxOutputTokens: isDirectorAnalysis ? 850 : 1200,
            thinkingConfig: {
              thinkingLevel: "minimal",
            },
          },
        }),
      },
    );

    const responseJson = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("Gemini API error", responseJson);
      return json(
        {
          ok: false,
          error: "La IA no pudo responder en este momento.",
        },
        502,
      );
    }

    const rawContent = extractGeminiText(responseJson);
    const content = capWords(
      rawContent,
      isDirectorAnalysis ? DIRECTOR_MAX_WORDS : CHAT_MAX_WORDS,
    );

    if (!content) {
      return json(
        {
          ok: false,
          error: "La IA devolvió una respuesta vacía.",
        },
        502,
      );
    }

    if (isDirectorAnalysis) {
      await incrementDirectorUsage(
        supabaseAdmin,
        user.id,
        entityType,
        entityId,
        editorType!,
        directorUsage!.usageDate,
        directorUsage!.used,
      );
    } else {
      await incrementUsage(
        supabaseAdmin,
        user.id,
        entityType,
        entityId,
        usage.usageDate,
        usage.used,
      );
    }

    const usageMetadata = responseJson?.usageMetadata || {};

    await supabaseAdmin.from("mentor_usage_log").insert({
      user_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      model: MODEL,
      input_tokens: Number(usageMetadata.promptTokenCount || 0),
      output_tokens: Number(usageMetadata.candidatesTokenCount || 0),
      total_tokens: Number(usageMetadata.totalTokenCount || 0),
      response_mode: responseMode,
      studio_source: String(body?.studioContext?.source || "") || null,
      created_at: new Date().toISOString(),
    });

    const nextUsed = activeUsed + 1;

    return json({
      ok: true,
      content,
      used: nextUsed,
      limit: activeLimit,
      remaining: unlimited
        ? null
        : Math.max(0, Number(activeLimit) - nextUsed),
      unlimited,
      usageType: isDirectorAnalysis ? `director_${editorType}` : "chat",
      editorType,
      model: MODEL,
    });
  } catch (error) {
    console.error(error);

    return json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error inesperado.",
      },
      500,
    );
  }
});
