import {
  createId,
  clamp,
} from "./utils";

export const LAYER_TYPES = {
  TEXT: "text",
  SUBTITLE: "subtitle",
  STICKER: "sticker",
};

export const TEXT_POSITIONS = [
  { id: "top", label: "Arriba" },
  { id: "center", label: "Centro" },
  { id: "bottom", label: "Abajo" },
];

function getNextZIndex(layers = []) {
  return (
    layers.reduce(
      (highest, layer) =>
        Math.max(
          highest,
          Number(layer.zIndex || 0)
        ),
      0
    ) + 1
  );
}

export function createTextLayer({
  type = LAYER_TYPES.TEXT,
  currentTime = 0,
  projectDuration = 10,
  zIndex = 1,
  brandKit = null,
}) {
  const defaultDuration =
    type === LAYER_TYPES.SUBTITLE
      ? 3
      : 4;

  const safeProjectDuration =
    Math.max(
      0.2,
      Number(projectDuration || 0)
    );

  const start = clamp(
    Math.min(
      Number(currentTime || 0),
      Math.max(
        0,
        safeProjectDuration -
          Math.min(
            defaultDuration,
            safeProjectDuration
          )
      )
    ),
    0,
    Math.max(
      0,
      safeProjectDuration - 0.2
    )
  );

  const end = Math.min(
    safeProjectDuration,
    Math.max(
      start + 0.2,
      start + defaultDuration
    )
  );

  const isSubtitle =
    type === LAYER_TYPES.SUBTITLE;

  const primaryFont =
    brandKit?.typography?.primaryFont || "Arial";

  const secondaryFont =
    brandKit?.typography?.secondaryFont || primaryFont;

  const titleColor =
    brandKit?.colors?.text || "#ffffff";

  const subtitleColor =
    brandKit?.colors?.textSoft || "#ffffff";

  const subtitleBackground =
    brandKit?.colors?.primary || "#000000";

  const favoriteAnimation =
    brandKit?.content?.favoriteAnimation || "fade";

  return {
    id: createId(type),
    type,
    name: isSubtitle
      ? "Subtítulo"
      : "Texto",
    text: isSubtitle
      ? "Escribí el subtítulo"
      : "Escribí tu texto",
    start,
    end:
      end > start
        ? end
        : start + 0.2,
    position: isSubtitle
      ? "bottom"
      : "center",
    align: "center",
    fontFamily: isSubtitle
      ? secondaryFont
      : primaryFont,
    fontSize: isSubtitle
      ? 42
      : 64,
    fontWeight: 900,
    color: isSubtitle
      ? subtitleColor
      : titleColor,
    backgroundEnabled:
      isSubtitle,
    backgroundColor:
      subtitleBackground,
    backgroundOpacity:
      isSubtitle ? 0.72 : 0,
    strokeEnabled:
      !isSubtitle,
    strokeColor: "#000000",
    strokeWidth:
      isSubtitle ? 0 : 2,
    shadowEnabled: true,
    shadowColor: "#000000",
    shadowBlur: 16,
    shadowOffsetY: 6,
    textOpacity: 1,
    italic: false,
    underline: false,
    uppercase: false,
    letterSpacing: 0,
    lineHeight: 1.1,
    backgroundPadding: 14,
    backgroundRadius:
      Number(brandKit?.style?.cornerRadius || 14),
    rotation: 0,
    boxWidth: isSubtitle
      ? 86
      : 52,
    boxHeight: isSubtitle
      ? 12
      : 14,
    animation: favoriteAnimation,
    x: 50,
    y: isSubtitle ? 82 : 50,
    hidden: false,
    locked: false,
    zIndex,
  };
}

