export function classifyMediaFile(file) {
  if (!file) return null;

  const type = String(file.type || "").toLowerCase();

  if (type.startsWith("video/")) {
    return {
      type: "video",
      source: "upload",
    };
  }

  if (type.startsWith("image/")) {
    return {
      type: "image",
      source: "upload",
    };
  }

  return null;
}

export function normalizeMediaItem(item, index = 0) {
  if (!item) return null;

  if (typeof item === "string") {
    return {
      id: `media-${index}-${Date.now()}`,
      src: item,
      type: isVideoUrl(item) ? "video" : "image",
      source: "business",
      name: `Recurso ${index + 1}`,
    };
  }

  const src =
    item.src ||
    item.url ||
    item.media ||
    item.localObjectUrl ||
    "";

  if (!src) return null;

  return {
    id: item.id || `media-${index}-${Date.now()}`,
    src,
    type:
      item.type ||
      item.mediaType ||
      (isVideoUrl(src) ? "video" : "image"),
    source: item.source || "business",
    name: item.name || `Recurso ${index + 1}`,
    duration: Number(item.duration || 0),
    project: item.project || null,
  };
}

export function collectBusinessMedia(business = {}) {
  const raw = [
    business.image,
    business.logo,
    ...(Array.isArray(business.images) ? business.images : []),
    ...(Array.isArray(business.videos) ? business.videos : []),
  ].filter(Boolean);

  const seen = new Set();

  return raw
    .map(normalizeMediaItem)
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item.src)) return false;
      seen.add(item.src);
      return true;
    });
}

function isVideoUrl(src = "") {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src);
}
