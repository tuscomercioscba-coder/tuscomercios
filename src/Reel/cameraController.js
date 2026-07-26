import {
  clamp,
  easeInOutCubic,
  easeOutCubic,
} from "./reelTimeline";

/**
 * TusComercios Studio - Camera Engine
 *
 * Este motor controla:
 * - zoom
 * - paneo
 * - inclinación
 * - movimiento flotante
 * - Ken Burns
 * - intensidad
 * - suavidad
 *
 * Mantiene compatibilidad con los movimientos anteriores:
 * zoomIn, zoomOut, panLeft, panRight, panUp, panDown,
 * diagonal y static.
 */

export const CAMERA_MOVEMENTS = [
  {
    id: "pushIn",
    name: "Push In",
  },
  {
    id: "pushOut",
    name: "Push Out",
  },
  {
    id: "panLeft",
    name: "Paneo izquierda",
  },
  {
    id: "panRight",
    name: "Paneo derecha",
  },
  {
    id: "tiltUp",
    name: "Inclinación arriba",
  },
  {
    id: "tiltDown",
    name: "Inclinación abajo",
  },
  {
    id: "diagonalPush",
    name: "Movimiento diagonal",
  },
  {
    id: "floating",
    name: "Flotante",
  },
  {
    id: "kenBurns",
    name: "Ken Burns Pro",
  },
  {
    id: "static",
    name: "Sin movimiento",
  },
];

export const CAMERA_EASINGS = [
  {
    id: "cinematic",
    name: "Cinemático",
  },
  {
    id: "smooth",
    name: "Suave",
  },
  {
    id: "dynamic",
    name: "Dinámico",
  },
  {
    id: "linear",
    name: "Lineal",
  },
];

/**
 * Devuelve el estado visual de cámara para un instante de la escena.
 *
 * Ejemplo:
 *
 * getCameraStyle({
 *   movement: "pushIn",
 *   progress: 0.5,
 *   intensity: 1,
 *   easing: "cinematic",
 *   seed: 2,
 * })
 */
export function getCameraStyle({
  movement = "pushIn",
  progress = 0,
  intensity = 1,
  easing = "cinematic",
  seed = 0,
} = {}) {
  const normalizedMovement = normalizeMovement(movement);

  const rawProgress = clamp(progress, 0, 1);

  const easedProgress = applyCameraEasing(
    rawProgress,
    easing
  );

  const safeIntensity = clamp(
    Number(intensity) || 1,
    0,
    2
  );

  const variation = getSeedVariation(seed);

  switch (normalizedMovement) {
    case "pushOut":
      return createCameraState({
        scale:
          1.16 -
          0.16 *
            easedProgress *
            safeIntensity,

        x:
          variation.x *
          12 *
          safeIntensity,

        y:
          variation.y *
          10 *
          safeIntensity,

        rotation:
          variation.rotation *
          0.15 *
          safeIntensity,
      });

    case "panLeft":
      return createCameraState({
        scale:
          1.12 +
          variation.scale *
            0.015 *
            safeIntensity,

        x:
          90 -
          180 *
            easedProgress *
            safeIntensity,

        y:
          variation.y *
          18 *
          safeIntensity,

        rotation:
          variation.rotation *
          0.12 *
          safeIntensity,
      });

    case "panRight":
      return createCameraState({
        scale:
          1.12 +
          variation.scale *
            0.015 *
            safeIntensity,

        x:
          -90 +
          180 *
            easedProgress *
            safeIntensity,

        y:
          variation.y *
          18 *
          safeIntensity,

        rotation:
          variation.rotation *
          0.12 *
          safeIntensity,
      });

    case "tiltUp":
      return createCameraState({
        scale:
          1.12 +
          variation.scale *
            0.015 *
            safeIntensity,

        x:
          variation.x *
          14 *
          safeIntensity,

        y:
          95 -
          190 *
            easedProgress *
            safeIntensity,

        rotation:
          variation.rotation *
          0.1 *
          safeIntensity,
      });

    case "tiltDown":
      return createCameraState({
        scale:
          1.12 +
          variation.scale *
            0.015 *
            safeIntensity,

        x:
          variation.x *
          14 *
          safeIntensity,

        y:
          -95 +
          190 *
            easedProgress *
            safeIntensity,

        rotation:
          variation.rotation *
          0.1 *
          safeIntensity,
      });

    case "diagonalPush":
      return createCameraState({
        scale:
          1.03 +
          0.12 *
            easedProgress *
            safeIntensity,

        x:
          -80 +
          160 *
            easedProgress *
            safeIntensity,

        y:
          90 -
          180 *
            easedProgress *
            safeIntensity,

        rotation:
          -0.45 +
          0.9 *
            easedProgress *
            safeIntensity,
      });

    case "floating":
      return getFloatingCamera({
        progress: rawProgress,
        intensity: safeIntensity,
        variation,
      });

    case "kenBurns":
      return getKenBurnsCamera({
        progress: easedProgress,
        intensity: safeIntensity,
        variation,
      });

    case "static":
      return createCameraState({
        scale: 1,
        x: 0,
        y: 0,
        rotation: 0,
      });

    case "pushIn":
    default:
      return createCameraState({
        scale:
          1 +
          0.16 *
            easedProgress *
            safeIntensity,

        x:
          variation.x *
          14 *
          safeIntensity,

        y:
          variation.y *
          12 *
          safeIntensity,

        rotation:
          variation.rotation *
          0.14 *
          safeIntensity,
      });
  }
}

