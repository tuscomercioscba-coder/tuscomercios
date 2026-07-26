import { useMemo, useRef, useState } from "react";
import { TIMELINE_ZOOMS } from "./constants";
import { clamp, formatTime } from "./utils";

export default function TimelinePro({
  clips,
  duration,
  currentTime,
  selectedClipId,
  thumbnails,
  disabled,
  onSeek,
  onSelect,
  onReorder,
}) {
  const trackRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [draggedClipId, setDraggedClipId] = useState("");

  const pixelsPerSecond = 34 * zoom;
  const totalWidth = Math.max(900, duration * pixelsPerSecond);
  const cursorLeft = currentTime * pixelsPerSecond;

  const ticks = useMemo(() => {
    const step = zoom >= 8 ? 0.5 : zoom >= 4 ? 1 : zoom >= 2 ? 2 : 5;
    const list = [];

    for (let time = 0; time <= duration; time += step) {
      list.push(time);
    }

    return list;
  }, [duration, zoom]);

  function seekFromPointer(event) {
    if (disabled || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const scrollLeft = trackRef.current.parentElement?.scrollLeft || 0;
    const x = event.clientX - rect.left + scrollLeft;
    const time = clamp(x / pixelsPerSecond, 0, duration);

    onSeek(time);
  }

  if (!duration || !clips.length) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-black text-slate-950">
          Línea de tiempo
        </h3>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Cuando subas un video aparecerá aquí completo.
        </p>
      </section>
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
            Arrastrá escenas, mové el cursor y hacé zoom para cortar con precisión.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {TIMELINE_ZOOMS.map((value) => (
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

      <div className="mt-5 overflow-x-auto rounded-2xl bg-slate-950">
        <div
          ref={trackRef}
          className="relative min-h-[250px] select-none"
          style={{ width: totalWidth }}
          onPointerDown={seekFromPointer}
        >
          <div className="absolute inset-x-0 top-0 h-8 border-b border-slate-700 bg-slate-900">
            {ticks.map((time) => (
              <div
                key={time}
                className="absolute top-0 h-full border-l border-slate-600"
                style={{ left: time * pixelsPerSecond }}
              >
                <span className="absolute left-1 top-1 text-[10px] font-bold text-slate-400">
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>

          <div className="absolute left-0 right-0 top-8 h-24 overflow-hidden bg-slate-900">
            {thumbnails.map((thumbnail) => (
              <img
                key={`${thumbnail.time}-${thumbnail.src}`}
                src={thumbnail.src}
                alt=""
                draggable={false}
                className="absolute top-0 h-24 object-cover opacity-80"
                style={{
                  left: thumbnail.time * pixelsPerSecond,
                  width: Math.max(80, (duration / Math.max(1, thumbnails.length - 1)) * pixelsPerSecond),
                }}
              />
            ))}
          </div>

          <div className="absolute left-0 right-0 top-[140px] flex h-20 gap-1 px-1">
            {clips.map((clip, index) => {
              const width = Math.max(
                60,
                (clip.end - clip.start) * pixelsPerSecond
              );

              const selected = selectedClipId === clip.id;

              return (
                <button
                  key={clip.id}
                  type="button"
                  draggable={!disabled}
                  disabled={disabled}
                  onDragStart={() => setDraggedClipId(clip.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    onReorder(draggedClipId, index);
                    setDraggedClipId("");
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(clip.id);
                    onSeek(clip.start);
                  }}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    onSelect(clip.id);
                    onSeek(clip.start);
                  }}
                  className={`relative shrink-0 overflow-hidden rounded-xl border-2 px-3 text-left transition ${
                    selected
                      ? "border-blue-300 bg-blue-600 text-white shadow-lg"
                      : "border-slate-600 bg-slate-800 text-white"
                  }`}
                  style={{ width }}
                >
                  <span className="block truncate text-xs font-black uppercase tracking-wide opacity-80">
                    {clip.name}
                  </span>

                  <span className="mt-2 block text-xs font-bold">
                    {(clip.end - clip.start).toFixed(2)}s
                  </span>

                  <span className="absolute inset-y-0 left-0 w-2 bg-white/20" />
                  <span className="absolute inset-y-0 right-0 w-2 bg-white/20" />
                </button>
              );
            })}
          </div>

          <div
            className="absolute bottom-0 top-0 z-30 w-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.95)]"
            style={{ left: cursorLeft }}
          >
            <div className="absolute -left-2 top-0 h-0 w-0 border-x-[8px] border-t-[12px] border-x-transparent border-t-red-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
