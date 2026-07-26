export function studioProjectToMedia(project, previewUrl = "") {
  if (!project) return null;

  return {
    id: `studio-project-${Date.now()}`,
    src: previewUrl,
    type: "image",
    source: "studio",
    name: "Diseño de Studio",
    project,
  };
}

export function buildReelProject({
  businessId,
  entityType = "business",
  goal,
  style,
  scenes,
  music = null,
  quality = "high",
}) {
  return {
    version: 5,
    type: "tuscomercios-reel",
    businessId,
    entityType,
    goal,
    style,
    scenes,
    music,
    quality,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function downloadReelProject(
  project,
  fileName = "reel-studio.json"
) {
  const blob = new Blob(
    [JSON.stringify(project, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
