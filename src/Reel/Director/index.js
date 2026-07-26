import {
  DIRECTOR_MODES,
  DIRECTOR_STYLES,
  buildDirectorContext,
} from "./directorBase";

import { buildCommercialDirectorPlan } from "./directorCommercial";
import { buildPremiumDirectorPlan } from "./directorPremium";
import { buildTusComerciosDirectorPlan } from "./directorTusComercios";

export {
  DIRECTOR_MODES,
  DIRECTOR_STYLES,
  SCENE_TYPES,
  buildDirectorContext,
  normalizeMedia,
  createDirectedScene,
  distributeDurations,
  createEndScene,
  normalizeCategory,
} from "./directorBase";

export { buildCommercialDirectorPlan } from "./directorCommercial";
export { buildPremiumDirectorPlan } from "./directorPremium";
export { buildTusComerciosDirectorPlan } from "./directorTusComercios";

export function buildReelDirectorPlan(input = {}) {
  const context = buildDirectorContext(input);

  if (
    context.mode === DIRECTOR_MODES.ADMIN ||
    context.style === DIRECTOR_STYLES.TUSCOMERCIOS
  ) {
    return buildTusComerciosDirectorPlan(input);
  }

  if (
    context.style === DIRECTOR_STYLES.PREMIUM ||
    context.style === DIRECTOR_STYLES.ELEGANT ||
    context.style === DIRECTOR_STYLES.CINEMATIC
  ) {
    return buildPremiumDirectorPlan(input);
  }

  return buildCommercialDirectorPlan(input);
}
