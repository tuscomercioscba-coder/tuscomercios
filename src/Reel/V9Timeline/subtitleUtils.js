export function normalizeSubtitles(scene = {}) {
  const duration = Math.max(0.1, Number(scene.duration || 3));
  const list = Array.isArray(scene.subtitles) ? scene.subtitles : [];

  return list.map((item, index) => ({
    id: item.id || `subtitle-${index}-${Date.now()}`,
    text: String(item.text || ""),
    start: Math.max(0, Math.min(duration, Number(item.start || 0))),
    end: Math.max(0.1, Math.min(duration, Number(item.end ?? duration))),
  })).map((item) => ({
    ...item,
    end: Math.max(item.start + 0.1, item.end),
  }));
}

export function getActiveSubtitle(scene, sceneProgress = 0) {
  const duration = Math.max(0.1, Number(scene.duration || 3));
  const localTime = Math.max(0, Math.min(duration, sceneProgress * duration));
  const subtitles = normalizeSubtitles(scene);

  return subtitles.find(
    (item) => localTime >= item.start && localTime <= item.end
  ) || null;
}

export function createSubtitle(scene, text = "Nuevo subtítulo") {
  const duration = Math.max(0.1, Number(scene?.duration || 3));
  return {
    id: `subtitle-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    start: 0,
    end: duration,
  };
}
