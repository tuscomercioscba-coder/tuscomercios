export const ENTRANCE_ANIMATIONS = [
  { id: "none", label: "Sin entrada" },
  { id: "fade", label: "Fade" },
  { id: "slide-up", label: "Subir" },
  { id: "slide-left", label: "Desde izquierda" },
  { id: "slide-right", label: "Desde derecha" },
  { id: "zoom", label: "Zoom" },
  { id: "pop", label: "Pop" },
];

export const LOOP_ANIMATIONS = [
  { id: "none", label: "Quieto" },
  { id: "breathe", label: "Respirar" },
  { id: "float", label: "Flotar" },
  { id: "pulse", label: "Pulso" },
];

export const EXIT_ANIMATIONS = [
  { id: "none", label: "Sin salida" },
  { id: "fade", label: "Fade" },
  { id: "slide-down", label: "Bajar" },
  { id: "slide-left", label: "Hacia izquierda" },
  { id: "slide-right", label: "Hacia derecha" },
  { id: "zoom", label: "Zoom" },
];

export const SCENE_TRANSITIONS = [
  {
    id: "cut",
    label: "Corte directo",
    description: "Cambio inmediato.",
    duration: 0,
  },
  {
    id: "fade",
    label: "Fundido",
    description: "Desvanece suavemente.",
    duration: 0.45,
  },
  {
    id: "zoom",
    label: "Zoom",
    description: "Acerca antes del cambio.",
    duration: 0.45,
  },
  {
    id: "push-left",
    label: "Empujar izquierda",
    description: "Sale hacia la izquierda.",
    duration: 0.45,
  },
  {
    id: "push-right",
    label: "Empujar derecha",
    description: "Sale hacia la derecha.",
    duration: 0.45,
  },
  {
    id: "push-up",
    label: "Empujar arriba",
    description: "Sale hacia arriba.",
    duration: 0.45,
  },
  {
    id: "push-down",
    label: "Empujar abajo",
    description: "Sale hacia abajo.",
    duration: 0.45,
  },
  {
    id: "wipe-left",
    label: "Barrido izquierda",
    description: "La imagen se cierra lateralmente.",
    duration: 0.5,
  },
  {
    id: "wipe-up",
    label: "Barrido arriba",
    description: "La imagen se cierra verticalmente.",
    duration: 0.5,
  },
  {
    id: "spin",
    label: "Giro",
    description: "Giro breve con zoom.",
    duration: 0.55,
  },
  {
    id: "blur",
    label: "Desenfoque",
    description: "Desenfoque progresivo.",
    duration: 0.5,
  },
  {
    id: "flash",
    label: "Flash",
    description: "Destello blanco rápido.",
    duration: 0.25,
  },
  {
    id: "black-flash",
    label: "Flash negro",
    description: "Golpe oscuro cinematográfico.",
    duration: 0.25,
  },
  {
    id: "shake",
    label: "Sacudida",
    description: "Movimiento de impacto.",
    duration: 0.4,
  },
  {
    id: "diagonal",
    label: "Diagonal",
    description: "Desplazamiento diagonal dinámico.",
    duration: 0.45,
  },
  {
    id: "rotate-left",
    label: "Giro izquierdo",
    description: "Giro cinematográfico hacia la izquierda.",
    duration: 0.5,
  },
  {
    id: "rotate-right",
    label: "Giro derecho",
    description: "Giro cinematográfico hacia la derecha.",
    duration: 0.5,
  },
  {
    id: "shrink",
    label: "Contraer",
    description: "Aleja la escena antes del cambio.",
    duration: 0.45,
  },
  {
    id: "elastic",
    label: "Elástica",
    description: "Movimiento flexible de salida.",
    duration: 0.5,
  },
  {
    id: "glitch",
    label: "Glitch",
    description: "Impacto digital rápido.",
    duration: 0.3,
  },
];

