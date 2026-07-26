import { createId, clamp } from "./utils";

export function createAudioTrack({
  url,
  fileName,
  duration,
  projectDuration,
}) {
  const safeProjectDuration =
    Math.max(0.1, Number(projectDuration || duration || 1));

  const safeDuration =
    Math.max(0.1, Number(duration || safeProjectDuration));

  return {
    id: createId("audio"),
    name: fileName || "Música",
    url,
    sourceDuration: safeDuration,
    start: 0,
    end: Math.min(safeProjectDuration, safeDuration),
    sourceStart: 0,
    volume: 70,
    fadeIn: 0.8,
    fadeOut: 1,
    muted: false,
  };
}

export function normalizeAudioTrack(track = {}) {
  const start = Math.max(0, Number(track.start || 0));
  const end = Math.max(start + 0.1, Number(track.end || start + 1));

  return {
    ...track,
    start,
    end,
    sourceStart: Math.max(0, Number(track.sourceStart || 0)),
    volume: clamp(Number(track.volume ?? 70), 0, 100),
    fadeIn: Math.max(0, Number(track.fadeIn ?? 0.8)),
    fadeOut: Math.max(0, Number(track.fadeOut ?? 1)),
    muted: Boolean(track.muted),
  };
}

export function getAudioGain(track, projectTime) {
  const safe = normalizeAudioTrack(track);

  if (
    safe.muted ||
    projectTime < safe.start ||
    projectTime > safe.end
  ) {
    return 0;
  }

  const base = safe.volume / 100;
  const local = projectTime - safe.start;
  const remaining = safe.end - projectTime;

  let gain = base;

  if (safe.fadeIn > 0 && local < safe.fadeIn) {
    gain *= Math.max(0, Math.min(1, local / safe.fadeIn));
  }

  if (safe.fadeOut > 0 && remaining < safe.fadeOut) {
    gain *= Math.max(0, Math.min(1, remaining / safe.fadeOut));
  }

  return gain;
}
