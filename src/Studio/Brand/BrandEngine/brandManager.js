import {
  createDefaultBrandKit,
} from "./brandDefaults";

import {
  sanitizeBrandKit,
  validateBrandKit,
} from "./brandValidation";

const BRAND_KIT_TABLE = "studio_brand_kits";

export function createBrandManager({
  supabase,
  storageBucket = "studio-brand-assets",
} = {}) {
  if (!supabase) {
    throw new Error(
      "Brand Manager necesita una instancia de Supabase."
    );
  }

  async function loadBrandKit(businessId) {
    assertBusinessId(businessId);

    const { data, error } = await supabase
      .from(BRAND_KIT_TABLE)
      .select("*")
      .eq("business_id", businessId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return createDefaultBrandKit({
        metadata: {
          businessId,
        },
      });
    }

    return mapRowToBrandKit(data);
  }

  async function saveBrandKit({
    businessId,
    userId,
    brandKit,
  }) {
    assertBusinessId(businessId);

    const sanitized = sanitizeBrandKit(
      createDefaultBrandKit({
        ...brandKit,
        metadata: {
          ...(brandKit?.metadata || {}),
          businessId,
          updatedAt: new Date().toISOString(),
        },
      })
    );

    const validation = validateBrandKit(sanitized);

    if (!validation.valid) {
      const error = new Error(
        "El Brand Kit contiene datos inválidos."
      );

      error.validation = validation;
      throw error;
    }

    const row = mapBrandKitToRow({
      businessId,
      userId,
      brandKit: sanitized,
    });

    const { data, error } = await supabase
      .from(BRAND_KIT_TABLE)
      .upsert(row, {
        onConflict: "business_id",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapRowToBrandKit(data);
  }

  async function deleteBrandKit(businessId) {
    assertBusinessId(businessId);

    const { error } = await supabase
      .from(BRAND_KIT_TABLE)
      .delete()
      .eq("business_id", businessId);

    if (error) {
      throw error;
    }

    return true;
  }

  async function uploadBrandAsset({
    businessId,
    file,
    assetType = "primary",
  }) {
    assertBusinessId(businessId);

    if (!file) {
      throw new Error("No se seleccionó ningún archivo.");
    }

    if (!file.type?.startsWith("image/")) {
      throw new Error("El recurso de marca debe ser una imagen.");
    }

    if (file.size > 15 * 1024 * 1024) {
      throw new Error(
        "La imagen no puede superar los 15 MB."
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "png";

    const safeType = String(assetType || "asset")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    
    const filePath = `${businessId}/${safeType}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: data?.publicUrl || "",
    };
  }

  async function removeBrandAsset(path) {
    if (!path) return true;

    const { error } = await supabase.storage
      .from(storageBucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return true;
  }

  return {
    loadBrandKit,
    saveBrandKit,
    deleteBrandKit,
    uploadBrandAsset,
    removeBrandAsset,
  };
}

export function applyBrandKitToImageDesign(
  design = {},
  brandKit = {}
) {
  const brand = sanitizeBrandKit(brandKit);

  return {
    ...design,

    logo:
      design.logo ||
      brand.logos.primary ||
      "",

    titleColor:
      design.titleColor ||
      brand.colors.text,

    textColor:
      design.textColor ||
      brand.colors.textSoft,

    buttonColor:
      design.buttonColor ||
      brand.button.backgroundColor,

    titleFont:
      design.titleFont ||
      brand.typography.primaryFont,

    subtitleFont:
      design.subtitleFont ||
      brand.typography.secondaryFont,

    style:
      design.style ||
      brand.style.preferredStyle,

    cta:
      design.cta ||
      brand.content.preferredCta,

    watermark: {
      ...brand.watermark,
      logo:
        brand.logos[
          brand.watermark.source
        ] ||
        brand.logos.primary ||
        "",
    },
  };
}

export function applyBrandKitToReelScenes(
  scenes = [],
  brandKit = {}
) {
  const brand = sanitizeBrandKit(brandKit);

  return scenes.map((scene) => ({
    ...scene,

    titleFont:
      scene.titleFont ||
      brand.typography.primaryFont,

    subtitleFont:
      scene.subtitleFont ||
      brand.typography.secondaryFont,

    titleColor:
      scene.titleColor ||
      brand.colors.text,

    subtitleColor:
      scene.subtitleColor ||
      brand.colors.textSoft,

    cameraEasing:
      scene.cameraEasing ||
      brand.content.favoriteAnimation ||
      "cinematic",

    brandKitApplied: true,
  }));
}

export function getBrandCssVariables(brandKit = {}) {
  const brand = sanitizeBrandKit(brandKit);

  return {
    "--brand-primary": brand.colors.primary,
    "--brand-secondary": brand.colors.secondary,
    "--brand-accent": brand.colors.accent,
    "--brand-background": brand.colors.background,
    "--brand-surface": brand.colors.surface,
    "--brand-text": brand.colors.text,
    "--brand-text-soft": brand.colors.textSoft,
    "--brand-radius": `${brand.style.cornerRadius}px`,
    "--brand-button-radius": `${brand.button.borderRadius}px`,
  };
}

function mapBrandKitToRow({
  businessId,
  userId,
  brandKit,
}) {
  return {
    business_id: businessId,
    user_id: userId || null,
    version: brandKit.version || 1,
    brand_data: brandKit,
    updated_at: new Date().toISOString(),
  };
}

function mapRowToBrandKit(row = {}) {
  return sanitizeBrandKit(
    createDefaultBrandKit({
      ...(row.brand_data || {}),
      metadata: {
        ...(row.brand_data?.metadata || {}),
        businessId: row.business_id || "",
        createdAt: row.created_at || "",
        updatedAt: row.updated_at || "",
      },
    })
  );
}

function assertBusinessId(businessId) {
  if (!businessId) {
    throw new Error(
      "Falta el ID del comercio."
    );
  }
}
