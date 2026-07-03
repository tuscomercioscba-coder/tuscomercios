import { generateOpenAIImage } from "../../lib/openai.js";

export async function generateImage({ env, prompt }) {
  return await generateOpenAIImage({
    apiKey: env.OPENAI_API_KEY,
    prompt,
  });
}