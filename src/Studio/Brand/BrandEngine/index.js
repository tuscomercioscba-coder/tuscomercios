export {
  BRAND_KIT_VERSION,
  BRAND_STYLE_OPTIONS,
  BRAND_FONT_OPTIONS,
  BRAND_CTA_OPTIONS,
  WATERMARK_POSITIONS,
  DEFAULT_BRAND_KIT,
  createDefaultBrandKit,
} from "./brandDefaults";

export {
  validateBrandKit,
  sanitizeBrandKit,
  isValidHexColor,
} from "./brandValidation";

export {
  serializeBrandKit,
  deserializeBrandKit,
  exportBrandKitFile,
  importBrandKitFile,
} from "./brandSerializer";

export {
  createBrandManager,
  applyBrandKitToImageDesign,
  applyBrandKitToReelScenes,
  getBrandCssVariables,
} from "./brandManager";
