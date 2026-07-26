import { supabase } from "../supabase";

const BUCKET = "studio-library";

export async function uploadStudioFile({
  userId,
  businessId,
  entityType = "business",
  contentType,
  title,
  blob,
  fileName,
  projectData = null,
}) {
  const timestamp = Date.now();

  const extension =
    fileName?.split(".").pop()?.toLowerCase() || "png";

  const storagePath =
    `${userId}/${businessId}/${timestamp}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, blob, {
      contentType: blob?.type || undefined,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const publicUrl =
    publicData?.publicUrl || "";

  let projectPath = "";
  let projectUrl = "";

  if (projectData) {
    projectPath =
      `${userId}/${businessId}/${timestamp}-project.json`;

    const projectBlob = new Blob(
      [JSON.stringify(projectData, null, 2)],
      {
        type: "application/json",
      }
    );

    const { error: projectError } = await supabase.storage
      .from(BUCKET)
      .upload(projectPath, projectBlob, {
        contentType: "application/json",
        upsert: false,
      });

    if (projectError) {
      await supabase.storage
        .from(BUCKET)
        .remove([storagePath]);

      throw projectError;
    }

    const { data: projectPublicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(projectPath);

    projectUrl =
      projectPublicData?.publicUrl || "";
  }

  const { data, error } = await supabase
    .from("studio_library")
    .insert({
      user_id: userId,
      business_id: businessId,
      entity_type: entityType,
      content_type: contentType,
      title: title || "Contenido de Studio",
      file_url: publicUrl,
      thumbnail_url: publicUrl,
      metadata: {
        storage_path: storagePath,
        file_name: fileName,
        mime_type: blob?.type || "",
        project_path: projectPath,
        project_url: projectUrl,
        editable: Boolean(projectData),
      },
    })
    .select()
    .single();

  if (error) {
    const pathsToDelete = [
      storagePath,
      projectPath,
    ].filter(Boolean);

    await supabase.storage
      .from(BUCKET)
      .remove(pathsToDelete);

    throw error;
  }

  return data;
}

export async function getStudioLibrary({
  userId,
  businessId,
  contentType = "all",
}) {
  let query = supabase
    .from("studio_library")
    .select("*")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .order("created_at", {
      ascending: false,
    });

  if (contentType !== "all") {
    query = query.eq(
      "content_type",
      contentType
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export async function deleteStudioLibraryItem(item) {
  if (!item?.id) {
    throw new Error(
      "No se pudo identificar el archivo."
    );
  }

  const pathsToDelete = [
    item?.metadata?.storage_path,
    item?.metadata?.project_path,
  ].filter(Boolean);

  if (pathsToDelete.length > 0) {
    const { error: storageError } =
      await supabase.storage
        .from(BUCKET)
        .remove(pathsToDelete);

    if (storageError) {
      throw storageError;
    }
  }

  const { error } = await supabase
    .from("studio_library")
    .delete()
    .eq("id", item.id);

  if (error) {
    throw error;
  }

  return true;
}