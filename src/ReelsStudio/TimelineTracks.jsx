import { useMemo, useRef, useState } from "react";
import { clamp, formatTime } from "./utils";
import { buildProjectTimeline } from "./projectTimeline";

const TRACKS = [
  { id: "video", label: "VIDEO" },
  { id: "text", label: "TEXTOS" },
  { id: "subtitle", label: "SUBTÍTULOS" },
];

export default function TimelineTracks({
  clips,
  layers,
  duration,
  currentTime,
  selectedClipId,
  selectedLayerId,
  thumbnails,
  disabled,
  onSeek,
  onSelectClip,
  onSelectLayer,
  onReorderClip,
  onChangeLayer,
  audioTrack,
  onChangeAudio,
}) {
  const viewportRef = useRef(null);
  const [zoom, setZoom] = useState(2);
  const [collapsed, setCollapsed] = useState({});
  const [draggedClipId, setDraggedClipId] = useState("");

  const LABEL_WIDTH = 112;

  const projectTimeline =
    buildProjectTimeline(clips);

  const projectDuration =
    projectTimeline.length
      ? projectTimeline[
          projectTimeline.length - 1
        ].projectEnd
      : 0;

  const pixelsPerSecond = 40 * zoom;

  const contentWidth = Math.max(
    900,
    projectDuration *
      pixelsPerSecond
  );

  const totalWidth =
    LABEL_WIDTH +
    contentWidth;

  const cursorLeft =
    LABEL_WIDTH +
    currentTime *
      pixelsPerSecond;

  const ticks = useMemo(() => {
    const step =
      zoom >= 8 ? 0.25 :
      zoom >= 4 ? 0.5 :
      zoom >= 2 ? 1 : 2;

    const result = [];
    for (let time = 0; time <= projectDuration + 0.001; time += step) {
      result.push(Number(time.toFixed(2)));
    }
    return result;
  }, [projectDuration, zoom]);

  function toggleTrack(id) {
    setCollapsed((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function handleWheel(event) {
    if (!event.ctrlKey) return;
    event.preventDefault();

    setZoom((current) => {
      const next = event.deltaY < 0 ? current * 2 : current / 2;
      return clamp(next, 1, 8);
    });
  }

  function seekFromPointer(event) {
    if (disabled || !viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();
    const x =
      event.clientX -
      rect.left +
      viewportRef.current.scrollLeft -
      LABEL_WIDTH;

    onSeek(
      clamp(
        x / pixelsPerSecond,
        0,
        projectDuration
      )
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">
            Timeline profesional
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Ctrl + rueda para acercar o alejar. Arrastrá bloques y extremos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 4, 8].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setZoom(value)}
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
          style={{ width: totalWidth, minHeight: 500 }}
          onPointerDown={seekFromPointer}
        >
          <div className="sticky top-0 z-20 h-9 border-b border-slate-700 bg-slate-900">
            {ticks.map((time) => (
              <div
                key={time}
                className="absolute top-0 h-full border-l border-slate-700"
                style={{ left: LABEL_WIDTH + time * pixelsPerSecond }}
              >
                <span className="absolute left-1 top-1 text-[10px] font-bold text-slate-400">
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>

          <div
            className="absolute bottom-0 top-0 z-40 w-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.95)]"
            style={{ left: cursorLeft }}
          >
            <div className="absolute -left-2 top-0 h-0 w-0 border-x-[8px] border-t-[12px] border-x-transparent border-t-red-500" />
          </div>

          <TrackHeader
            label="VIDEO"
            top={48}
            collapsed={collapsed.video}
            onToggle={() => toggleTrack("video")}
          />

          {!collapsed.video && (
            <>
              <div className="absolute left-28 right-0 top-12 h-20 overflow-hidden bg-slate-900" />

              <div className="absolute left-0 right-0 top-[136px] h-16">
                {projectTimeline.map(
                  (clip, index) => {
                    const width =
                      Math.max(
                        60,
                        clip.duration *
                          pixelsPerSecond
                      );

                    const left =
                      LABEL_WIDTH +
                      clip.projectStart *
                        pixelsPerSecond;

                    return (
                      <button
                        key={clip.id}
                        type="button"
                        draggable={!disabled}
                        disabled={disabled}
                        onDragStart={() =>
                          setDraggedClipId(
                            clip.id
                          )
                        }
                        onDragOver={(
                          event
                        ) =>
                          event.preventDefault()
                        }
                        onDrop={(
                          event
                        ) => {
                          event.preventDefault();

                          onReorderClip(
                            draggedClipId,
                            index
                          );

                          setDraggedClipId(
                            ""
                          );
                        }}
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          onSelectClip(
                            clip.id
                          );

                          onSeek(
                            clip.projectStart
                          );
                        }}
                        className={`absolute h-16 overflow-hidden rounded-xl border-2 px-3 text-left text-white ${
                          selectedClipId ===
                          clip.id
                            ? "border-cyan-300 bg-blue-600"
                            : "border-slate-600 bg-slate-800"
                        }`}
                        style={{
                          left,
                          width,
                        }}
                      >
                        {clip.thumbnail && (
                          <img
                            src={clip.thumbnail}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover opacity-30"
                            draggable={false}
                          />
                        )}

                        <span className="relative block truncate text-xs font-black">
                          {clip.name}
                        </span>

                        <span className="relative mt-1 block text-[10px] font-bold opacity-80">
                          {clip.duration.toFixed(
                            2
                          )}
                          s
                        </span>

                        {(
                          clip.transition ||
                          "cut"
                        ) !== "cut" && (
                          <span className="absolute bottom-1 right-1 rounded-md bg-cyan-300 px-1.5 py-0.5 text-[9px] font-black text-slate-950">
                            {
                              clip.transition
                            }
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </>
          )}

          <TrackHeader
            label="TEXTOS"
            top={220}
            collapsed={collapsed.text}
            onToggle={() => toggleTrack("text")}
          />

          {!collapsed.text && (
            <LayerTrack
              top={258}
              layers={layers.filter((layer) => layer.type === "text")}
              selectedLayerId={selectedLayerId}
              pixelsPerSecond={pixelsPerSecond}
              duration={duration}
              disabled={disabled}
              onSelect={onSelectLayer}
              onSeek={onSeek}
              onChange={onChangeLayer}
            />
          )}

          <TrackHeader
            label="SUBTÍTULOS"
            top={318}
            collapsed={collapsed.subtitle}
            onToggle={() => toggleTrack("subtitle")}
          />

          {!collapsed.subtitle && (
            <LayerTrack
              top={356}
              layers={layers.filter((layer) => layer.type === "subtitle")}
              selectedLayerId={selectedLayerId}
              pixelsPerSecond={pixelsPerSecond}
              duration={duration}
              disabled={disabled}
              onSelect={onSelectLayer}
              onSeek={onSeek}
              onChange={onChangeLayer}
              subtitle
            />
          )}


          <TrackHeader
            label="AUDIO"
            top={418}
            collapsed={collapsed.audio}
            onToggle={() => toggleTrack("audio")}
          />

          {!collapsed.audio && audioTrack && (
            <AudioTrack
              top={456}
              track={audioTrack}
              pixelsPerSecond={pixelsPerSecond}
              duration={duration}
              disabled={disabled}
              onChange={onChangeAudio}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function TrackHeader({ label, top, collapsed, onToggle }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className="absolute left-0 z-30 flex h-9 w-28 items-center justify-between border-r border-slate-700 bg-slate-900 px-3 text-xs font-black text-slate-300"
      style={{ top }}
    >
      <span>{label}</span>
      <span>{collapsed ? "+" : "−"}</span>
    </button>
  );
}

function LayerTrack({
  top,
  layers,
  selectedLayerId,
  pixelsPerSecond,
  duration,
  disabled,
  onSelect,
  onSeek,
  onChange,
  subtitle = false,
}) {
  return (
    <div
      className="absolute left-28 right-0 h-14"
      style={{ top }}
    >
      {layers.map((layer) => {
        const left = layer.start * pixelsPerSecond;
        const width = Math.max(
          70,
          (layer.end - layer.start) * pixelsPerSecond
        );

        return (
          <div
            key={layer.id}
            className={`absolute h-12 overflow-hidden rounded-xl border-2 text-white shadow-lg ${
              selectedLayerId === layer.id
                ? "border-cyan-300 bg-cyan-600"
                : subtitle
                ? "border-violet-400 bg-violet-700"
                : "border-blue-400 bg-blue-700"
            }`}
            style={{ left, width }}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              onSelect(layer.id);
              onSeek(layer.start);
            }}
          >
            <ResizeHandle
              side="left"
              disabled={disabled}
              onDrag={(deltaPixels) => {
                const delta = deltaPixels / pixelsPerSecond;
                onChange(layer.id, {
                  start: clamp(
                    layer.start + delta,
                    0,
                    layer.end - 0.1
                  ),
                });
              }}
            />

            <button
              type="button"
              className="h-full w-full px-4 text-left"
              onClick={(event) => {
                event.stopPropagation();
                onSelect(layer.id);
                onSeek(layer.start);
              }}
            >
              <span className="block truncate text-xs font-black">
                {layer.text}
              </span>
              <span className="mt-1 block text-[10px] font-bold opacity-70">
                {formatTime(layer.start)} → {formatTime(layer.end)}
              </span>
            </button>

            <ResizeHandle
              side="right"
              disabled={disabled}
              onDrag={(deltaPixels) => {
                const delta = deltaPixels / pixelsPerSecond;
                onChange(layer.id, {
                  end: clamp(
                    layer.end + delta,
                    layer.start + 0.1,
                    duration
                  ),
                });
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function ResizeHandle({ side, disabled, onDrag }) {
  const startX = useRef(0);
  const accumulated = useRef(0);

  function pointerDown(event) {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();
    startX.current = event.clientX;
    accumulated.current = 0;

    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function pointerMove(event) {
    if (disabled || !event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const total = event.clientX - startX.current;
    const delta = total - accumulated.current;
    accumulated.current = total;

    onDrag(delta);
  }

  return (
    <span
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onClick={(event) => event.stopPropagation()}
      className={`absolute inset-y-0 z-10 w-3 touch-none cursor-ew-resize bg-white/25 ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{ touchAction: "none" }}
    />
  );
}


function AudioTrack({
  top,
  track,
  pixelsPerSecond,
  duration,
  disabled,
  onChange,
}) {
  const left = track.start * pixelsPerSecond;
  const width = Math.max(
    80,
    (track.end - track.start) * pixelsPerSecond
  );

  return (
    <div
      className="absolute left-28 right-0 h-14"
      style={{ top }}
    >
      <div
        className="absolute h-12 overflow-hidden rounded-xl border-2 border-fuchsia-400 bg-fuchsia-700 text-white shadow-lg"
        style={{ left, width }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <ResizeHandle
          side="left"
          disabled={disabled}
          onDrag={(deltaPixels) => {
            const delta = deltaPixels / pixelsPerSecond;

            onChange({
              start: clamp(
                track.start + delta,
                0,
                track.end - 0.1
              ),
            });
          }}
        />

        <div className="h-full px-4 py-2">
          <span className="block truncate text-xs font-black">
            🎵 {track.name}
          </span>

          <span className="mt-1 block text-[10px] font-bold opacity-75">
            {formatTime(track.start)} → {formatTime(track.end)}
          </span>
        </div>

        <ResizeHandle
          side="right"
          disabled={disabled}
          onDrag={(deltaPixels) => {
            const delta = deltaPixels / pixelsPerSecond;

            onChange({
              end: clamp(
                track.end + delta,
                track.start + 0.1,
                duration
              ),
            });
          }}
        />
      </div>
    </div>
  );
}