/**
 * Aplica el movimiento de cámara al contexto canvas.
 */
export function applyCameraToContext(
  ctx,
  cameraStyle,
  width,
  height
) {
  const camera =
    cameraStyle ||
    createCameraState();

  const scale =
    Number.isFinite(camera.scale)
      ? camera.scale
      : 1;

  const x =
    Number.isFinite(camera.x)
      ? camera.x
      : 0;

  const y =
    Number.isFinite(camera.y)
      ? camera.y
      : 0;

  const rotation =
    Number.isFinite(camera.rotation)
      ? camera.rotation
      : 0;

  const opacity =
    Number.isFinite(camera.opacity)
      ? camera.opacity
      : 1;

  ctx.globalAlpha *= opacity;

  ctx.translate(
    width / 2 + x,
    height / 2 + y
  );

  ctx.rotate(
    (rotation * Math.PI) / 180
  );

  ctx.scale(
    scale,
    scale
  );

  ctx.translate(
    -width / 2,
    -height / 2
  );
}

/**
 * Animaciones de entrada para textos.
 */
export function getTextAnimation({
  type = "rise",
  progress = 0,
  delay = 0,
  intensity = 1,
} = {}) {
  const safeDelay = clamp(
    Number(delay) || 0,
    0,
    0.95
  );

  const adjustedProgress = clamp(
    (progress - safeDelay) /
      Math.max(
        0.01,
        1 - safeDelay
      ),
    0,
    1
  );

  const eased =
    easeOutCubic(adjustedProgress);

  const safeIntensity = clamp(
    Number(intensity) || 1,
    0.3,
    2
  );

  switch (type) {
    case "fade":
      return {
        opacity: eased,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
      };

    case "slideLeft":
      return {
        opacity: eased,
        x:
          110 *
          (1 - eased) *
          safeIntensity,
        y: 0,
        scale: 1,
        rotation: 0,
      };

    case "slideRight":
      return {
        opacity: eased,
        x:
          -110 *
          (1 - eased) *
          safeIntensity,
        y: 0,
        scale: 1,
        rotation: 0,
      };

    case "zoom":
      return {
        opacity: eased,
        x: 0,
        y: 0,
        scale:
          0.82 +
          0.18 *
            eased,
        rotation: 0,
      };

    case "pop":
      return {
        opacity: eased,
        x: 0,
        y: 0,
        scale:
          0.72 +
          0.28 *
            overshoot(eased),
        rotation: 0,
      };

    case "cinematic":
      return {
        opacity: eased,
        x:
          30 *
          (1 - eased) *
          safeIntensity,
        y:
          45 *
          (1 - eased) *
          safeIntensity,
        scale:
          0.96 +
          0.04 *
            eased,
        rotation:
          -0.35 *
          (1 - eased),
      };

    case "rise":
    default:
      return {
        opacity: eased,
        x: 0,
        y:
          72 *
          (1 - eased) *
          safeIntensity,
        scale: 1,
        rotation: 0,
      };
  }
}

/**
 * Movimiento adicional para capas decorativas.
 */
export function getParallaxOffset(
  progress = 0,
  distance = 60,
  direction = "diagonal"
) {
  const p = clamp(progress, 0, 1);
  const eased = easeInOutCubic(p);
  const safeDistance =
    Number(distance) || 60;

  if (direction === "horizontal") {
    return {
      x:
        -safeDistance / 2 +
        safeDistance * eased,
      y: 0,
    };
  }

  if (direction === "vertical") {
    return {
      x: 0,
      y:
        safeDistance / 2 -
        safeDistance * eased,
    };
  }

  return {
    x:
      -safeDistance / 2 +
      safeDistance * eased,

    y:
      safeDistance / 3 -
      (safeDistance * 2 * eased) / 3,
  };
}

/**
 * Scroll suave reutilizable.
 */
export function getSmoothScroll(
  progress = 0,
  maxScroll = 1000
) {
  const p = clamp(progress, 0, 1);

  return (
    easeInOutCubic(p) *
    maxScroll
  );
}

/**
 * Efecto de respiración de lente.
 * Se puede sumar al scale principal.
 */
export function getLensBreathing(
  progress = 0,
  intensity = 1
) {
  const p = clamp(progress, 0, 1);

  const wave =
    Math.sin(
      p *
        Math.PI *
        2
    );

  return {
    scaleOffset:
      wave *
      0.008 *
      clamp(
        Number(intensity) || 1,
        0,
        2
      ),
  };
}

/**
 * Micro movimiento para evitar una imagen completamente rígida.
 */
