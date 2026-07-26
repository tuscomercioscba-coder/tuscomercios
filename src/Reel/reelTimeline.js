export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function easeLinear(t) {
  return clamp(t, 0, 1);
}

export function easeInQuad(t) {
  const p = clamp(t, 0, 1);
  return p * p;
}

export function easeOutQuad(t) {
  const p = clamp(t, 0, 1);
  return 1 - (1 - p) * (1 - p);
}

export function easeInOutQuad(t) {
  const p = clamp(t, 0, 1);

  return p < 0.5
    ? 2 * p * p
    : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

export function easeInCubic(t) {
  const p = clamp(t, 0, 1);
  return p * p * p;
}

export function easeOutCubic(t) {
  const p = clamp(t, 0, 1);
  return 1 - Math.pow(1 - p, 3);
}

export function easeInOutCubic(t) {
  const p = clamp(t, 0, 1);

  return p < 0.5
    ? 4 * p * p * p
    : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

export function normalizeSceneDuration(duration) {
  const value = Number(duration);

  if (!Number.isFinite(value)) return 3;

  return clamp(value, 1, 10);
}

export function getEnabledScenes(scenes = []) {
  return scenes.filter((scene) => scene?.enabled !== false);
}

export function getReelDuration(scenes = []) {
  const enabledScenes = getEnabledScenes(scenes);

  return enabledScenes.reduce(
    (total, scene) =>
      total + normalizeSceneDuration(scene.duration),
    0
  );
}

export function buildTimeline(scenes = []) {
  const enabledScenes = getEnabledScenes(scenes);

  let currentTime = 0;

  return enabledScenes.map((scene, index) => {
    const duration = normalizeSceneDuration(scene.duration);
    const start = currentTime;
    const end = start + duration;

    currentTime = end;

    return {
      ...scene,
      timelineIndex: index,
      start,
      end,
      duration,
    };
  });
}

export function getTimelineState(
  scenes = [],
  currentTime = 0
) {
  const timeline = buildTimeline(scenes);
  const totalDuration = getReelDuration(scenes);

  if (!timeline.length) {
    return {
      timeline: [],
      totalDuration: 0,
      currentScene: null,
      currentSceneIndex: -1,
      sceneProgress: 0,
      reelProgress: 0,
      currentTime: 0,
    };
  }

  const safeTime = clamp(
    Number(currentTime) || 0,
    0,
    totalDuration
  );

  let currentSceneIndex = timeline.findIndex(
    (scene) =>
      safeTime >= scene.start &&
      safeTime < scene.end
  );

  if (
    currentSceneIndex === -1 &&
    safeTime >= totalDuration
  ) {
    currentSceneIndex = timeline.length - 1;
  }

  const currentScene =
    timeline[currentSceneIndex] || timeline[0];

  const localTime = clamp(
    safeTime - currentScene.start,
    0,
    currentScene.duration
  );

  const sceneProgress =
    currentScene.duration > 0
      ? clamp(localTime / currentScene.duration, 0, 1)
      : 0;

  const reelProgress =
    totalDuration > 0
      ? clamp(safeTime / totalDuration, 0, 1)
      : 0;

  return {
    timeline,
    totalDuration,
    currentScene,
    currentSceneIndex,
    sceneProgress,
    reelProgress,
    currentTime: safeTime,
    localTime,
  };
}

export function getTimeFromProgress(
  progress = 0,
  scenes = []
) {
  const totalDuration = getReelDuration(scenes);

  return clamp(progress, 0, 1) * totalDuration;
}

export function getProgressFromTime(
  currentTime = 0,
  scenes = []
) {
  const totalDuration = getReelDuration(scenes);

  if (totalDuration <= 0) return 0;

  return clamp(currentTime / totalDuration, 0, 1);
}

export function getSceneAtProgress(
  scenes = [],
  progress = 0
) {
  const currentTime = getTimeFromProgress(
    progress,
    scenes
  );

  return getTimelineState(scenes, currentTime);
}

export function calculateSceneDurations(
  scenes = [],
  targetDuration = 15
) {
  if (!scenes.length) return [];

  const enabledScenes = getEnabledScenes(scenes);

  if (!enabledScenes.length) return scenes;

  const safeTargetDuration = clamp(
    Number(targetDuration) || 15,
    enabledScenes.length,
    enabledScenes.length * 10
  );

  const normalScenes = enabledScenes.filter(
    (scene) => !scene.isEndScene
  );

  const endScenes = enabledScenes.filter(
    (scene) => scene.isEndScene
  );

  const endDuration = endScenes.length
    ? Math.min(3, safeTargetDuration * 0.22)
    : 0;

  const availableDuration =
    safeTargetDuration - endDuration;

  const regularDuration = normalScenes.length
    ? availableDuration / normalScenes.length
    : 0;

  return scenes.map((scene) => {
    if (scene.enabled === false) return scene;

    if (scene.isEndScene) {
      return {
        ...scene,
        duration: normalizeSceneDuration(endDuration || 3),
      };
    }

    return {
      ...scene,
      duration: normalizeSceneDuration(regularDuration || 3),
    };
  });
}

export function moveScene(
  scenes = [],
  fromIndex,
  toIndex
) {
  const list = [...scenes];

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length
  ) {
    return list;
  }

  const [scene] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, scene);

  return list;
}

export function duplicateScene(
  scenes = [],
  sceneId,
  createId
) {
  const index = scenes.findIndex(
    (scene) => scene.id === sceneId
  );

  if (index === -1) return scenes;

  const original = scenes[index];

  const duplicate = {
    ...original,
    id:
      typeof createId === "function"
        ? createId()
        : `scene-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
    title: original.title
      ? `${original.title} copia`
      : "",
  };

  const nextScenes = [...scenes];
  nextScenes.splice(index + 1, 0, duplicate);

  return nextScenes;
}

export function removeScene(
  scenes = [],
  sceneId
) {
  if (scenes.length <= 1) return scenes;

  return scenes.filter(
    (scene) => scene.id !== sceneId
  );
}

export function formatReelTime(seconds = 0) {
  const safeSeconds = Math.max(
    0,
    Number(seconds) || 0
  );

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(
    safeSeconds % 60
  );

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export function formatDetailedTime(seconds = 0) {
  const safeSeconds = Math.max(
    0,
    Number(seconds) || 0
  );

  const wholeSeconds = Math.floor(safeSeconds);
  const milliseconds = Math.floor(
    (safeSeconds - wholeSeconds) * 100
  );

  return `${formatReelTime(
    wholeSeconds
  )}.${String(milliseconds).padStart(2, "0")}`;
}