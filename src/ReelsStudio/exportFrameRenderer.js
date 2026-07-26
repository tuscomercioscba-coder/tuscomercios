import { getLayerMotionStyle, getSceneTransitionStyle } from "./motionUtils";
import {
  getTextAnimationState,
} from "./Animation/AnimationEngine";

export const EXPORT_WIDTH = 1080;
export const EXPORT_HEIGHT = 1920;


export function drawExportFrame({
  context,
  mediaElement,
  mediaType = "video",
  secondaryElement = null,
  secondaryType = "video",
  clip,
  clipProgress = 0,
  currentTime,
  layers = [],
  stickerImages = {},
}) {
  context.fillStyle = "#020617";
  context.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

  const sceneCanvas =
    document.createElement("canvas");

  sceneCanvas.width =
    EXPORT_WIDTH;

  sceneCanvas.height =
    EXPORT_HEIGHT;

  const sceneContext =
    sceneCanvas.getContext(
      "2d",
      { alpha: true }
    );

  if (
    clip?.compositionMode ===
    "split-horizontal"
  ) {
    drawMediaInRect(
      sceneContext,
      mediaElement,
      mediaType,
      clip,
      clipProgress,
      0,
      0,
      EXPORT_WIDTH,
      EXPORT_HEIGHT / 2
    );

    drawMediaInRect(
      sceneContext,
      secondaryElement,
      secondaryType,
      {
        ...clip,
        fit: "cover",
      },
      clipProgress,
      0,
      EXPORT_HEIGHT / 2,
      EXPORT_WIDTH,
      EXPORT_HEIGHT / 2
    );
  } else if (
    clip?.compositionMode ===
    "split-vertical"
  ) {
    drawMediaInRect(
      sceneContext,
      mediaElement,
      mediaType,
      clip,
      clipProgress,
      0,
      0,
      EXPORT_WIDTH / 2,
      EXPORT_HEIGHT
    );

    drawMediaInRect(
      sceneContext,
      secondaryElement,
      secondaryType,
      {
        ...clip,
        fit: "cover",
      },
      clipProgress,
      EXPORT_WIDTH / 2,
      0,
      EXPORT_WIDTH / 2,
      EXPORT_HEIGHT
    );
  } else {
    drawMediaInRect(
      sceneContext,
      mediaElement,
      mediaType,
      clip,
      clipProgress,
      0,
      0,
      EXPORT_WIDTH,
      EXPORT_HEIGHT
    );
  }

  layers
    .filter(
      (layer) =>
        !layer.hidden &&
        currentTime >=
        Number(
          layer.start || 0
        ) &&
        currentTime <=
        Number(
          layer.end || 0
        )
    )
    .sort(
      (a, b) =>
        Number(a.zIndex || 0) -
        Number(b.zIndex || 0)
    )
    .forEach((layer) =>
      drawLayer(
        sceneContext,
        layer,
        currentTime,
        stickerImages
      )
    );

  context.drawImage(
    sceneCanvas,
    0,
    0
  );
}

function drawLayer(
  context,
  layer,
  currentTime,
  stickerImages
) {
  const motion =
    getLayerMotionStyle(
      layer,
      currentTime
    );

  if (layer.type === "sticker") {
    drawStickerLayer(
      context,
      layer,
      motion,
      stickerImages
    );

    return;
  }

  drawTextLayer(
    context,
    layer,
    motion,
    currentTime
  );
}