export function ensureMotionLayer(layer = {}) {
  return {
    ...layer,
    entranceAnimation: layer.entranceAnimation || "fade",
    entranceDuration: Number(layer.entranceDuration ?? 0.35),
    loopAnimation: layer.loopAnimation || "none",
    exitAnimation: layer.exitAnimation || "fade",
    exitDuration: Number(layer.exitDuration ?? 0.3),
  };
}

export function ensureClipTransition(clip = {}) {
  return {
    ...clip,
    transition: clip.transition || "cut",
    transitionDuration: Number(
      clip.transitionDuration ??
        (clip.transition === "cut" ? 0 : 0.45)
    ),
  };
}

export function getLayerMotionStyle(layer, currentTime) {
  const safe = ensureMotionLayer(layer);
  const start = Number(safe.start || 0);
  const end = Number(safe.end || start + 0.1);
  const local = currentTime - start;
  const total = Math.max(0.1, end - start);

  const entranceDuration = Math.min(
    Math.max(0.05, safe.entranceDuration),
    total / 2
  );

  const exitDuration = Math.min(
    Math.max(0.05, safe.exitDuration),
    total / 2
  );

  const entranceProgress = Math.max(
    0,
    Math.min(1, local / entranceDuration)
  );

  const exitProgress = Math.max(
    0,
    Math.min(1, (end - currentTime) / exitDuration)
  );

  let opacity = 1;
  let translateX = 0;
  let translateY = 0;
  let scale = 1;

  if (local < entranceDuration) {
    const p = easeOut(entranceProgress);

    switch (safe.entranceAnimation) {
      case "fade":
        opacity = p;
        break;
      case "slide-up":
        opacity = p;
        translateY = (1 - p) * 55;
        break;
      case "slide-left":
        opacity = p;
        translateX = (1 - p) * -85;
        break;
      case "slide-right":
        opacity = p;
        translateX = (1 - p) * 85;
        break;
      case "zoom":
        opacity = p;
        scale = 0.72 + p * 0.28;
        break;
      case "pop":
        opacity = p;
        scale = p < 0.75 ? 0.6 + p * 0.65 : 1.08 - (p - 0.75) * 0.32;
        break;
      default:
        break;
    }
  }

  if (end - currentTime < exitDuration) {
    const p = easeIn(exitProgress);

    switch (safe.exitAnimation) {
      case "fade":
        opacity *= p;
        break;
      case "slide-down":
        opacity *= p;
        translateY += (1 - p) * 55;
        break;
      case "slide-left":
        opacity *= p;
        translateX += (1 - p) * -85;
        break;
      case "slide-right":
        opacity *= p;
        translateX += (1 - p) * 85;
        break;
      case "zoom":
        opacity *= p;
        scale *= 0.75 + p * 0.25;
        break;
      default:
        break;
    }
  }

  const loopTime = Math.max(0, local);

  switch (safe.loopAnimation) {
    case "breathe":
      scale *= 1 + Math.sin(loopTime * 2.6) * 0.025;
      break;
    case "float":
      translateY += Math.sin(loopTime * 2.2) * 7;
      break;
    case "pulse":
      opacity *= 0.88 + (Math.sin(loopTime * 4) + 1) * 0.06;
      break;
    default:
      break;
  }

  return {
    opacity,
    translateX,
    translateY,
    scale,
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
  };
}


