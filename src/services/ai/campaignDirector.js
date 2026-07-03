import { buildImagePrompt } from "./imageDirector";
import { buildFlyerPrompt } from "./flyerDirector";
import { buildStoryPrompt } from "./storyDirector";
import { buildReelPrompt } from "./reelDirector";

export function buildCampaignPlan({ business, idea }) {
  return {
    title: `Campaña para ${business?.negocio || "tu negocio"}`,
    objective: idea || "Crear una campaña para vender más.",
    pieces: [
      {
        type: "image",
        label: "Imagen para redes",
        prompt: buildImagePrompt({ business, idea, style: "moderno y vendedor" }),
      },
      {
        type: "story",
        label: "Historia 9:16",
        prompt: buildStoryPrompt({ business, idea }),
      },
      {
        type: "flyer",
        label: "Flyer comercial",
        prompt: buildFlyerPrompt({ business, idea }),
      },
      {
        type: "reel",
        label: "Reel automático",
        prompt: buildReelPrompt({ business, idea }),
      },
    ],
  };
}