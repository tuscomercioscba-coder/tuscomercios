export const FRAME_PRESETS = [
  {
    id: "center",
    label: "Centro",
    focalX: 50,
    focalY: 50,
  },
  {
    id: "top",
    label: "Arriba",
    focalX: 50,
    focalY: 18,
  },
  {
    id: "bottom",
    label: "Abajo",
    focalX: 50,
    focalY: 82,
  },
  {
    id: "left",
    label: "Izquierda",
    focalX: 18,
    focalY: 50,
  },
  {
    id: "right",
    label: "Derecha",
    focalX: 82,
    focalY: 50,
  },
  {
    id: "top-left",
    label: "Arriba izquierda",
    focalX: 18,
    focalY: 18,
  },
  {
    id: "top-right",
    label: "Arriba derecha",
    focalX: 82,
    focalY: 18,
  },
  {
    id: "bottom-left",
    label: "Abajo izquierda",
    focalX: 18,
    focalY: 82,
  },
  {
    id: "bottom-right",
    label: "Abajo derecha",
    focalX: 82,
    focalY: 82,
  },
];

export function getDefaultFraming(scene = {}) {
  return {
    mediaFit: scene.mediaFit || "cover",
    mediaZoom: Number(scene.mediaZoom || 1),
    mediaFocalX: Number(scene.mediaFocalX ?? 50),
    mediaFocalY: Number(scene.mediaFocalY ?? 50),
    mediaRotation: Number(scene.mediaRotation || 0),
    backgroundBlur: Number(scene.backgroundBlur ?? 24),
    backgroundOpacity: Number(scene.backgroundOpacity ?? 0.58),
  };
}

export function getAutomaticFraming({
  mediaWidth,
  mediaHeight,
  sceneIndex = 0,
}) {
  const ratio =
    mediaWidth > 0 && mediaHeight > 0
      ? mediaWidth / mediaHeight
      : 1;

  if (ratio > 1.35) {
    const horizontalPresets = [
      { mediaFocalX: 24, mediaFocalY: 50 },
      { mediaFocalX: 50, mediaFocalY: 50 },
      { mediaFocalX: 76, mediaFocalY: 50 },
    ];

    return {
      mediaFit: "cover",
      mediaZoom: 1,
      backgroundBlur: 24,
      ...horizontalPresets[
        sceneIndex % horizontalPresets.length
      ],
    };
  }

  if (ratio < 0.75) {
    return {
      mediaFit: "cover",
      mediaZoom: 1,
      mediaFocalX: 50,
      mediaFocalY: 50,
      backgroundBlur: 20,
    };
  }

  return {
    mediaFit: "cover",
    mediaZoom: 1,
    mediaFocalX: 50,
    mediaFocalY: 50,
    backgroundBlur: 22,
  };
}
