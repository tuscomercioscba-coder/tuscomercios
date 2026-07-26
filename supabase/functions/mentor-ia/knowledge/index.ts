import { RULES_KNOWLEDGE } from "./rules.ts";
import { PLATFORM_KNOWLEDGE } from "./platform.ts";
import { PLANS_KNOWLEDGE } from "./plans.ts";
import { BRAND_KIT_KNOWLEDGE } from "./brand-kit.ts";
import { IMAGE_EDITOR_KNOWLEDGE } from "./image-editor.ts";
import { REELS_STUDIO_KNOWLEDGE } from "./reels-studio.ts";
import { LIBRARY_KNOWLEDGE } from "./library.ts";
import { ANALYTICS_KNOWLEDGE } from "./analytics.ts";
import { MENTOR_KNOWLEDGE } from "./mentor.ts";
import { HELP_ROADMAP_KNOWLEDGE } from "./help-roadmap.ts";

export const KNOWLEDGE_VERSION = "2026-07-25.2";

export const STUDIO_KNOWLEDGE = [
  RULES_KNOWLEDGE,
  PLATFORM_KNOWLEDGE,
  PLANS_KNOWLEDGE,
  BRAND_KIT_KNOWLEDGE,
  IMAGE_EDITOR_KNOWLEDGE,
  REELS_STUDIO_KNOWLEDGE,
  LIBRARY_KNOWLEDGE,
  ANALYTICS_KNOWLEDGE,
  MENTOR_KNOWLEDGE,
  HELP_ROADMAP_KNOWLEDGE
].join("\n\n");
