import { clamp } from "./utils";
import { buildProjectTimeline } from "./projectTimeline";

export function resizeClipLeft(
  clips,
  clipId,
  deltaSeconds
) {
  return clips.map((clip) => {
    if (clip.id !== clipId) return clip;

    const nextStart = clamp(
      Number(clip.start || 0) + deltaSeconds,
      0,
      Number(clip.end || 0) - 0.1
    );

    return {
      ...clip,
      start: nextStart,
    };
  });
}

export function resizeClipRight(
  clips,
  clipId,
  deltaSeconds
) {
  return clips.map((clip) => {
    if (clip.id !== clipId) return clip;

    const sourceDuration = Math.max(
      Number(clip.sourceDuration || 0),
      Number(clip.end || 0),
      0.1
    );

    const nextEnd = clamp(
      Number(clip.end || 0) + deltaSeconds,
      Number(clip.start || 0) + 0.1,
      sourceDuration
    );

    return {
      ...clip,
      end: nextEnd,
    };
  });
}

export function moveClipToProjectTime(
  clips,
  clipId,
  targetProjectTime
) {
  const timeline = buildProjectTimeline(clips);
  const dragged = timeline.find(
    (clip) => clip.id === clipId
  );

  if (!dragged) return clips;

  const target = Math.max(
    0,
    Number(targetProjectTime || 0)
  );

  let targetIndex = timeline.length - 1;

  for (let index = 0; index < timeline.length; index += 1) {
    const clip = timeline[index];
    const midpoint =
      clip.projectStart + clip.duration / 2;

    if (target < midpoint) {
      targetIndex = index;
      break;
    }
  }

  const currentIndex = clips.findIndex(
    (clip) => clip.id === clipId
  );

  if (
    currentIndex < 0 ||
    currentIndex === targetIndex
  ) {
    return clips;
  }

  const next = [...clips];
  const [moved] = next.splice(currentIndex, 1);

  const adjustedIndex =
    currentIndex < targetIndex
      ? Math.max(0, targetIndex - 1)
      : targetIndex;

  next.splice(adjustedIndex, 0, moved);

  return next;
}

export function resizeLayerLeft(
  layers,
  layerId,
  deltaSeconds
) {
  return layers.map((layer) => {
    if (layer.id !== layerId) return layer;

    return {
      ...layer,
      start: clamp(
        Number(layer.start || 0) + deltaSeconds,
        0,
        Number(layer.end || 0) - 0.1
      ),
    };
  });
}

export function resizeLayerRight(
  layers,
  layerId,
  deltaSeconds,
  projectDuration
) {
  return layers.map((layer) => {
    if (layer.id !== layerId) return layer;

    return {
      ...layer,
      end: clamp(
        Number(layer.end || 0) + deltaSeconds,
        Number(layer.start || 0) + 0.1,
        projectDuration
      ),
    };
  });
}

export function moveLayerByDelta(
  layers,
  layerId,
  deltaSeconds,
  projectDuration
) {
  return layers.map((layer) => {
    if (layer.id !== layerId) return layer;

    const duration =
      Number(layer.end || 0) -
      Number(layer.start || 0);

    const nextStart = clamp(
      Number(layer.start || 0) + deltaSeconds,
      0,
      Math.max(0, projectDuration - duration)
    );

    return {
      ...layer,
      start: nextStart,
      end: nextStart + duration,
    };
  });
}

export function resizeAudioLeft(
  track,
  deltaSeconds
) {
  if (!track) return track;

  return {
    ...track,
    start: clamp(
      Number(track.start || 0) + deltaSeconds,
      0,
      Number(track.end || 0) - 0.1
    ),
  };
}

export function resizeAudioRight(
  track,
  deltaSeconds,
  projectDuration
) {
  if (!track) return track;

  return {
    ...track,
    end: clamp(
      Number(track.end || 0) + deltaSeconds,
      Number(track.start || 0) + 0.1,
      projectDuration
    ),
  };
}