export function createStickerLayer({
  sticker,
  currentTime = 0,
  projectDuration = 10,
  layers = [],
}) {
  const start = clamp(
    currentTime,
    0,
    Math.max(0, projectDuration)
  );

  const end = clamp(
    start + 4,
    Math.min(
      projectDuration,
      start + 0.2
    ),
    projectDuration
  );

  return {
    id: createId("sticker"),
    type: LAYER_TYPES.STICKER,
    name:
      sticker?.name ||
      "Sticker",
    sticker:
      sticker?.value || "",
    stickerSrc:
      sticker?.src || "",
    stickerId:
      sticker?.id || "",
    start,
    end:
      end > start
        ? end
        : start + 0.2,
    x: 50,
    y: 50,
    stickerSize: 96,
    rotation: 0,
    opacity: 1,
    shadowEnabled: false,
    shadowColor: "#000000",
    shadowBlur: 12,
    animation: "pop",
    hidden: false,
    locked: false,
    zIndex:
      getNextZIndex(layers),
  };
}

export function updateLayer(layers, id, changes) {
  return layers.map((layer) =>
    layer.id === id ? { ...layer, ...changes } : layer
  );
}

export function deleteLayer(layers, id) {
  return layers.filter((layer) => layer.id !== id);
}

export function duplicateLayer(layers, id, projectDuration) {
  const source = layers.find((layer) => layer.id === id);
  if (!source) return layers;

  const duration = source.end - source.start;
  const start = clamp(
    source.start + 0.25,
    0,
    Math.max(0, projectDuration - 0.2)
  );
  const end = clamp(start + duration, start + 0.2, projectDuration);

  return [
    ...layers,
    {
      ...source,
      id: createId(source.type),
      name: `${source.name} copia`,
      x: clamp(Number(source.x ?? 50) + 4, 2, 98),
      y: clamp(Number(source.y ?? 50) + 4, 2, 98),
      start,
      end,
      zIndex: getNextZIndex(layers),
    },
  ];
}

export function getVisibleLayers(layers, currentTime) {
  return layers
    .filter(
      (layer) =>
        !layer.hidden &&
        currentTime >= Number(layer.start || 0) &&
        currentTime <= Number(layer.end || 0)
    )
    .sort(
      (a, b) =>
        Number(a.zIndex || 0) -
        Number(b.zIndex || 0)
    );
}

export function moveLayerForward(layers, id) {
  const ordered = [...layers].sort(
    (a, b) =>
      Number(a.zIndex || 0) -
      Number(b.zIndex || 0)
  );

  const index = ordered.findIndex((layer) => layer.id === id);

  if (index < 0 || index === ordered.length - 1) {
    return layers;
  }

  const current = ordered[index];
  const next = ordered[index + 1];

  return layers.map((layer) => {
    if (layer.id === current.id) {
      return { ...layer, zIndex: Number(next.zIndex || 0) };
    }
    if (layer.id === next.id) {
      return { ...layer, zIndex: Number(current.zIndex || 0) };
    }
    return layer;
  });
}

export function moveLayerBackward(layers, id) {
  const ordered = [...layers].sort(
    (a, b) =>
      Number(a.zIndex || 0) -
      Number(b.zIndex || 0)
  );

  const index = ordered.findIndex((layer) => layer.id === id);

  if (index <= 0) return layers;

  const current = ordered[index];
  const previous = ordered[index - 1];

  return layers.map((layer) => {
    if (layer.id === current.id) {
      return { ...layer, zIndex: Number(previous.zIndex || 0) };
    }
    if (layer.id === previous.id) {
      return { ...layer, zIndex: Number(current.zIndex || 0) };
    }
    return layer;
  });
}

export function bringLayerToFront(layers, id) {
  return updateLayer(layers, id, {
    zIndex: getNextZIndex(layers),
  });
}

export function sendLayerToBack(layers, id) {
  const lowest =
    layers.reduce(
      (lowestValue, layer) =>
        Math.min(
          lowestValue,
          Number(layer.zIndex || 0)
        ),
      0
    ) - 1;

  return updateLayer(layers, id, { zIndex: lowest });
}
