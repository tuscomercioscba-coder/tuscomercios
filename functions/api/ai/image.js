import { generateImage } from "./provider.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const prompt = String(body.prompt || "").trim();

    if (!prompt) {
      return json({ error: "Falta el prompt" }, 400);
    }

    if (prompt.length > 4000) {
      return json({ error: "El prompt es demasiado largo" }, 400);
    }

    const result = await generateImage({
      env: context.env,
      prompt,
    });

    if (!result.imageBase64) {
      return json({ error: "OpenAI no devolvió imagen" }, 500);
    }

    return json({
      ok: true,
      imageBase64: result.imageBase64,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("AI IMAGE ERROR:", error);

    return json(
      {
        ok: false,
        error: error.message || "Error generando imagen",
      },
      500
    );
  }
}