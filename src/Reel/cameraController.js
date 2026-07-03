export function getCameraStyle(progress = 0) {
  const p = Math.max(0, Math.min(1, progress));

  if (p < 0.18) {
    return {
      scale: 1,
      x: 0,
      y: 0,
      opacity: 1,
    };
  }

  if (p < 0.32) {
    return {
      scale: 1.03,
      x: 0,
      y: -10,
      opacity: 1,
    };
  }

  if (p < 0.86) {
    return {
      scale: 1.06,
      x: 0,
      y: -20,
      opacity: 1,
    };
  }

  return {
    scale: 1,
    x: 0,
    y: 0,
    opacity: 1,
  };
}

export function getSmoothScroll(progress = 0, maxScroll = 1000) {
  const p = Math.max(0, Math.min(1, progress));

  const eased =
    p < 0.5
      ? 2 * p * p
      : 1 - Math.pow(-2 * p + 2, 2) / 2;

  return eased * maxScroll;
}