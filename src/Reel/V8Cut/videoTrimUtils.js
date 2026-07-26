export function normalizeTrim(scene = {}) {
  const sourceDuration = Number(scene.sourceDuration || 0);
  const trimStart = Math.max(0, Number(scene.trimStart || 0));
  const fallbackEnd = sourceDuration > 0 ? sourceDuration : trimStart + Number(scene.duration || 3);
  const trimEnd = Math.max(trimStart + 0.1, Number(scene.trimEnd || fallbackEnd));
  return { sourceDuration, trimStart, trimEnd, duration: Math.max(0.1, trimEnd - trimStart) };
}

export function splitSceneAt(scene, localTime) {
  const trim = normalizeTrim(scene);
  const splitPoint = Math.max(trim.trimStart + 0.1, Math.min(trim.trimEnd - 0.1, trim.trimStart + Number(localTime || 0)));
  const base = { ...scene, sourceDuration: trim.sourceDuration };
  return [
    { ...base, id: `${scene.id}-a-${Date.now()}`, trimStart: trim.trimStart, trimEnd: splitPoint, duration: splitPoint - trim.trimStart },
    { ...base, id: `${scene.id}-b-${Date.now()}`, trimStart: splitPoint, trimEnd: trim.trimEnd, duration: trim.trimEnd - splitPoint },
  ];
}

export function sceneTimeToSourceTime(scene, sceneProgress = 0) {
  const trim = normalizeTrim(scene);
  return trim.trimStart + Math.max(0, Math.min(1, sceneProgress)) * (trim.trimEnd - trim.trimStart);
}
