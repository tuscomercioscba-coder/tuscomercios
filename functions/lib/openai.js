export async function generateOpenAIImage({ apiKey, prompt }) {
  if (!apiKey) throw new Error("Falta OPENAI_API_KEY");
  if (!prompt) throw new Error("Falta prompt");

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "high",
      output_format: "png",
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("OpenAI error:", result);
    throw new Error(result?.error?.message || "Error generando imagen");
  }

  return {
    imageBase64: result?.data?.[0]?.b64_json || null,
    provider: "openai",
    model: "gpt-image-1",
  };
}