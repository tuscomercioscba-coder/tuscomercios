import {
  BRAND_FONT_OPTIONS,
  BRAND_STYLE_OPTIONS,
  DEFAULT_BRAND_KIT,
  WATERMARK_POSITIONS,
} from "./brandDefaults";

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const URL_PATTERN = /^(https?:\/\/|www\.)/i;

export function validateBrandKit(brandKit = {}) {
  const errors = [];
  const warnings = [];

  validateIdentity(brandKit.identity, errors, warnings);
  validateColors(brandKit.colors, errors);
  validateTypography(brandKit.typography, errors);
  validateStyle(brandKit.style, errors);
  validateButton(brandKit.button, errors);
  validateWatermark(brandKit.watermark, errors);
  validateContact(brandKit.contact, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function sanitizeBrandKit(brandKit = {}) {
  return {
    ...DEFAULT_BRAND_KIT,
    ...brandKit,

    identity: {
      ...DEFAULT_BRAND_KIT.identity,
      ...(brandKit.identity || {}),
    },

    logos: {
      ...DEFAULT_BRAND_KIT.logos,
      ...(brandKit.logos || {}),
    },

    colors: sanitizeColors(brandKit.colors),

    typography: {
      ...DEFAULT_BRAND_KIT.typography,
      ...(brandKit.typography || {}),
      titleWeight: clampNumber(
        brandKit.typography?.titleWeight,
        100,
        900,
        DEFAULT_BRAND_KIT.typography.titleWeight
      ),
      bodyWeight: clampNumber(
        brandKit.typography?.bodyWeight,
        100,
        900,
        DEFAULT_BRAND_KIT.typography.bodyWeight
      ),
    },

    style: {
      ...DEFAULT_BRAND_KIT.style,
      ...(brandKit.style || {}),
      cornerRadius: clampNumber(
        brandKit.style?.cornerRadius,
        0,
        80,
        DEFAULT_BRAND_KIT.style.cornerRadius
      ),
      shadowStrength: clampNumber(
        brandKit.style?.shadowStrength,
        0,
        100,
        DEFAULT_BRAND_KIT.style.shadowStrength
      ),
      overlayStrength: clampNumber(
        brandKit.style?.overlayStrength,
        0,
        100,
        DEFAULT_BRAND_KIT.style.overlayStrength
      ),
    },

    button: {
      ...DEFAULT_BRAND_KIT.button,
      ...(brandKit.button || {}),
      borderWidth: clampNumber(
        brandKit.button?.borderWidth,
        0,
        12,
        DEFAULT_BRAND_KIT.button.borderWidth
      ),
      borderRadius: clampNumber(
        brandKit.button?.borderRadius,
        0,
        60,
        DEFAULT_BRAND_KIT.button.borderRadius
      ),
      shadowStrength: clampNumber(
        brandKit.button?.shadowStrength,
        0,
        100,
        DEFAULT_BRAND_KIT.button.shadowStrength
      ),
    },

    watermark: {
      ...DEFAULT_BRAND_KIT.watermark,
      ...(brandKit.watermark || {}),
      enabled: Boolean(brandKit.watermark?.enabled),
      opacity: clampNumber(
        brandKit.watermark?.opacity,
        0,
        100,
        DEFAULT_BRAND_KIT.watermark.opacity
      ),
      size: clampNumber(
        brandKit.watermark?.size,
        4,
        60,
        DEFAULT_BRAND_KIT.watermark.size
      ),
    },

    contact: {
      ...DEFAULT_BRAND_KIT.contact,
      ...(brandKit.contact || {}),
    },

    content: {
      ...DEFAULT_BRAND_KIT.content,
      ...(brandKit.content || {}),
    },

    metadata: {
      ...DEFAULT_BRAND_KIT.metadata,
      ...(brandKit.metadata || {}),
    },
  };
}

export function isValidHexColor(value) {
  return HEX_COLOR_PATTERN.test(String(value || ""));
}

function validateIdentity(identity = {}, errors, warnings) {
  if (!String(identity.businessName || "").trim()) {
    warnings.push({
      field: "identity.businessName",
      message: "Falta el nombre comercial.",
    });
  }

  if (String(identity.slogan || "").length > 120) {
    errors.push({
      field: "identity.slogan",
      message: "El eslogan no puede superar los 120 caracteres.",
    });
  }

  if (String(identity.shortDescription || "").length > 300) {
    errors.push({
      field: "identity.shortDescription",
      message: "La descripción corta no puede superar los 300 caracteres.",
    });
  }
}

function validateColors(colors = {}, errors) {
  Object.entries({
    ...DEFAULT_BRAND_KIT.colors,
    ...colors,
  }).forEach(([key, value]) => {
    if (!isValidHexColor(value)) {
      errors.push({
        field: `colors.${key}`,
        message: `El color ${key} no tiene un formato válido.`,
      });
    }
  });
}

function validateTypography(typography = {}, errors) {
  const fontIds = BRAND_FONT_OPTIONS.map((font) => font.id);

  if (!fontIds.includes(typography.primaryFont)) {
    errors.push({
      field: "typography.primaryFont",
      message: "La tipografía principal no es válida.",
    });
  }

  if (!fontIds.includes(typography.secondaryFont)) {
    errors.push({
      field: "typography.secondaryFont",
      message: "La tipografía secundaria no es válida.",
    });
  }
}

function validateStyle(style = {}, errors) {
  const styleIds = BRAND_STYLE_OPTIONS.map((item) => item.id);

  if (!styleIds.includes(style.preferredStyle)) {
    errors.push({
      field: "style.preferredStyle",
      message: "El estilo visual no es válido.",
    });
  }
}

function validateButton(button = {}, errors) {
  ["backgroundColor", "textColor", "borderColor"].forEach((field) => {
    if (!isValidHexColor(button[field])) {
      errors.push({
        field: `button.${field}`,
        message: `El color ${field} del botón no es válido.`,
      });
    }
  });
}

function validateWatermark(watermark = {}, errors) {
  const positions = WATERMARK_POSITIONS.map((item) => item.id);

  if (!positions.includes(watermark.position)) {
    errors.push({
      field: "watermark.position",
      message: "La posición de la marca de agua no es válida.",
    });
  }
}

function validateContact(contact = {}, warnings) {
  ["instagram", "facebook", "tiktok", "website"].forEach((field) => {
    const value = String(contact[field] || "").trim();

    if (value && !URL_PATTERN.test(value) && !value.startsWith("@")) {
      warnings.push({
        field: `contact.${field}`,
        message: `Revisá el formato de ${field}.`,
      });
    }
  });
}

function sanitizeColors(colors = {}) {
  const result = {
    ...DEFAULT_BRAND_KIT.colors,
  };

  Object.keys(result).forEach((key) => {
    const value = colors?.[key];

    if (isValidHexColor(value)) {
      result[key] = value.toLowerCase();
    }
  });

  return result;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}
