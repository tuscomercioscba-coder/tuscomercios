import {
  useMemo,
  useRef,
  useState,
} from "react";

import { clamp, formatTime } from "./utils";
import {
  buildProjectTimeline,
} from "./projectTimeline";

const LABEL_WIDTH = 118;
const TRACK_HEIGHT = 62;

export default function TimelineCanvasPro({
  clips,
  layers,
  audioTrack,
  currentTime,
  selectedClipId,
  selectedLayerId,
  disabled,
  onSeek,
  onSelectClip,
  onSelectLayer,
  onMoveClip,
  onResizeClipLeft,
  onResizeClipRight,
  onResizeLayerLeft,
  onResizeLayerRight,
  onMoveLayer,
  onResizeAudioLeft,
  onResizeAudioRight,
  onOpenTransition,
}) {
  const viewportRef = useRef(null);
  const [zoom, setZoom] = useState(2);
  const [collapsed, setCollapsed] = useState({});

  const timeline = useMemo(
    () => buildProjectTimeline(clips),
    [clips]
  );

  const duration = timeline.length
    ? timeline[timeline.length - 1].projectEnd
    : 0;

  const pixelsPerSecond = 42 * zoom;
  const contentWidth = Math.max(
    980,
    duration * pixelsPerSecond
  );
  const totalWidth =
    LABEL_WIDTH + contentWidth;
  const cursorLeft =
    LABEL_WIDTH +
    currentTime * pixelsPerSecond;

  const tickStep =
    zoom >= 8
      ? 0.25
      : zoom >= 4
      ? 0.5
      : zoom >= 2
      ? 1
      : 2;

  const ticks = useMemo(() => {
    const result = [];

    for (
      let time = 0;
      time <= duration + 0.001;
      time += tickStep
    ) {
      result.push(
        Number(time.toFixed(2))
      );
    }

    return result;
  }, [duration, tickStep]);

  function toggleTrack(trackId) {
    setCollapsed((current) => ({
      ...current,
      [trackId]: !current[trackId],
    }));
  }

  function handleWheel(event) {
    if (!event.ctrlKey) return;

    event.preventDefault();

    setZoom((current) =>
      clamp(
        event.deltaY < 0
          ? current * 2
          : current / 2,
        1,
        8
      )
    );
  }

  function seekFromPointer(event) {
    if (
      disabled ||
      !viewportRef.current
    ) {
      return;
    }

    const rect =
      viewportRef.current.getBoundingClientRect();

    const x =
      event.clientX -
      rect.left +
      viewportRef.current.scrollLeft -
      LABEL_WIDTH;

    onSeek(
      clamp(
        x / pixelsPerSecond,
        0,
        duration
      )
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
            Timeline Engine V2
          </p>

          <h3 className="mt-2 text-xl font-black text-slate-950">
            Editá directamente con el mouse
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Centro para mover. Bordes para cambiar duración. Ctrl + rueda para zoom.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 4, 8].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setZoom(value)
              }
              className={`min-h-10 rounded-xl px-3 text-xs font-black ${
                zoom === value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {value * 100}%
            </button>
          ))}
        </div>
      </div>

      <div
        ref={viewportRef}
        onWheel={handleWheel}
        className="mt-5 overflow-x-auto rounded-2xl bg-slate-950"
      >
        <div
          className="relative select-none"
          style={{
            width: totalWidth,
            minHeight: 520,
          }}
          onPointerDown={seekFromPointer}
        >
          <div className="sticky top-0 z-40 h-10 border-b border-slate-700 bg-slate-900">
            {ticks.map((time) => (
              <div
                key={time}
                className="absolute top-0 h-full border-l border-slate-700"
                style={{
                  left:
                    LABEL_WIDTH +
                    time *
                      pixelsPerSecond,
                }}
              >
                <span className="absolute left-1 top-1 text-[10px] font-bold text-slate-400">
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>

          <div
            className="absolute bottom-0 top-0 z-50 w-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.95)]"
            style={{
              left: cursorLeft,
            }}
          >
            <div className="absolute -left-2 top-0 h-0 w-0 border-x-[8px] border-t-[12px] border-x-transparent border-t-red-500" />
          </div>

          <TrackHeader
            top={48}
            label="VIDEO"
            collapsed={collapsed.video}
            onToggle={() =>
              toggleTrack("video")
            }
          />

          {!collapsed.video && (
            <div
              className="absolute left-0 right-0"
              style={{
                top: 88,
                height: TRACK_HEIGHT,
              }}
            >
              {timeline.map(
                (clip, index) => {
                  const left =
                    LABEL_WIDTH +
                    clip.projectStart *
                      pixelsPerSecond;

                  const width = Math.max(
                    72,
                    clip.duration *
                      pixelsPerSecond
                  );

                  return (
                    <div
                      key={clip.id}
                      className={`absolute h-14 overflow-visible rounded-xl border-2 shadow-lg ${
                        selectedClipId === clip.id
                          ? "border-cyan-300 bg-blue-600"
                          : "border-slate-600 bg-slate-800"
                      }`}
                      style={{
                        left,
                        width,
                      }}
                      onPointerDown={(event) =>
                        event.stopPropagation()
                      }
                    >
                      {clip.thumbnail && (
                        <img
                          src={clip.thumbnail}
                          alt=""
                          draggable={false}
                          className="absolute inset-0 h-full w-full rounded-lg object-cover opacity-35"
                        />
                      )}

                      <ResizeHandle
                        side="left"
                        disabled={disabled}
                        pixelsPerSecond={pixelsPerSecond}
                        onResize={(deltaSeconds) =>
                          onResizeClipLeft(
                            clip.id,
                            deltaSeconds
                          )
                        }
                      />

                      <MoveHandle
                        disabled={disabled}
                        pixelsPerSecond={pixelsPerSecond}
                        onClick={() => {
                          onSelectClip(
                            clip.id
                          );
                          onSeek(
                            clip.projectStart
                          );
                        }}
                        onMove={(deltaSeconds) =>
                          onMoveClip(
                            clip.id,
                            clip.projectStart +
                              deltaSeconds
                          )
                        }
                      >
                        <span className="block truncate text-xs font-black">
                          {clip.name}
                        </span>

                        <span className="mt-1 block text-[10px] font-bold opacity-80">
                          {clip.duration.toFixed(
                            2
                          )}
                          s
                        </span>
                      </MoveHandle>

                      <ResizeHandle
                        side="right"
                        disabled={disabled}
                        pixelsPerSecond={pixelsPerSecond}
                        onResize={(deltaSeconds) =>
                          onResizeClipRight(
                            clip.id,
                            deltaSeconds
                          )
                        }
                      />

                      {index <
                        timeline.length -
                          1 && (
                        <button
                          type="button"
                          title="Editar transición"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectClip(
                              clip.id
                            );
                            onOpenTransition?.(
                              clip.id
                            );
                          }}
                          className="absolute -right-4 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-cyan-400 text-sm font-black text-slate-950 shadow-lg"
                        >
                          ↔
                        </button>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}

          <TrackHeader
            top={170}
            label="TEXTOS"
            collapsed={collapsed.text}
            onToggle={() =>
              toggleTrack("text")
            }
          />

          {!collapsed.text && (
            <LayerTrack
              top={210}
              layers={layers.filter(
                (layer) =>
                  layer.type ===
                  "text"
              )}
              selectedLayerId={
                selectedLayerId
              }
              pixelsPerSecond={
                pixelsPerSecond
              }
              disabled={disabled}
              onSelect={onSelectLayer}
              onSeek={onSeek}
              onResizeLeft={
                onResizeLayerLeft
              }
              onResizeRight={
                onResizeLayerRight
              }
              onMove={onMoveLayer}
              colorClass="border-blue-400 bg-blue-700"
            />
          )}

          <TrackHeader
            top={284}
            label="SUBTÍTULOS"
            collapsed={
              collapsed.subtitle
            }
            onToggle={() =>
              toggleTrack(
                "subtitle"
              )
            }
          />

          {!collapsed.subtitle && (
            <LayerTrack
              top={324}
              layers={layers.filter(
                (layer) =>
                  layer.type ===
                    "subtitle" ||
                  layer.type ===
                    "sticker"
              )}
              selectedLayerId={
                selectedLayerId
              }
              pixelsPerSecond={
                pixelsPerSecond
              }
              disabled={disabled}
              onSelect={onSelectLayer}
              onSeek={onSeek}
              onResizeLeft={
                onResizeLayerLeft
              }
              onResizeRight={
                onResizeLayerRight
              }
              onMove={onMoveLayer}
              colorClass="border-violet-400 bg-violet-700"
            />
          )}

          <TrackHeader
            top={398}
            label="AUDIO"
            collapsed={collapsed.audio}
            onToggle={() =>
              toggleTrack("audio")
            }
          />

          {!collapsed.audio &&
            audioTrack && (
              <div
                className="absolute left-0 right-0 h-14"
                style={{ top: 438 }}
              >
                <div
                  className="absolute h-12 overflow-hidden rounded-xl border-2 border-fuchsia-400 bg-fuchsia-700 text-white shadow-lg"
                  style={{
                    left:
                      LABEL_WIDTH +
                      audioTrack.start *
                        pixelsPerSecond,
                    width: Math.max(
                      80,
                      (audioTrack.end -
                        audioTrack.start) *
                        pixelsPerSecond
                    ),
                  }}
                  onPointerDown={(event) =>
                    event.stopPropagation()
                  }
                >
                  <ResizeHandle
                    side="left"
                    disabled={disabled}
                    pixelsPerSecond={
                      pixelsPerSecond
                    }
                    onResize={
                      onResizeAudioLeft
                    }
                  />

                  <div className="h-full px-4 py-2">
                    <span className="block truncate text-xs font-black">
                      🎵 {audioTrack.name}
                    </span>

                    <span className="mt-1 block text-[10px] font-bold opacity-75">
                      {formatTime(
                        audioTrack.start
                      )}{" "}
                      →{" "}
                      {formatTime(
                        audioTrack.end
                      )}
                    </span>
                  </div>

                  <ResizeHandle
                    side="right"
                    disabled={disabled}
                    pixelsPerSecond={
                      pixelsPerSecond
                    }
                    onResize={
                      onResizeAudioRight
                    }
                  />
                </div>
              </div>
            )}
        </div>
      </div>
    </section>
  );
}

function TrackHeader({
  top,
  label,
  collapsed,
  onToggle,
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className="absolute left-0 z-30 flex h-9 w-[118px] items-center justify-between border-r border-slate-700 bg-slate-900 px-3 text-xs font-black text-slate-300"
      style={{ top }}
    >
      <span>{label}</span>
      <span>
        {collapsed ? "+" : "−"}
      </span>
    </button>
  );
}

function LayerTrack({
  top,
  layers,
  selectedLayerId,
  pixelsPerSecond,
  disabled,
  onSelect,
  onSeek,
  onResizeLeft,
  onResizeRight,
  onMove,
  colorClass,
}) {
  return (
    <div
      className="absolute left-0 right-0 h-14"
      style={{ top }}
    >
      {layers.map((layer) => {
        const left =
          LABEL_WIDTH +
          layer.start *
            pixelsPerSecond;

        const width = Math.max(
          70,
          (layer.end -
            layer.start) *
            pixelsPerSecond
        );

        return (
          <div
            key={layer.id}
            className={`absolute h-12 overflow-hidden rounded-xl border-2 text-white shadow-lg ${
              selectedLayerId ===
              layer.id
                ? "border-cyan-300 bg-cyan-600"
                : colorClass
            }`}
            style={{
              left,
              width,
            }}
            onPointerDown={(event) =>
              event.stopPropagation()
            }
          >
            <ResizeHandle
              side="left"
              disabled={disabled}
              pixelsPerSecond={
                pixelsPerSecond
              }
              onResize={(deltaSeconds) =>
                onResizeLeft(
                  layer.id,
                  deltaSeconds
                )
              }
            />

            <MoveHandle
              disabled={disabled}
              pixelsPerSecond={
                pixelsPerSecond
              }
              onClick={() => {
                onSelect(layer.id);
                onSeek(layer.start);
              }}
              onMove={(deltaSeconds) =>
                onMove(
                  layer.id,
                  deltaSeconds
                )
              }
            >
              <span className="block truncate text-xs font-black">
                {layer.text}
              </span>

              <span className="mt-1 block text-[10px] font-bold opacity-75">
                {formatTime(
                  layer.start
                )}{" "}
                →{" "}
                {formatTime(
                  layer.end
                )}
              </span>
            </MoveHandle>

            <ResizeHandle
              side="right"
              disabled={disabled}
              pixelsPerSecond={
                pixelsPerSecond
              }
              onResize={(deltaSeconds) =>
                onResizeRight(
                  layer.id,
                  deltaSeconds
                )
              }
            />
          </div>
        );
      })}
    </div>
  );
}

function MoveHandle({
  disabled,
  pixelsPerSecond,
  onMove,
  onClick,
  children,
}) {
  const movedRef = useRef(false);

  function handlePointerDown(
    event
  ) {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();

    const startX =
      event.clientX;

    let lastX =
      event.clientX;

    movedRef.current = false;

    document.body.style.userSelect =
      "none";
    document.body.style.cursor =
      "grabbing";

    const move = (moveEvent) => {
      moveEvent.preventDefault();

      const deltaPixels =
        moveEvent.clientX -
        lastX;

      lastX =
        moveEvent.clientX;

      if (
        Math.abs(
          moveEvent.clientX -
            startX
        ) > 3
      ) {
        movedRef.current = true;
      }

      onMove(
        deltaPixels /
          pixelsPerSecond
      );
    };

    const stop = () => {
      document.body.style.userSelect =
        "";
      document.body.style.cursor =
        "";

      window.removeEventListener(
        "pointermove",
        move
      );

      window.removeEventListener(
        "pointerup",
        stop
      );

      if (!movedRef.current) {
        onClick?.();
      }
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

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={
        handlePointerDown
      }
      className="relative h-full w-full touch-none cursor-grab px-5 text-left text-white active:cursor-grabbing"
      style={{ touchAction: "none" }}
    >
      {children}
    </button>
  );
}

function ResizeHandle({
  side,
  disabled,
  pixelsPerSecond,
  onResize,
}) {
  function handlePointerDown(
    event
  ) {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();

    let lastX =
      event.clientX;

    document.body.style.userSelect =
      "none";
    document.body.style.cursor =
      "ew-resize";

    const move = (moveEvent) => {
      moveEvent.preventDefault();

      const deltaPixels =
        moveEvent.clientX -
        lastX;

      lastX =
        moveEvent.clientX;

      onResize(
        deltaPixels /
          pixelsPerSecond
      );
    };

    const stop = () => {
      document.body.style.userSelect =
        "";
      document.body.style.cursor =
        "";

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

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={
        handlePointerDown
      }
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      className={`absolute inset-y-0 z-30 w-4 cursor-ew-resize border-0 bg-white/35 p-0 touch-none ${
        side === "left"
          ? "left-0 rounded-l-lg"
          : "right-0 rounded-r-lg"
      }`}
    >
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-6 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
    </button>
  );
}
