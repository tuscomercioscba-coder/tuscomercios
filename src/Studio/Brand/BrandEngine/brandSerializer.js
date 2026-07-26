import {
  BRAND_KIT_VERSION,
  createDefaultBrandKit,
} from "./brandDefaults";

import {
  sanitizeBrandKit,
  validateBrandKit,
} from "./brandValidation";

export function serializeBrandKit(brandKit = {}) {
  const sanitized = sanitizeBrandKit(brandKit);
  const validation = validateBrandKit(sanitized);

  if (!validation.valid) {
    const error = new Error(
      "El Brand Kit contiene datos inválidos."
    );

    error.validation = validation;
    throw error;
  }

  return JSON.stringify(
    {
      type: "tuscomercios-brand-kit",
      version: BRAND_KIT_VERSION,
      exportedAt: new Date().toISOString(),
      data: sanitized,
    },
    null,
    2
  );
}

export function deserializeBrandKit(serializedValue) {
  const parsed =
    typeof serializedValue === "string"
      ? JSON.parse(serializedValue)
      : serializedValue;

  if (!parsed || typeof parsed !== "object") {
    throw new Error("El archivo de Brand Kit no es válido.");
  }

  const rawData =
    parsed.type === "tuscomercios-brand-kit"
      ? parsed.data
      : parsed;

  const migrated = migrateBrandKit(
    rawData,
    parsed.version || rawData?.version || 1
  );

  return sanitizeBrandKit(
    createDefaultBrandKit(migrated)
  );
}

export function exportBrandKitFile(
  brandKit,
  fileName = "brand-kit-tuscomercios.json"
) {
  const content = serializeBrandKit(brandKit);
  const blob = new Blob([content], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 2000);
}

export function importBrandKitFile(file) {
  if (!file) {
    return Promise.reject(
      new Error("No se seleccionó ningún archivo.")
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        resolve(deserializeBrandKit(reader.result));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(
        new Error("No se pudo leer el archivo de Brand Kit.")
      );
    };

    reader.readAsText(file);
  });
}

function migrateBrandKit(data = {}, version = 1) {
  let migrated = {
    ...data,
  };

  if (version < 1) {
    migrated = createDefaultBrandKit(migrated);
  }

  return {
    ...migrated,
    version: BRAND_KIT_VERSION,
  };
}
