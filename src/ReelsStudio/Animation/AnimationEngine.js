export const TEXT_ANIMATIONS = [
  { id: "none", label: "Sin animación" },
  { id: "fade", label: "Aparecer suave" },
  { id: "zoom", label: "Zoom" },
  { id: "zoom-fade", label: "Zoom + aparecer" },
  { id: "slide-up", label: "Desde abajo" },
  { id: "slide-down", label: "Desde arriba" },
  { id: "slide-left", label: "Desde la derecha" },
  { id: "slide-right", label: "Desde la izquierda" },
  { id: "bounce", label: "Rebote" },
  { id: "typewriter", label: "Máquina de escribir" },
  { id: "rotate", label: "Giro suave" },
  { id: "pop", label: "Pop" },
  { id: "pulse", label: "Pulso" },
  { id: "elastic", label: "Elástico" },
  { id: "drop", label: "Caída" },
  { id: "rise", label: "Ascenso" },
  { id: "whip-left", label: "Latigazo izquierdo" },
  { id: "whip-right", label: "Latigazo derecho" },
  { id: "swing", label: "Balanceo" },
  { id: "flip", label: "Volteo" },
  { id: "shrink", label: "Contraer" },
];

function clamp(value, min = 0, max = 1) {
  return Math.max(
    min,
    Math.min(max, Number(value || 0))
  );
}

function easeOutCubic(value) {
  const progress = clamp(value);
  return 1 - Math.pow(1 - progress, 3);
}

function easeOutBack(value) {
  const progress = clamp(value);
  const strength = 1.70158;
  const shifted = progress - 1;

  return (
    1 +
    (strength + 1) *
      Math.pow(shifted, 3) +
    strength *
      Math.pow(shifted, 2)
  );
}

function easeOutBounce(value) {
  const progress = clamp(value);
  const n1 = 7.5625;
  const d1 = 2.75;

  if (progress < 1 / d1) {
    return n1 * progress * progress;
  }

  if (progress < 2 / d1) {
    const shifted =
      progress - 1.5 / d1;

    return (
      n1 *
        shifted *
        shifted +
      0.75
    );
  }

  if (progress < 2.5 / d1) {
    const shifted =
      progress - 2.25 / d1;

    return (
      n1 *
        shifted *
        shifted +
      0.9375
    );
  }

  const shifted =
    progress - 2.625 / d1;

  return (
    n1 *
      shifted *
      shifted +
    0.984375
  );
}

export function getLayerAnimationProgress({
  layer,
  currentTime,
}) {
  const start =
    Number(layer?.start || 0);

  const delay =
    Math.max(
      0,
      Number(
        layer?.animationDelay || 0
      )
    );

  const duration =
    Math.max(
      0.1,
      Number(
        layer?.animationDuration ||
          0.8
      )
    );

  const animationStart =
    start + delay;

  return clamp(
    (Number(currentTime || 0) -
      animationStart) /
      duration
  );
}

export function getTextAnimationState({
  layer,
  currentTime,
}) {
  const animation =
    layer?.animation || "none";

  const progress =
    getLayerAnimationProgress({
      layer,
      currentTime,
    });

  const eased =
    easeOutCubic(progress);

  const base = {
    opacity: 1,
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0,
    visibleText:
      String(layer?.text || ""),
  };

  if (animation === "none") {
    return base;
  }

  if (animation === "fade") {
    return {
      ...base,
      opacity: eased,
    };
  }

  if (animation === "zoom") {
    return {
      ...base,
      scale:
        0.65 +
        eased * 0.35,
    };
  }

  if (
    animation === "zoom-fade"
  ) {
    return {
      ...base,
      opacity: eased,
      scale:
        0.65 +
        eased * 0.35,
    };
  }

  if (
    animation === "slide-up"
  ) {
    return {
      ...base,
      opacity: eased,
      translateY:
        (1 - eased) * 35,
    };
  }

  if (
    animation === "slide-down"
  ) {
    return {
      ...base,
      opacity: eased,
      translateY:
        (1 - eased) * -35,
    };
  }

  if (
    animation === "slide-left"
  ) {
    return {
      ...base,
      opacity: eased,
      translateX:
        (1 - eased) * 35,
    };
  }

  if (
    animation === "slide-right"
  ) {
    return {
      ...base,
      opacity: eased,
      translateX:
        (1 - eased) * -35,
    };
  }

  if (animation === "bounce") {
    return {
      ...base,
      opacity: progress > 0 ? 1 : 0,
      scale:
        0.65 +
        easeOutBounce(progress) *
          0.35,
    };
  }

  if (animation === "rotate") {
    return {
      ...base,
      opacity: eased,
      rotate:
        (1 - eased) * -18,
      scale:
        0.85 +
        eased * 0.15,
    };
  }

  if (animation === "pop") {
    const pop =
      easeOutBack(progress);

    return {
      ...base,
      opacity: progress > 0 ? 1 : 0,
      scale:
        0.5 +
        pop * 0.5,
    };
  }

  if (animation === "pulse") {
    const pulse =
      progress >= 1
        ? 1
        : 1 +
          Math.sin(
            progress *
              Math.PI *
              3
          ) *
            0.08;

    return {
      ...base,
      opacity: eased,
      scale: pulse,
    };
  }

  if (animation === "elastic") {
    const elastic = easeOutBack(progress);
    return {
      ...base,
      opacity: progress > 0 ? 1 : 0,
      scale: 0.35 + elastic * 0.65,
      rotate: (1 - eased) * -7,
    };
  }

  if (animation === "drop" || animation === "rise") {
    return {
      ...base,
      opacity: eased,
      translateY:
        (1 - easeOutBounce(progress)) *
        (animation === "drop" ? -85 : 85),
      rotate: (1 - eased) * (animation === "drop" ? -8 : 8),
    };
  }

  if (animation === "whip-left" || animation === "whip-right") {
    const direction = animation === "whip-left" ? -1 : 1;
    return {
      ...base,
      opacity: eased,
      translateX: (1 - eased) * 95 * direction,
      rotate: (1 - eased) * 16 * direction,
    };
  }

  if (animation === "swing") {
    return {
      ...base,
      opacity: eased,
      rotate:
        Math.sin(progress * Math.PI * 4) *
        (1 - progress) *
        18,
    };
  }

  if (animation === "flip") {
    return {
      ...base,
      opacity: eased,
      rotate: (1 - eased) * 88,
      scale: 0.7 + eased * 0.3,
    };
  }

  if (animation === "shrink") {
    return {
      ...base,
      opacity: eased,
      scale: 1.55 - eased * 0.55,
    };
  }

  if (
    animation === "typewriter"
  ) {
    const text =
      String(layer?.text || "");

    const visibleLength =
      Math.ceil(
        text.length *
          progress
      );

    return {
      ...base,
      opacity:
        progress > 0 ? 1 : 0,
      visibleText:
        text.slice(
          0,
          visibleLength
        ),
    };
  }

  return base;
}