function drawStickerLayer(
  context,
  layer,
  motion,
  stickerImages
) {
  const x =
    (Number(layer.x ?? 50) /
      100) *
    EXPORT_WIDTH;

  const y =
    (Number(layer.y ?? 50) /
      100) *
    EXPORT_HEIGHT;

  const size =
    Number(
      layer.stickerSize || 96
    );

  context.save();

  context.globalAlpha =
    Math.max(
      0,
      Math.min(
        1,
        Number(
          motion.opacity ?? 1
        ) *
          Number(
            layer.opacity ?? 1
          )
      )
    );

  context.translate(
    x +
      Number(
        motion.translateX || 0
      ),
    y +
      Number(
        motion.translateY || 0
      )
  );

  context.scale(
    Number(
      motion.scale || 1
    ),
    Number(
      motion.scale || 1
    )
  );

  context.rotate(
    (Number(
      layer.rotation || 0
    ) *
      Math.PI) /
      180
  );

  context.font =
    `${size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;

  context.textAlign =
    "center";

  context.textBaseline =
    "middle";

  context.shadowColor =
    layer.shadowEnabled
      ? layer.shadowColor ||
        "#000000"
      : "transparent";

  context.shadowBlur =
    layer.shadowEnabled
      ? Number(
          layer.shadowBlur ||
            12
        )
      : 0;

  const stickerImage =
    layer.stickerSrc
      ? stickerImages?.[layer.stickerSrc]
      : null;

  if (stickerImage) {
    context.drawImage(
      stickerImage,
      -size / 2,
      -size / 2,
      size,
      size
    );
  } else {
    context.fillText(
      layer.sticker || "⭐",
      0,
      0
    );
  }

  context.restore();
}


function quoteFontFamily(
  family
) {
  const value =
    String(
      family || "Arial"
    ).trim();

  if (
    value.includes(",")
  ) {
    return value;
  }

  return value.includes(" ")
    ? `"${value}"`
    : value;
}

function measureTextWithSpacing(
  context,
  value,
  letterSpacing
) {
  return (
    context.measureText(
      value
    ).width +
    Math.max(
      0,
      value.length - 1
    ) *
    letterSpacing
  );
}

function drawSpacedText(
  context,
  value,
  x,
  y,
  letterSpacing,
  stroke
) {
  if (
    !letterSpacing ||
    value.length <= 1
  ) {
    if (stroke) {
      context.strokeText(
        value,
        x,
        y
      );
    } else {
      context.fillText(
        value,
        x,
        y
      );
    }

    return;
  }

  const characters =
    [...value];

  const widths =
    characters.map(
      (character) =>
        context.measureText(
          character
        ).width
    );

  const totalWidth =
    widths.reduce(
      (sum, width) =>
        sum + width,
      0
    ) +
    letterSpacing *
    Math.max(
      0,
      characters.length - 1
    );

  let cursorX =
    context.textAlign === "center"
      ? x - totalWidth / 2
      : context.textAlign === "right"
        ? x - totalWidth
        : x;

  const previousAlign =
    context.textAlign;

  context.textAlign = "left";

  characters.forEach(
    (character, index) => {
      if (stroke) {
        context.strokeText(
          character,
          cursorX,
          y
        );
      } else {
        context.fillText(
          character,
          cursorX,
          y
        );
      }

      cursorX +=
        widths[index] +
        letterSpacing;
    }
  );

  context.textAlign =
    previousAlign;
}

function createWrappedLines(
  context,
  value,
  maxWidth,
  letterSpacing
) {
  const lines = [];

  String(value)
    .split(/\r?\n/)
    .forEach(
      (paragraph) => {
        if (!paragraph.trim()) {
          lines.push("");
          return;
        }

        const words =
          paragraph
            .trim()
            .split(/\s+/);

        let currentLine = "";

        words.forEach(
          (word) => {
            const testLine =
              currentLine
                ? `${currentLine} ${word}`
                : word;

            if (
              currentLine &&
              measureTextWithSpacing(
                context,
                testLine,
                letterSpacing
              ) > maxWidth
            ) {
              lines.push(
                currentLine
              );

              currentLine =
                word;
            } else {
              currentLine =
                testLine;
            }
          }
        );

        if (currentLine) {
          lines.push(
            currentLine
          );
        }
      }
    );

  return lines.length
    ? lines
    : [""];
}

function drawTextLayer(
  context,
  layer,
  motion,
  currentTime
) {
  const animation =
    getTextAnimationState({
      layer,
      currentTime,
    });

  const x =
    (Number(layer.x ?? 50) /
      100) *
    EXPORT_WIDTH;

  const y =
    (Number(layer.y ?? 50) /
      100) *
    EXPORT_HEIGHT;

  const boxWidth =
    EXPORT_WIDTH *
    Math.max(
      0.14,
      Math.min(
        0.94,
        Number(
          layer.boxWidth ??
            (layer.type ===
            "subtitle"
              ? 86
              : 52)
        ) / 100
      )
    );

  const boxHeight =
    EXPORT_HEIGHT *
    Math.max(
      0.03,
      Math.min(
        0.8,
        Number(
          layer.boxHeight ??
            (layer.type ===
            "subtitle"
              ? 12
              : 14)
        ) / 100
      )
    );

  const fontSize =
    Number(
      layer.fontSize || 64
    );

  const padding =
    layer.backgroundEnabled
      ? Number(
          layer.backgroundPadding ||
            14
        )
      : 0;

  const contentWidth =
    Math.max(
      20,
      boxWidth -
        padding * 2
    );

  const letterSpacing =
    Number(
      layer.letterSpacing || 0
    );

  const lineHeight =
    fontSize *
    Number(
      layer.lineHeight ||
        1.1
    );

  const animatedText =
    String(
      animation.visibleText ??
        layer.text ??
        ""
    );

  const displayValue =
    layer.uppercase
      ? animatedText.toUpperCase()
      : animatedText;

  context.save();

  context.globalAlpha =
    Math.max(
      0,
      Math.min(
        1,
        Number(
          motion.opacity ?? 1
        ) *
          Number(
            animation.opacity ?? 1
          ) *
          Number(
            layer.textOpacity ?? 1
          )
      )
    );

  context.translate(
    x +
      Number(
        motion.translateX || 0
      ) +
      Number(
        animation.translateX || 0
      ),
    y +
      Number(
        motion.translateY || 0
      ) +
      Number(
        animation.translateY || 0
      )
  );

  const combinedScale =
    Number(
      motion.scale || 1
    ) *
    Number(
      animation.scale || 1
    );

  context.scale(
    combinedScale,
    combinedScale
  );

  context.rotate(
    ((Number(
      layer.rotation || 0
    ) +
      Number(
        animation.rotate || 0
      )) *
      Math.PI) /
      180
  );

  context.font = `${
    layer.italic
      ? "italic "
      : ""
  }${Number(
    layer.fontWeight || 900
  )} ${fontSize}px ${quoteFontFamily(
    layer.fontFamily ||
      "Arial"
  )}`;

  context.textBaseline =
    "middle";

  context.textAlign =
    layer.align ||
    "center";

  context.fillStyle =
    layer.color ||
    "#ffffff";

  context.shadowColor =
    layer.shadowEnabled
      ? layer.shadowColor ||
        "#000000"
      : "transparent";

  context.shadowBlur =
    layer.shadowEnabled
      ? Number(
          layer.shadowBlur ||
            16
        )
      : 0;

  context.shadowOffsetX = 0;

  context.shadowOffsetY =
    layer.shadowEnabled
      ? Number(
          layer.shadowOffsetY ||
            6
        )
      : 0;

  if (layer.backgroundEnabled) {
    context.save();

    context.shadowColor =
      "transparent";

    context.fillStyle =
      rgba(
        layer.backgroundColor ||
          "#000000",
        layer.backgroundOpacity ??
          0.72
      );

    context.beginPath();

    context.roundRect(
      -boxWidth / 2,
      -boxHeight / 2,
      boxWidth,
      boxHeight,
      Math.max(
        0,
        Number(
          layer.backgroundRadius ||
            14
        )
      )
    );

    context.fill();
    context.restore();

    context.fillStyle =
      layer.color ||
      "#ffffff";
  }

  const lines =
    createWrappedLines(
      context,
      displayValue,
      contentWidth,
      letterSpacing
    );

  const visibleLines =
    lines.slice(
      0,
      Math.max(
        1,
        Math.floor(
          (boxHeight -
            padding * 2) /
            Math.max(
              1,
              lineHeight
            )
        )
      )
    );

  const totalTextHeight =
    visibleLines.length *
    lineHeight;

  const startY =
    -totalTextHeight / 2 +
    lineHeight / 2;

  const textX =
    context.textAlign === "left"
      ? -contentWidth / 2
      : context.textAlign === "right"
        ? contentWidth / 2
        : 0;

  visibleLines.forEach(
    (line, index) => {
      const lineY =
        startY +
        index * lineHeight;

      if (
        layer.strokeEnabled &&
        Number(
          layer.strokeWidth || 0
        ) > 0
      ) {
        context.strokeStyle =
          layer.strokeColor ||
          "#000000";

        context.lineWidth =
          Number(
            layer.strokeWidth || 2
          );

        context.lineJoin =
          "round";

        context.miterLimit = 2;

        drawSpacedText(
          context,
          line,
          textX,
          lineY,
          letterSpacing,
          true
        );
      }

      drawSpacedText(
        context,
        line,
        textX,
        lineY,
        letterSpacing,
        false
      );

      if (
        layer.underline &&
        line
      ) {
        const width =
          measureTextWithSpacing(
            context,
            line,
            letterSpacing
          );

        const underlineX =
          context.textAlign === "left"
            ? textX
            : context.textAlign === "right"
              ? textX - width
              : textX - width / 2;

        context.save();
        context.shadowColor =
          "transparent";
        context.strokeStyle =
          layer.color ||
          "#ffffff";
        context.lineWidth =
          Math.max(
            1,
            fontSize * 0.05
          );
        context.beginPath();
        context.moveTo(
          underlineX,
          lineY +
            fontSize * 0.55
        );
        context.lineTo(
          underlineX + width,
          lineY +
            fontSize * 0.55
        );
        context.stroke();
        context.restore();
      }
    }
  );

  context.restore();
}

function rgba(hex, opacity) {
  const clean = String(hex).replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean.padEnd(6, "0").slice(0, 6);
  const value = parseInt(full, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${Math.max(0, Math.min(1, Number(opacity)))})`;
}