export function getSceneTransitionStyle(
  clip,
  clipProgress
) {
  const transition =
    clip?.transition || "cut";

  const duration =
    Math.max(
      0,
      Number(
        clip?.transitionDuration || 0
      )
    );

  const clipDuration =
    Math.max(
      0.1,
      Number(clip?.end || 0) -
        Number(clip?.start || 0)
    );

  const base = {
    active: false,
    progress: 0,
    opacity: 1,
    scale: 1,
    translateX: 0,
    translateY: 0,
    rotate: 0,
    blur: 0,
    clipRight: 0,
    clipBottom: 0,
    flashOpacity: 0,
    blackFlashOpacity: 0,
    darkOpacity: 0,
  };

  if (
    transition === "cut" ||
    duration <= 0
  ) {
    return base;
  }

  const fraction =
    Math.min(
      0.9,
      duration / clipDuration
    );

  const start =
    1 - fraction;

  if (clipProgress < start) {
    return base;
  }

  const progress =
    Math.max(
      0,
      Math.min(
        1,
        (clipProgress - start) /
          Math.max(0.001, fraction)
      )
    );

  const eased =
    1 -
    Math.pow(
      1 - progress,
      3
    );

  const wave =
    Math.sin(
      progress * Math.PI * 5
    );

  switch (transition) {
    case "fade":
      return {
        ...base,
        active: true,
        progress,
        opacity: 1 - eased,
        darkOpacity: eased * 0.72,
      };

    case "zoom":
      return {
        ...base,
        active: true,
        progress,
        opacity: 1 - eased * 0.3,
        scale: 1 + eased * 0.2,
        darkOpacity: eased * 0.14,
      };

    case "push-left":
      return {
        ...base,
        active: true,
        progress,
        translateX: -eased * 100,
      };

    case "push-right":
      return {
        ...base,
        active: true,
        progress,
        translateX: eased * 100,
      };

    case "push-up":
      return {
        ...base,
        active: true,
        progress,
        translateY: -eased * 100,
      };

    case "push-down":
      return {
        ...base,
        active: true,
        progress,
        translateY: eased * 100,
      };

    case "wipe-left":
      return {
        ...base,
        active: true,
        progress,
        clipRight: eased * 100,
      };

    case "wipe-up":
      return {
        ...base,
        active: true,
        progress,
        clipBottom: eased * 100,
      };

    case "spin":
      return {
        ...base,
        active: true,
        progress,
        rotate: eased * 18,
        scale: 1 + eased * 0.16,
        opacity: 1 - eased * 0.3,
      };

    case "blur":
      return {
        ...base,
        active: true,
        progress,
        blur: eased * 18,
        opacity: 1 - eased * 0.25,
      };

    case "flash": {
      const flash =
        progress < 0.5
          ? progress * 2
          : (1 - progress) * 2;

      return {
        ...base,
        active: true,
        progress,
        scale: 1 + eased * 0.04,
        flashOpacity: Math.max(0, flash),
      };
    }

    case "black-flash": {
      const flash =
        progress < 0.5
          ? progress * 2
          : (1 - progress) * 2;

      return {
        ...base,
        active: true,
        progress,
        blackFlashOpacity:
          Math.max(0, flash),
      };
    }

    case "shake":
      return {
        ...base,
        active: true,
        progress,
        translateX:
          wave * (1 - progress) * 5,
        translateY:
          Math.cos(
            progress * Math.PI * 7
          ) *
          (1 - progress) *
          2.5,
        rotate:
          wave * (1 - progress) * 1.5,
        scale:
          1 + (1 - progress) * 0.025,
      };

    case "diagonal":
      return {
        ...base,
        active: true,
        progress,
        translateX: -eased * 88,
        translateY: eased * 88,
        opacity: 1 - eased * 0.2,
      };

    case "rotate-left":
    case "rotate-right": {
      const direction = transition === "rotate-left" ? -1 : 1;
      return {
        ...base,
        active: true,
        progress,
        rotate: eased * 24 * direction,
        scale: 1 - eased * 0.16,
        opacity: 1 - eased * 0.28,
      };
    }

    case "shrink":
      return {
        ...base,
        active: true,
        progress,
        scale: 1 - eased * 0.42,
        opacity: 1 - eased * 0.45,
        darkOpacity: eased * 0.22,
      };

    case "elastic":
      return {
        ...base,
        active: true,
        progress,
        translateX: -eased * 100 + wave * (1 - progress) * 12,
        scale: 1 + Math.abs(wave) * (1 - progress) * 0.05,
      };

    case "glitch":
      return {
        ...base,
        active: true,
        progress,
        translateX: wave * (1 - progress) * 15,
        translateY: Math.cos(progress * Math.PI * 7) * (1 - progress) * 7,
        flashOpacity: Math.abs(wave) * 0.28,
        opacity: 1 - eased * 0.18,
      };

    default:
      return base;
  }
}

function easeOut(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeIn(value) {
  return value * value;
}
