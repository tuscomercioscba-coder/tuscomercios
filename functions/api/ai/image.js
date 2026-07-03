import { generateImage } from "./provider.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet() {
  return json({
    ok: true,
    message: "API de imagen funcionando",
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const prompt = String(body.prompt || "").trim();

    if (!prompt) return json({ error: "Falta el prompt" }, 400);

    const result = await generateImage({
      env: context.env,
      prompt,
    });

    return json({
      ok: true,
      imageBase64: result.imageBase64,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error: error.message || "Error generando imagen",
      },
      500
    );
  }
}