function drawMediaInRect(
  context,
  media,
  mediaType,
  clip,
  progress,
  x,
  y,
  width,
  height
) {
  if (!media) {
    context.fillStyle =
      "#0f172a";

    context.fillRect(
      x,
      y,
      width,
      height
    );

    return;
  }

  const sw =
    mediaType === "image"
      ? media.naturalWidth
      : media.videoWidth;

  const sh =
    mediaType === "image"
      ? media.naturalHeight
      : media.videoHeight;

  if (!sw || !sh) return;

  const fit =
    clip?.fit || "cover";

  let scale =
    fit === "contain"
      ? Math.min(
        width / sw,
        height / sh
      )
      : Math.max(
        width / sw,
        height / sh
      );

  let panX = 0;

  if (mediaType === "image") {
    switch (
    clip?.photoMotion
    ) {
      case "zoom-in":
        scale *=
          1 + progress * 0.12;
        break;

      case "zoom-out":
        scale *=
          1.12 -
          progress * 0.12;
        break;

      case "pan-left":
        scale *= 1.12;
        panX =
          (0.05 -
            progress * 0.1) *
          width;
        break;

      case "pan-right":
        scale *= 1.12;
        panX =
          (-0.05 +
            progress * 0.1) *
          width;
        break;

      default:
        break;
    }
  }

  scale *=
    Math.max(
      0.2,
      Number(
        clip?.mediaScale ??
        100
      ) / 100
    );

  const dw = sw * scale;
  const dh = sh * scale;

  const centerX =
    x +
    (Number(
      clip?.mediaX ?? 50
    ) / 100) *
    width;

  const centerY =
    y +
    (Number(
      clip?.mediaY ?? 50
    ) / 100) *
    height;

  context.save();

  context.globalAlpha =
    Math.max(
      0,
      Math.min(
        1,
        Number(
          clip?.mediaOpacity ??
          100
        ) / 100
      )
    );

  context.beginPath();
  context.rect(
    x,
    y,
    width,
    height
  );
  context.clip();

  context.translate(
    centerX + panX,
    centerY
  );

  context.rotate(
    (Number(
      clip?.mediaRotation ||
      0
    ) *
      Math.PI) /
    180
  );

  context.drawImage(
    media,
    -dw / 2,
    -dh / 2,
    dw,
    dh
  );

  context.restore();
}
