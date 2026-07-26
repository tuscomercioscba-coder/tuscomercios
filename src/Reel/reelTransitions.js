import { clamp, easeInOutCubic, easeOutCubic } from "./reelTimeline";

export function getTransitionState({
  type = "fade",
  progress = 0,
  direction = "in",
}) {
  const normalizedProgress = clamp(progress, 0, 1);

  if (direction === "out") {
    return getExitTransition(type, normalizedProgress);
  }

  return getEnterTransition(type, normalizedProgress);
}

export function getEnterTransition(type, progress) {
  const p = clamp(progress, 0, 1);
  const eased = easeOutCubic(p);

  switch (type) {
    case "blur":
      return {
        opacity: eased,
        scale: 1.06 - 0.06 * eased,
        x: 0,
        y: 0,
        blur: 18 * (1 - eased),
        flashOpacity: 0,
      };

    case "slideLeft":
      return {
        opacity: eased,
        scale: 1,
        x: 160 * (1 - eased),
        y: 0,
        blur: 0,
        flashOpacity: 0,
      };

    case "slideRight":
      return {
        opacity: eased,
        scale: 1,
        x: -160 * (1 - eased),
        y: 0,
        blur: 0,
        flashOpacity: 0,
      };

    case "zoom":
      return {
        opacity: eased,
        scale: 1.18 - 0.18 * eased,
        x: 0,
        y: 0,
        blur: 6 * (1 - eased),
        flashOpacity: 0,
      };

    case "flash":
      return {
        opacity: eased,
        scale: 1.04 - 0.04 * eased,
        x: 0,
        y: 0,
        blur: 0,
        flashOpacity: Math.sin(p * Math.PI) * 0.7,
      };

    case "cut":
      return {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        blur: 0,
        flashOpacity: 0,
      };

    case "fade":
    default:
      return {
        opacity: eased,
        scale: 1,
        x: 0,
        y: 0,
        blur: 0,
        flashOpacity: 0,
      };
  }
}

export function getExitTransition(type, progress) {
  const p = clamp(progress, 0, 1);
  const eased = easeInOutCubic(p);

  switch (type) {
    case "blur":
      return {
        opacity: 1 - eased,
        scale: 1 + 0.05 * eased,
        x: 0,
        y: 0,
        blur: 16 * eased,
        flashOpacity: 0,
      };

    case "slideLeft":
      return {
        opacity: 1 - eased,
        scale: 1,
        x: -180 * eased,
        y: 0,
        blur: 0,
        flashOpacity: 0,
      };

    case "slideRight":
      return {
        opacity: 1 - eased,
        scale: 1,
        x: 180 * eased,
        y: 0,
        blur: 0,
        flashOpacity: 0,
      };

    case "zoom":
      return {
        opacity: 1 - eased,
        scale: 1 + 0.14 * eased,
        x: 0,
        y: 0,
        blur: 4 * eased,
        flashOpacity: 0,
      };

    case "flash":
      return {
        opacity: 1 - eased * 0.22,
        scale: 1 + 0.04 * eased,
        x: 0,
        y: 0,
        blur: 0,
        flashOpacity: Math.sin(p * Math.PI) * 0.85,
      };

    case "cut":
      return {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        blur: 0,
        flashOpacity: 0,
      };

    case "fade":
    default:
      return {
        opacity: 1 - eased,
        scale: 1,
        x: 0,
        y: 0,
        blur: 0,
        flashOpacity: 0,
      };
  }
}

export function getSceneTransition({
  transition = "fade",
  sceneProgress = 0,
  transitionDuration = 0.5,
  sceneDuration = 3,
}) {
  const safeDuration = Math.max(0.1, Number(sceneDuration) || 3);
  const safeTransitionDuration = Math.min(
    safeDuration / 2,
    Math.max(0.05, Number(transitionDuration) || 0.5)
  );

  const transitionRatio = safeTransitionDuration / safeDuration;
  const progress = clamp(sceneProgress, 0, 1);

  if (progress <= transitionRatio) {
    return getTransitionState({
      type: transition,
      progress: progress / transitionRatio,
      direction: "in",
    });
  }

  if (progress >= 1 - transitionRatio) {
    return getTransitionState({
      type: transition,
      progress: (progress - (1 - transitionRatio)) / transitionRatio,
      direction: "out",
    });
  }

  return {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    blur: 0,
    flashOpacity: 0,
  };
}

export function applyTransitionToContext(
  ctx,
  transitionState,
  width,
  height
) {
  const state = transitionState || {};

  const opacity =
    typeof state.opacity === "number" ? state.opacity : 1;

  const scale =
    typeof state.scale === "number" ? state.scale : 1;

  const x =
    typeof state.x === "number" ? state.x : 0;

  const y =
    typeof state.y === "number" ? state.y : 0;

  const blur =
    typeof state.blur === "number" ? state.blur : 0;

  ctx.globalAlpha = opacity;
  ctx.filter = blur > 0 ? `blur(${blur}px)` : "none";

  ctx.translate(width / 2 + x, height / 2 + y);
  ctx.scale(scale, scale);
  ctx.translate(-width / 2, -height / 2);
}

export function drawTransitionFlash(
  ctx,
  transitionState,
  width,
  height
) {
  const flashOpacity = transitionState?.flashOpacity || 0;

  if (flashOpacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = flashOpacity;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}