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
  downloadBlob = null,
  downloadFileName = "",
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
  let downloadPath = "";
  let downloadUrl = "";

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

  if (downloadBlob) {
    const downloadExtension =
      downloadFileName?.split(".").pop()?.toLowerCase() || "zip";
    downloadPath =
      `${userId}/${businessId}/${timestamp}-download.${downloadExtension}`;

    const { error: downloadError } = await supabase.storage
      .from(BUCKET)
      .upload(downloadPath, downloadBlob, {
        contentType: downloadBlob?.type || "application/octet-stream",
        upsert: false,
      });

    if (downloadError) {
      await supabase.storage
        .from(BUCKET)
        .remove([storagePath, projectPath].filter(Boolean));
      throw downloadError;
    }

    const { data: downloadPublicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(downloadPath);

    downloadUrl = downloadPublicData?.publicUrl || "";
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
        download_path: downloadPath,
        download_url: downloadUrl,
        download_file_name: downloadFileName,
        editable: Boolean(projectData),
      },
    })
    .select()
    .single();

  if (error) {
    const pathsToDelete = [
      storagePath,
      projectPath,
      downloadPath,
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
    item?.metadata?.download_path,
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

export async function renameStudioLibraryItem(item, title) {
  const cleanTitle = String(title || "").trim().slice(0, 140);
  if (!item?.id || !cleanTitle) {
    throw new Error("Ingresá un nombre válido.");
  }

  const { data, error } = await supabase
    .from("studio_library")
    .update({ title: cleanTitle })
    .eq("id", item.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function duplicateStudioLibraryItem(item) {
  if (!item?.file_url) {
    throw new Error("El contenido no tiene un archivo para duplicar.");
  }

  const [fileResponse, projectResponse, downloadResponse] = await Promise.all([
    fetch(item.file_url),
    item?.metadata?.project_url
      ? fetch(item.metadata.project_url)
      : Promise.resolve(null),
    item?.metadata?.download_url
      ? fetch(item.metadata.download_url)
      : Promise.resolve(null),
  ]);

  if (!fileResponse.ok) {
    throw new Error("No se pudo recuperar el contenido original.");
  }

  const fileBlob = await fileResponse.blob();
  const projectData = projectResponse?.ok
    ? await projectResponse.json()
    : null;
  const downloadBlob = downloadResponse?.ok
    ? await downloadResponse.blob()
    : null;

  return uploadStudioFile({
    userId: item.user_id,
    businessId: item.business_id,
    entityType: item.entity_type || "business",
    contentType: item.content_type,
    title: `${item.title || "Contenido de Studio"} - copia`,
    blob: fileBlob,
    fileName: item?.metadata?.file_name || "contenido.png",
    projectData,
    downloadBlob,
    downloadFileName:
      item?.metadata?.download_file_name || "",
  });
}
