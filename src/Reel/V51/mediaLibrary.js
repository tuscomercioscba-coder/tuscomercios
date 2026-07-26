export function collectReelMedia(business = {}, scenes = [], adminMedia = []) {
  const raw = [
    business.logo,
    business.image,
    ...(Array.isArray(business.images) ? business.images : []),
    ...(Array.isArray(business.videos) ? business.videos : []),
    ...scenes
      .filter((scene) => scene?.media)
      .map((scene) => ({
        src: scene.media,
        type: scene.mediaType || "image",
        fileName: scene.fileName || "",
      })),
    ...adminMedia,
  ].filter(Boolean);

  const seen = new Set();

  return raw
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `library-${index}`,
          src: item,
          type: isVideo(item) ? "video" : "image",
          fileName: `Recurso ${index + 1}`,
        };
      }

      return {
        id: item.id || `library-${index}`,
        src: item.src || item.url || "",
        type: item.type || (isVideo(item.src || item.url || "") ? "video" : "image"),
        fileName: item.fileName || item.name || `Recurso ${index + 1}`,
      };
    })
    .filter((item) => item.src)
    .filter((item) => {
      if (seen.has(item.src)) return false;
      seen.add(item.src);
      return true;
    });
}

function isVideo(src = "") {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src);
}