export function getMicroMovement(
  progress = 0,
  intensity = 1,
  seed = 0
) {
  const p = clamp(progress, 0, 1);

  const safeIntensity = clamp(
    Number(intensity) || 1,
    0,
    2
  );

  const variation =
    getSeedVariation(seed);

  return {
    x:
      Math.sin(
        p *
          Math.PI *
          2 +
          variation.phase
      ) *
      2.5 *
      safeIntensity,

    y:
      Math.cos(
        p *
          Math.PI *
          1.7 +
          variation.phase
      ) *
      2 *
      safeIntensity,

    rotation:
      Math.sin(
        p *
          Math.PI *
          1.3
      ) *
      0.04 *
      safeIntensity,
  };
}

/**
 * Combina el movimiento principal con respiración y micro movimiento.
 */
export function enhanceCameraStyle({
  cameraStyle,
  progress = 0,
  breathing = 0,
  microMovement = 0,
  seed = 0,
} = {}) {
  const base =
    cameraStyle ||
    createCameraState();

  const breathingState =
    getLensBreathing(
      progress,
      breathing
    );

  const microState =
    getMicroMovement(
      progress,
      microMovement,
      seed
    );

  return {
    ...base,

    scale:
      base.scale +
      breathingState.scaleOffset,

    x:
      base.x +
      microState.x,

    y:
      base.y +
      microState.y,

    rotation:
      base.rotation +
      microState.rotation,
  };
}

function getFloatingCamera({
  progress,
  intensity,
  variation,
}) {
  const waveOne =
    Math.sin(
      progress *
        Math.PI *
        2 +
        variation.phase
    );

  const waveTwo =
    Math.cos(
      progress *
        Math.PI *
        1.4 +
        variation.phase
    );

  return createCameraState({
    scale:
      1.08 +
      waveTwo *
        0.012 *
        intensity,

    x:
      waveOne *
      28 *
      intensity,

    y:
      waveTwo *
      22 *
      intensity,

    rotation:
      waveOne *
      0.22 *
      intensity,
  });
}

function getKenBurnsCamera({
  progress,
  intensity,
  variation,
}) {
  const startScale =
    1.03 +
    variation.scale *
      0.015;

  const endScale =
    1.17 +
    variation.scale *
      0.02;

  const startX =
    -70 *
    variation.directionX;

  const endX =
    70 *
    variation.directionX;

  const startY =
    75 *
    variation.directionY;

  const endY =
    -75 *
    variation.directionY;

  return createCameraState({
    scale:
      startScale +
      (endScale - startScale) *
        progress *
        intensity,

    x:
      startX +
      (endX - startX) *
        progress *
        intensity,

    y:
      startY +
      (endY - startY) *
        progress *
        intensity,

    rotation:
      variation.rotation *
      0.18 *
      progress *
      intensity,
  });
}

function applyCameraEasing(
  progress,
  easing
) {
  switch (easing) {
    case "linear":
      return progress;

    case "dynamic":
      return easeOutCubic(
        progress
      );

    case "smooth":
      return smoothStep(
        progress
      );

    case "cinematic":
    default:
      return cinematicEase(
        progress
      );
  }
}

function cinematicEase(progress) {
  const p = clamp(progress, 0, 1);

  const smooth =
    easeInOutCubic(p);

  return (
    smooth *
      0.88 +
    p *
      0.12
  );
}

function smoothStep(progress) {
  const p = clamp(progress, 0, 1);

  return (
    p *
    p *
    (3 - 2 * p)
  );
}

function overshoot(progress) {
  const p = clamp(progress, 0, 1);

  const tension = 1.70158;

  return (
    1 +
    (tension + 1) *
      Math.pow(
        p - 1,
        3
      ) +
    tension *
      Math.pow(
        p - 1,
        2
      )
  );
}

function createCameraState({
  scale = 1,
  x = 0,
  y = 0,
  rotation = 0,
  opacity = 1,
} = {}) {
  return {
    scale,
    x,
    y,
    rotation,
    opacity,
  };
}

function normalizeMovement(
  movement
) {
  const aliases = {
    zoomIn: "pushIn",
    zoomOut: "pushOut",

    panUp: "tiltUp",
    panDown: "tiltDown",

    diagonal: "diagonalPush",

    kenBurnsPro: "kenBurns",
  };

  return (
    aliases[movement] ||
    movement ||
    "pushIn"
  );
}

function getSeedVariation(seed = 0) {
  const numericSeed =
    Number(seed) || 0;

  const first =
    pseudoRandom(
      numericSeed + 1
    );

  const second =
    pseudoRandom(
      numericSeed + 2
    );

  const third =
    pseudoRandom(
      numericSeed + 3
    );

  return {
    x:
      first *
        2 -
      1,

    y:
      second *
        2 -
      1,

    scale:
      third *
        2 -
      1,

    rotation:
      first *
        2 -
      1,

    phase:
      second *
      Math.PI *
      2,

    directionX:
      first > 0.5
        ? 1
        : -1,

    directionY:
      second > 0.5
        ? 1
        : -1,
  };
}

function pseudoRandom(seed) {
  const value =
    Math.sin(
      seed *
        12.9898
    ) *
    43758.5453;

  return (
    value -
    Math.floor(value)
  );
}