import { supabase } from "../supabase";

export async function loadStudioEntity({
  id,
  entityType = "business",
  user,
}) {
  if (!id || !user) {
    throw new Error("Faltan datos para cargar el espacio de Studio.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin =
    String(profile?.role || "").toLowerCase() === "admin";

  if (entityType === "workspace") {
    if (!isAdmin) {
      throw new Error("Solo un administrador puede abrir este espacio.");
    }

    const { data, error } = await supabase
      .from("studio_workspaces")
      .select("*")
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();

    if (error || !data) {
      throw new Error("No se encontró el workspace de TusComercios.");
    }

    return {
      entityType: "workspace",
      isWorkspace: true,
      isAdmin,
      raw: data,
      entity: {
        ...data,
        id: data.id,
        negocio: data.name || "TusComercios",
        nombre: data.name || "TusComercios",
        slug: data.slug || "tuscomercios-admin",
        plan: "admin",
        rubro: data.category || "Plataforma digital",
        ciudad: data.city || "Argentina",
        descripcion: data.description || "",
        logo: data.logo || "",
        image: data.image || "",
        images: data.settings?.images || [],
        whatsapp: "",
        telefono: "",
        user_id: data.owner_id,
        is_unlimited: true,
        studioEntityType: "workspace",
      },
    };
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error("No se encontró el comercio.");
  }

  const isOwner = data.user_id === user.id;

  if (!isOwner && !isAdmin) {
    throw new Error("No tenés permiso para abrir este comercio.");
  }

  if (
    !isAdmin &&
    data.plan !== "standard" &&
    data.plan !== "premium"
  ) {
    const error = new Error("PLAN_REQUIRED");
    error.code = "PLAN_REQUIRED";
    throw error;
  }

  return {
    entityType: "business",
    isWorkspace: false,
    isAdmin,
    raw: data,
    entity: {
      ...data,
      studioEntityType: "business",
    },
  };
}

export function getStudioEntityName(entity) {
  return (
    entity?.negocio ||
    entity?.name ||
    entity?.nombre ||
    "TusComercios"
  );
}

export function getStudioEntityRouteType(entity) {
  return entity?.studioEntityType === "workspace"
    ? "workspace"
    : "business";
}
