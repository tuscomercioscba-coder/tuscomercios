import { MIN_CLIP_DURATION } from "./constants";

export function createId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatTime(seconds = 0) {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  const hundredths = Math.floor((safe % 1) * 100);

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

export function createInitialClip(duration) {
  return {
    id: createId("clip"),
    name: "Escena 1",
    start: 0,
    end: Math.max(MIN_CLIP_DURATION, Number(duration) || 0),
    thumbnails: [],
    transition: "cut",
    transitionDuration: 0,
  };
}

export function splitClip(clips, clipId, sourceTime) {
  const index = clips.findIndex((clip) => clip.id === clipId);
  if (index < 0) return clips;

  const clip = clips[index];
  const cut = clamp(sourceTime, clip.start, clip.end);

  if (
    cut - clip.start < MIN_CLIP_DURATION ||
    clip.end - cut < MIN_CLIP_DURATION
  ) {
    return clips;
  }

  const first = {
    ...clip,
    id: createId("clip"),
    end: cut,
  };

  const second = {
    ...clip,
    id: createId("clip"),
    start: cut,
  };

  const next = [...clips];
  next.splice(index, 1, first, second);

  return renumberClips(next);
}

export function duplicateClip(clips, clipId) {
  const index = clips.findIndex((clip) => clip.id === clipId);
  if (index < 0) return clips;

  const copy = {
    ...clips[index],
    id: createId("clip"),
  };

  const next = [...clips];
  next.splice(index + 1, 0, copy);

  return renumberClips(next);
}

export function deleteClip(clips, clipId) {
  return renumberClips(clips.filter((clip) => clip.id !== clipId));
}

export function moveClipToIndex(clips, clipId, targetIndex) {
  const fromIndex = clips.findIndex((clip) => clip.id === clipId);
  if (fromIndex < 0) return clips;

  const safeTarget = clamp(targetIndex, 0, clips.length - 1);
  const next = [...clips];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(safeTarget, 0, moved);

  return renumberClips(next);
}

export function updateClip(clips, clipId, changes) {
  return renumberClips(
    clips.map((clip) =>
      clip.id === clipId
        ? {
            ...clip,
            ...changes,
          }
        : clip
    )
  );
}

export function renumberClips(clips) {
  return clips.map((clip, index) => ({
    ...clip,
    name: `Escena ${index + 1}`,
  }));
}

export function getProjectDuration(clips = []) {
  return clips.reduce(
    (total, clip) =>
      total + Math.max(0, Number(clip.end) - Number(clip.start)),
    0
  );
}

export function downloadJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
