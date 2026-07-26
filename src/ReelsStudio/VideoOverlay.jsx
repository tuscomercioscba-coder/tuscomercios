import {
  useEffect,
  useRef,
  useState,
} from "react";

import { getVisibleLayers } from "./layerUtils";
import { getLayerMotionStyle } from "./motionUtils";
import {
  getTextAnimationState,
} from "./Animation/AnimationEngine";
import { clamp } from "./utils";

const SNAP_DISTANCE = 1.8;
const DESIGN_WIDTH = 1080;

export default function VideoOverlay({
  layers,
  currentTime,
  selectedLayerId,
  onSelect,
  onChange,
  onDeselect,
  snapEnabled = true,
  showSafeArea = false,
  showRulers = false,
  safePreset = "instagram",
}) {
  const canvasRef = useRef(null);
  const textEditorRef = useRef(null);

  const [editingTextId, setEditingTextId] =
    useState("");

  const [textDraft, setTextDraft] =
    useState("");

  const [canvasWidth, setCanvasWidth] =
    useState(270);

  const [guides, setGuides] =
    useState({
      vertical: [],
      horizontal: [],
    });

  const visible = getVisibleLayers(
    layers,
    currentTime
  );

  useEffect(() => {
    const element =
      canvasRef.current;

    if (!element) return;

    const update = () =>
      setCanvasWidth(
        Math.max(
          1,
          element.getBoundingClientRect()
            .width
        )
      );

    update();

    const observer =
      new ResizeObserver(update);

    observer.observe(element);

    return () =>
      observer.disconnect();
  }, []);

  useEffect(() => {
    if (!editingTextId) return;

    window.setTimeout(() => {
      textEditorRef.current?.focus();
      textEditorRef.current?.select();
    }, 20);
  }, [editingTextId]);

  const previewScale =
    canvasWidth / DESIGN_WIDTH;

  const safeArea =
    getSafeArea(safePreset);

  function startTextEditing(layer) {
    if (
      !layer ||
      layer.locked ||
      layer.type === "sticker"
    ) {
      return;
    }

    onSelect?.(layer.id);
    setTextDraft(
      String(layer.text || "")
    );
    setEditingTextId(layer.id);
  }

  function finishTextEditing() {
    if (!editingTextId) return;

    onChange?.(editingTextId, {
      text:
        textDraft.trim() ||
        "Nuevo texto",
    });

    setEditingTextId("");
    setTextDraft("");
  }

  function cancelTextEditing() {
    setEditingTextId("");
    setTextDraft("");
  }

  function beginPointerAction(
    event,
    cursor,
    onMove
  ) {
    event.preventDefault();
    event.stopPropagation();

    document.body.style.userSelect =
      "none";

    document.body.style.cursor =
      cursor;

    const move = (moveEvent) => {
      moveEvent.preventDefault();
      onMove(moveEvent);
    };

    const stop = () => {
      document.body.style.userSelect =
        "";

      document.body.style.cursor =
        "";

      setGuides({
        vertical: [],
        horizontal: [],
      });

      window.removeEventListener(
        "pointermove",
        move
      );

      window.removeEventListener(
        "pointerup",
        stop
      );
    };

    window.addEventListener(
      "pointermove",
      move
    );

    window.addEventListener(
      "pointerup",
      stop,
      { once: true }
    );
  }

  function startMove(
    event,
    layer
  ) {
    onSelect?.(layer.id);

    if (layer.locked) {
      return;
    }

    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const rect =
      canvas.getBoundingClientRect();

    const startX = event.clientX;
    const startY = event.clientY;

    const originalX =
      Number(layer.x ?? 50);

    const originalY =
      getLayerY(layer);

    beginPointerAction(
      event,
      "grabbing",
      (moveEvent) => {
        const deltaX =
          ((moveEvent.clientX -
            startX) /
            rect.width) *
          100;

        const deltaY =
          ((moveEvent.clientY -
            startY) /
            rect.height) *
          100;

        let nextX = clamp(
          originalX + deltaX,
          2,
          98
        );

        let nextY = clamp(
          originalY + deltaY,
          2,
          98
        );

        const nextGuides = {
          vertical: [],
          horizontal: [],
        };

        if (snapEnabled) {
          const snapX =
            getNearestSnap(
              nextX,
              getVerticalSnapPoints(
                layers,
                layer.id,
                safeArea
              )
            );

          const snapY =
            getNearestSnap(
              nextY,
              getHorizontalSnapPoints(
                layers,
                layer.id,
                safeArea
              )
            );

          if (snapX != null) {
            nextX = snapX;
            nextGuides.vertical.push(
              snapX
            );
          }

          if (snapY != null) {
            nextY = snapY;
            nextGuides.horizontal.push(
              snapY
            );
          }
        }

        setGuides(nextGuides);

        onChange?.(
          layer.id,
          {
            x: nextX,
            y: nextY,
            position: "custom",
          }
        );
      }
    );
  }

  function startBoxResize(
    event,
    layer,
    direction
  ) {
    onSelect?.(layer.id);

    if (layer.locked) {
      return;
    }

    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const rect =
      canvas.getBoundingClientRect();

    const startX = event.clientX;
    const startY = event.clientY;

    const originalWidth =
      Number(
        layer.boxWidth ??
        (layer.type === "subtitle"
          ? 86
          : 52)
      );

    const originalHeight =
      Number(
        layer.boxHeight ??
        (layer.type === "subtitle"
          ? 12
          : 14)
      );

    const cursor =
      direction.includes("left") ||
        direction.includes("right")
        ? direction.includes("top") ||
          direction.includes("bottom")
          ? direction === "topLeft" ||
            direction === "bottomRight"
            ? "nwse-resize"
            : "nesw-resize"
          : "ew-resize"
        : "ns-resize";

    beginPointerAction(
      event,
      cursor,
      (moveEvent) => {
        const rawDeltaX =
          ((moveEvent.clientX -
            startX) /
            rect.width) *
          200;

        const rawDeltaY =
          ((moveEvent.clientY -
            startY) /
            rect.height) *
          200;

        const changes = {};

        if (
          direction.includes("left")
        ) {
          changes.boxWidth = clamp(
            originalWidth -
            rawDeltaX,
            14,
            94
          );
        }

        if (
          direction.includes("right")
        ) {
          changes.boxWidth = clamp(
            originalWidth +
            rawDeltaX,
            14,
            94
          );
        }

        if (
          direction.includes("top")
        ) {
          changes.boxHeight = clamp(
            originalHeight -
            rawDeltaY,
            6,
            60
          );
        }

        if (
          direction.includes("bottom")
        ) {
          changes.boxHeight = clamp(
            originalHeight +
            rawDeltaY,
            6,
            60
          );
        }

        onChange?.(
          layer.id,
          changes
        );
      }
    );
  }

  function startFontResize(
    event,
    layer
  ) {
    onSelect?.(layer.id);

    if (layer.locked) {
      return;
    }

    const startX =
      event.clientX;

    const originalSize =
      Number(
        layer.fontSize || 64
      );

    beginPointerAction(
      event,
      "nesw-resize",
      (moveEvent) => {
        const delta =
          moveEvent.clientX -
          startX;

        onChange?.(
          layer.id,
          {
            fontSize: clamp(
              originalSize +
              delta * 0.75,
              18,
              180
            ),
          }
        );
      }
    );
  }


  function startStickerResize(
    event,
    layer
  ) {
    onSelect?.(layer.id);

    if (layer.locked) {
      return;
    }

    const startX =
      event.clientX;

    const originalSize =
      Number(
        layer.stickerSize || 96
      );

    beginPointerAction(
      event,
      "nwse-resize",
      (moveEvent) => {
        const delta =
          moveEvent.clientX -
          startX;

        onChange?.(
          layer.id,
          {
            stickerSize: clamp(
              originalSize +
              delta * 1.4,
              24,
              320
            ),
          }
        );
      }
    );
  }

  function startRotate(
    event,
    layer
  ) {
    onSelect?.(layer.id);

    if (layer.locked) {
      return;
    }

    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const rect =
      canvas.getBoundingClientRect();

    const centerX =
      rect.left +
      (Number(layer.x ?? 50) /
        100) *
      rect.width;

    const centerY =
      rect.top +
      (getLayerY(layer) /
        100) *
      rect.height;

    beginPointerAction(
      event,
      "grabbing",
      (moveEvent) => {
        const rawAngle =
          Math.atan2(
            moveEvent.clientY -
            centerY,
            moveEvent.clientX -
            centerX
          ) *
          (180 / Math.PI) +
          90;

        const normalized =
          normalizeAngle(
            rawAngle
          );

        const snapped =
          snapRotation(
            normalized
          );

        onChange?.(
          layer.id,
          {
            rotation:
              Math.round(snapped),
          }
        );
      }
    );
  }

  return (
    <div
      ref={canvasRef}
      className="pointer-events-auto absolute inset-0"
      onPointerDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          finishTextEditing();
          onDeselect?.();
        }
      }}
    >
      {showSafeArea && (
        <SafeAreaOverlay
          area={safeArea}
          preset={safePreset}
        />
      )}

      {showRulers && (
        <RulerOverlay />
      )}

      {guides.vertical.map(
        (position) => (
          <div
            key={`v-${position}`}
            className="pointer-events-none absolute bottom-0 top-0 z-50 w-px bg-red-500 shadow-[0_0_8px_rgba(239,68,68,.9)]"
            style={{
              left: `${position}%`,
            }}
          />
        )
      )}

      {guides.horizontal.map(
        (position) => (
          <div
            key={`h-${position}`}
            className="pointer-events-none absolute left-0 right-0 z-50 h-px bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,.9)]"
            style={{
              top: `${position}%`,
            }}
          />
        )
      )}

      {visible.map((layer) => {
        const motionStyle =
          getLayerMotionStyle(
            layer,
            currentTime
          );

        const animationState =
          getTextAnimationState({
            layer,
            currentTime,
          });

        const animatedText =
          animationState.visibleText;

        const displayText =
          layer.uppercase
            ? String(animatedText).toUpperCase()
            : String(animatedText);

        const selected =
          selectedLayerId ===
          layer.id;

        const isEditingText =
          editingTextId ===
          layer.id;

        const boxWidth =
          Number(
            layer.boxWidth ??
            (layer.type ===
              "subtitle"
              ? 86
              : 52)
          );

        const boxHeight =
          Number(
            layer.boxHeight ??
            (layer.type ===
              "subtitle"
              ? 12
              : 14)
          );

        const stickerPreviewSize =
          Math.max(
            12,
            Number(
              layer.stickerSize ||
              96
            ) * previewScale
          );

        return (
          <div
            key={layer.id}
            className="absolute"
            style={{
              left: `${Number(
                layer.x ?? 50
              )}%`,
              top: `${getLayerY(
                layer
              )}%`,
              width:
                layer.type === "sticker"
                  ? `${stickerPreviewSize}px`
                  : `${boxWidth}%`,
              height:
                layer.type === "sticker"
                  ? `${stickerPreviewSize}px`
                  : `${boxHeight}%`,
              minHeight: undefined,
              opacity:
                motionStyle.opacity *
                animationState.opacity *
                Number(
                  layer.textOpacity ??
                  1
                ),
              transform: `translate(-50%, -50%) translate(${(
                  Number(motionStyle.translateX || 0) +
                  Number(animationState.translateX || 0)
                ) * previewScale
                }px, ${(
                  Number(motionStyle.translateY || 0) +
                  Number(animationState.translateY || 0)
                ) * previewScale
                }px) scale(${Number(motionStyle.scale || 1) *
                Number(animationState.scale || 1)
                }) rotate(${Number(layer.rotation || 0) +
                Number(animationState.rotate || 0)
                }deg)`,
              transformOrigin:
                "center center",
              zIndex:
                Number(
                  layer.zIndex || 0
                ),
            }}
          >
            {layer.type === "sticker" ? (
              <div
                role="button"
                tabIndex={0}
                onPointerDown={(event) =>
                  startMove(
                    event,
                    layer
                  )
                }
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect?.(layer.id);
                }}
                className={`relative flex h-full min-h-[2.5rem] w-full items-center justify-center ${layer.locked
                  ? "cursor-not-allowed"
                  : "cursor-grab active:cursor-grabbing"
                  }`}
                style={{
                  fontSize: `${stickerPreviewSize}px`,
                  lineHeight: 1,
                  opacity:
                    Number(
                      layer.opacity ?? 1
                    ),
                  textShadow:
                    layer.shadowEnabled
                      ? `0 ${4 * previewScale}px ${Number(
                        layer.shadowBlur ||
                        12
                      ) * previewScale}px ${layer.shadowColor ||
                      "#000000"
                      }`
                      : "none",
                }}
              >
                {layer.stickerSrc ? (
                  <img
                    src={layer.stickerSrc}
                    alt={layer.name}
                    draggable={false}
                    className="pointer-events-none h-full w-full object-contain"
                  />
                ) : (
                  <span className="pointer-events-none">{layer.sticker}</span>
                )}

                {selected && (
                  <>
                    <span className="pointer-events-none absolute inset-0 border border-dashed border-yellow-400" />

                    {!layer.locked && (
                      <>
                        <button
                          type="button"
                          data-canvas-handle="true"
                          title="Cambiar tamaño"
                          onPointerDown={(event) =>
                            startStickerResize(
                              event,
                              layer
                            )
                          }
                          className="absolute -bottom-3 -right-3 z-30 h-6 w-6 cursor-nwse-resize rounded-full border-2 border-white bg-yellow-400 shadow"
                        />

                        <span className="pointer-events-none absolute left-1/2 top-[-30px] h-6 w-px -translate-x-1/2 bg-yellow-400" />

                        <button
                          type="button"
                          data-canvas-handle="true"
                          aria-label="Rotar"
                          onPointerDown={(event) =>
                            startRotate(
                              event,
                              layer
                            )
                          }
                          className="absolute left-1/2 top-[-42px] z-30 h-6 w-6 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-yellow-400 shadow"
                        />
                      </>
                    )}

                    {layer.locked && (
                      <span className="absolute -right-2 -top-2 rounded-full bg-slate-950 px-1.5 py-1 text-[10px] text-white">
                        🔒
                      </span>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onPointerDown={(
                  event
                ) => {
                  if (
                    isEditingText ||
                    event.target.closest?.(
                      "textarea"
                    ) ||
                    event.target.closest?.(
                      "[data-canvas-handle='true']"
                    )
                  ) {
                    return;
                  }

                  startMove(
                    event,
                    layer
                  );
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect?.(layer.id);
                }}
                onDoubleClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  startTextEditing(layer);
                }}
                className="relative flex h-full w-full cursor-grab items-center justify-center whitespace-pre-wrap active:cursor-grabbing"
                style={{
                  color:
                    layer.color ||
                    "#ffffff",
                  fontFamily:
                    layer.fontFamily,
                  fontSize: `${Math.max(
                    6,
                    Number(
                      layer.fontSize ||
                      42
                    ) * previewScale
                  )}px`,
                  fontWeight:
                    layer.fontWeight,
                  fontStyle:
                    layer.italic
                      ? "italic"
                      : "normal",
                  textDecoration:
                    layer.underline
                      ? "underline"
                      : "none",
                  textAlign:
                    layer.align,
                  letterSpacing: `${Number(
                    layer.letterSpacing ||
                    0
                  ) * previewScale}px`,
                  lineHeight: Number(
                    layer.lineHeight ||
                    1.1
                  ),
                  padding:
                    layer.backgroundEnabled
                      ? `${Math.max(
                        1,
                        Number(
                          layer.backgroundPadding ||
                          14
                        ) * previewScale
                      )}px`
                      : "0",
                  borderRadius:
                    layer.backgroundEnabled
                      ? `${Math.max(
                        0,
                        Number(
                          layer.backgroundRadius ||
                          14
                        ) * previewScale
                      )}px`
                      : "0",
                  backgroundColor:
                    layer.backgroundEnabled
                      ? hexToRgba(
                        layer.backgroundColor,
                        layer.backgroundOpacity
                      )
                      : "transparent",
                  WebkitTextStroke:
                    layer.strokeEnabled
                      ? `${Math.max(
                        0,
                        Number(
                          layer.strokeWidth ||
                          0
                        ) * previewScale
                      )}px ${layer.strokeColor
                      }`
                      : "0 transparent",
                  textShadow:
                    layer.shadowEnabled
                      ? `0 ${Number(
                        layer.shadowOffsetY ||
                        6
                      ) * previewScale
                      }px ${Number(
                        layer.shadowBlur ||
                        16
                      ) * previewScale
                      }px ${layer.shadowColor ||
                      "#000000"
                      }`
                      : "none",
                  wordBreak: "normal",
                  overflowWrap:
                    "break-word",
                  boxSizing:
                    "border-box",
                  overflow:
                    "visible",
                }}
              >
                {isEditingText ? (
                  <textarea
                    ref={textEditorRef}
                    value={textDraft}
                    onChange={(event) =>
                      setTextDraft(
                        event.target.value
                      )
                    }
                    onBlur={finishTextEditing}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        cancelTextEditing();
                        return;
                      }

                      if (
                        event.key === "Enter" &&
                        (event.ctrlKey ||
                          event.metaKey)
                      ) {
                        event.preventDefault();
                        finishTextEditing();
                      }
                    }}
                    className="h-full w-full resize-none overflow-hidden rounded-md border-2 border-blue-400 bg-black/20 p-1 text-inherit outline-none"
                    style={{
                      font: "inherit",
                      color: "inherit",
                      textAlign:
                        layer.align ||
                        "center",
                      lineHeight: Number(
                        layer.lineHeight || 1.1
                      ),
                      letterSpacing: `${Number(
                        layer.letterSpacing || 0
                      ) * previewScale}px`,
                    }}
                  />
                ) : (
                  <span className="pointer-events-none w-full">
                    {displayText}
                  </span>
                )}

                {selected && !isEditingText && (
                  <>
                    <span className="pointer-events-none absolute inset-0 border border-dashed border-blue-400" />

                    <Handle
                      position="left"
                      cursor="ew-resize"
                      onPointerDown={(event) =>
                        startBoxResize(
                          event,
                          layer,
                          "left"
                        )
                      }
                    />

                    <Handle
                      position="right"
                      cursor="ew-resize"
                      onPointerDown={(event) =>
                        startBoxResize(
                          event,
                          layer,
                          "right"
                        )
                      }
                    />

                    <Handle
                      position="top"
                      cursor="ns-resize"
                      onPointerDown={(event) =>
                        startBoxResize(
                          event,
                          layer,
                          "top"
                        )
                      }
                    />

                    <Handle
                      position="bottom"
                      cursor="ns-resize"
                      onPointerDown={(event) =>
                        startBoxResize(
                          event,
                          layer,
                          "bottom"
                        )
                      }
                    />

                    <Handle
                      position="topLeft"
                      cursor="nwse-resize"
                      onPointerDown={(event) =>
                        startBoxResize(
                          event,
                          layer,
                          "topLeft"
                        )
                      }
                    />

                    <Handle
                      position="topRight"
                      cursor="nesw-resize"
                      onPointerDown={(event) =>
                        startBoxResize(
                          event,
                          layer,
                          "topRight"
                        )
                      }
                    />

                    <Handle
                      position="bottomLeft"
                      cursor="nesw-resize"
                      onPointerDown={(event) =>
                        startBoxResize(
                          event,
                          layer,
                          "bottomLeft"
                        )
                      }
                    />

                    <Handle
                      position="bottomRight"
                      cursor="nwse-resize"
                      onPointerDown={(event) =>
                        startBoxResize(
                          event,
                          layer,
                          "bottomRight"
                        )
                      }
                    />

                    <button
                      type="button"
                      data-canvas-handle="true"
                      title="Tamaño de letra"
                      onPointerDown={(event) =>
                        startFontResize(
                          event,
                          layer
                        )
                      }
                      className="absolute -bottom-8 right-0 z-30 flex h-6 w-6 cursor-nesw-resize items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[10px] font-black text-white shadow"
                    >
                      A
                    </button>

                    <span className="pointer-events-none absolute left-1/2 top-[-30px] h-6 w-px -translate-x-1/2 bg-blue-400" />

                    <button
                      type="button"
                      data-canvas-handle="true"
                      aria-label="Rotar"
                      onPointerDown={(event) =>
                        startRotate(
                          event,
                          layer
                        )
                      }
                      className="absolute left-1/2 top-[-42px] z-30 h-6 w-6 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-blue-500 shadow active:cursor-grabbing"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SafeAreaOverlay({
  area,
  preset,
}) {
  return (
    <div
      className="pointer-events-none absolute z-20 border-2 border-dashed border-amber-300/90"
      style={{
        left: `${area.left}%`,
        right: `${area.right}%`,
        top: `${area.top}%`,
        bottom: `${area.bottom}%`,
      }}
    >
      <span className="absolute left-2 top-2 rounded bg-black/65 px-2 py-1 text-[9px] font-black uppercase text-amber-200">
        Zona segura ·{" "}
        {preset === "instagram"
          ? "Instagram"
          : preset === "tiktok"
            ? "TikTok"
            : "Shorts"}
      </span>
    </div>
  );
}

function RulerOverlay() {
  const marks = [
    0,
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100,
  ];

  return (
    <>
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 h-5 bg-black/45">
        {marks.map((mark) => (
          <span
            key={`top-${mark}`}
            className="absolute top-0 h-2 border-l border-white/60 text-[8px] font-bold text-white/70"
            style={{
              left: `${mark}%`,
            }}
          >
            {mark}
          </span>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-30 w-5 bg-black/45">
        {marks.map((mark) => (
          <span
            key={`left-${mark}`}
            className="absolute left-0 w-2 border-t border-white/60 text-[8px] font-bold text-white/70"
            style={{
              top: `${mark}%`,
            }}
          >
            {mark}
          </span>
        ))}
      </div>
    </>
  );
}

function Handle({
  position,
  cursor,
  onPointerDown,
}) {
  const positions = {
    left:
      "left-[-5px] top-1/2 -translate-y-1/2",
    right:
      "right-[-5px] top-1/2 -translate-y-1/2",
    top:
      "left-1/2 top-[-5px] -translate-x-1/2",
    bottom:
      "bottom-[-5px] left-1/2 -translate-x-1/2",
    topLeft:
      "left-[-5px] top-[-5px]",
    topRight:
      "right-[-5px] top-[-5px]",
    bottomLeft:
      "bottom-[-5px] left-[-5px]",
    bottomRight:
      "bottom-[-5px] right-[-5px]",
  };

  return (
    <button
      type="button"
      data-canvas-handle="true"
      onPointerDown={
        onPointerDown
      }
      className={`absolute z-30 h-3 w-3 rounded-sm border border-white bg-blue-500 shadow ${positions[position]}`}
      style={{ cursor }}
      aria-label="Redimensionar caja"
    />
  );
}

function getVerticalSnapPoints(
  layers,
  currentId,
  safeArea
) {
  return [
    50,
    safeArea.left,
    100 - safeArea.right,
    ...layers
      .filter(
        (layer) =>
          layer.id !== currentId
      )
      .map(
        (layer) =>
          Number(layer.x ?? 50)
      ),
  ];
}

function getHorizontalSnapPoints(
  layers,
  currentId,
  safeArea
) {
  return [
    50,
    safeArea.top,
    100 - safeArea.bottom,
    ...layers
      .filter(
        (layer) =>
          layer.id !== currentId
      )
      .map(
        (layer) =>
          getLayerY(layer)
      ),
  ];
}

function getNearestSnap(
  value,
  points
) {
  const nearest =
    points.reduce(
      (best, point) =>
        Math.abs(value - point) <
          Math.abs(value - best)
          ? point
          : best,
      points[0]
    );

  return Math.abs(
    value - nearest
  ) <= SNAP_DISTANCE
    ? nearest
    : null;
}

function getSafeArea(
  preset
) {
  if (preset === "tiktok") {
    return {
      top: 10,
      right: 12,
      bottom: 20,
      left: 8,
    };
  }

  if (preset === "shorts") {
    return {
      top: 8,
      right: 10,
      bottom: 18,
      left: 10,
    };
  }

  return {
    top: 8,
    right: 10,
    bottom: 18,
    left: 10,
  };
}

function getLayerY(layer) {
  if (
    layer.position === "top"
  ) {
    return 14;
  }

  if (
    layer.position ===
    "bottom"
  ) {
    return 78;
  }

  return Number(
    layer.y ?? 50
  );
}

function normalizeAngle(
  angle
) {
  let result =
    angle % 360;

  if (result > 180) {
    result -= 360;
  }

  if (result < -180) {
    result += 360;
  }

  return result;
}

function snapRotation(
  angle
) {
  const snapPoints = [
    -180,
    -90,
    0,
    90,
    180,
  ];

  const nearest =
    snapPoints.reduce(
      (best, point) =>
        Math.abs(angle - point) <
          Math.abs(angle - best)
          ? point
          : best,
      snapPoints[0]
    );

  return Math.abs(
    angle - nearest
  ) <= 5
    ? nearest
    : angle;
}

function hexToRgba(
  hex = "#000000",
  opacity = 1
) {
  const clean =
    String(hex).replace("#", "");

  const full =
    clean.length === 3
      ? clean
        .split("")
        .map(
          (char) =>
            char + char
        )
        .join("")
      : clean
        .padEnd(6, "0")
        .slice(0, 6);

  const value =
    parseInt(full, 16);

  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255
    }, ${Math.max(
      0,
      Math.min(
        1,
        Number(opacity ?? 1)
      )
    )})`;
}
