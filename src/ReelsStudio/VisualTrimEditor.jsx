import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { formatTime } from "./utils";

export default function VisualTrimEditor({
  clip,
  media,
  disabled,
  onChange,
  onSeekProjectTime,
  projectStart = 0,
}) {
  const videoRef = useRef(null);
  const railRef = useRef(null);

  const [previewTime, setPreviewTime] =
    useState(0);

  const [dragging, setDragging] =
    useState("");

  const sourceDuration =
    Math.max(
      0.1,
      Number(
        media?.duration ||
          clip?.sourceDuration ||
          (clip
            ? clip.end -
              clip.start
            : 0.1)
      )
    );

  const start =
    Math.max(
      0,
      Number(clip?.start || 0)
    );

  const end =
    Math.max(
      start + 0.1,
      Math.min(
        sourceDuration,
        Number(
          clip?.end ||
            sourceDuration
        )
      )
    );

  const sceneDuration =
    end - start;

  const startPercent =
    (start / sourceDuration) *
    100;

  const endPercent =
    (end / sourceDuration) *
    100;

  const previewPercent =
    (previewTime /
      sourceDuration) *
    100;

  const thumbnails =
    useMemo(
      () =>
        Array.from(
          { length: 10 },
          (_, index) => ({
            id: index,
            left: index * 10,
          })
        ),
      []
    );

  useEffect(() => {
    setPreviewTime(start);

    if (
      videoRef.current &&
      media?.type === "video"
    ) {
      try {
        videoRef.current.currentTime =
          start;
      } catch {}
    }
  }, [
    clip?.id,
    media?.id,
  ]);

  useEffect(() => {
    if (!dragging) return;

    const move = (event) => {
      if (!railRef.current) return;

      const rect =
        railRef.current.getBoundingClientRect();

      const percent =
        Math.max(
          0,
          Math.min(
            1,
            (event.clientX -
              rect.left) /
              rect.width
          )
        );

      const time =
        percent *
        sourceDuration;

      if (
        dragging === "start"
      ) {
        const nextStart =
          Math.min(
            time,
            end - 0.1
          );

        onChange({
          start: nextStart,
          sourceDuration,
        });

        setPreviewTime(
          nextStart
        );

        seekPreview(
          nextStart
        );

        onSeekProjectTime?.(
          projectStart
        );
      }

      if (
        dragging === "end"
      ) {
        const nextEnd =
          Math.max(
            time,
            start + 0.1
          );

        onChange({
          end: nextEnd,
          sourceDuration,
        });

        setPreviewTime(
          nextEnd
        );

        seekPreview(
          nextEnd
        );

        onSeekProjectTime?.(
          projectStart +
            (nextEnd -
              start)
        );
      }

      if (
        dragging === "cursor"
      ) {
        setPreviewTime(time);
        seekPreview(time);

        const local =
          Math.max(
            0,
            Math.min(
              sceneDuration,
              time - start
            )
          );

        onSeekProjectTime?.(
          projectStart +
            local
        );
      }
    };

    const stop = () =>
      setDragging("");

    window.addEventListener(
      "pointermove",
      move
    );

    window.addEventListener(
      "pointerup",
      stop,
      { once: true }
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        move
      );

      window.removeEventListener(
        "pointerup",
        stop
      );
    };
  }, [
    dragging,
    sourceDuration,
    start,
    end,
    sceneDuration,
    projectStart,
    onChange,
    onSeekProjectTime,
  ]);

  function seekPreview(time) {
    if (
      videoRef.current &&
      media?.type === "video"
    ) {
      try {
        videoRef.current.currentTime =
          time;
      } catch {}
    }
  }

  function setCutFromPointer(
    event
  ) {
    if (
      disabled ||
      !railRef.current
    ) {
      return;
    }

    const rect =
      railRef.current.getBoundingClientRect();

    const percent =
      Math.max(
        0,
        Math.min(
          1,
          (event.clientX -
            rect.left) /
            rect.width
        )
      );

    const time =
      percent *
      sourceDuration;

    setPreviewTime(time);
    seekPreview(time);
  }

  if (
    !clip ||
    !media ||
    media.type !== "video"
  ) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-cyan-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
        Editor visual de recorte
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Mirá y recortá
      </h3>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        Arrastrá los extremos. La imagen cambia mientras elegís el inicio y el final.
      </p>

      <video
        ref={videoRef}
        src={media.url}
        controls
        playsInline
        preload="auto"
        className="mt-4 aspect-video w-full rounded-2xl bg-black object-contain"
        onTimeUpdate={(event) =>
          setPreviewTime(
            event.currentTarget
              .currentTime || 0
          )
        }
      />

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Info
          label="Inicio"
          value={formatTime(start)}
        />

        <Info
          label="Cursor"
          value={formatTime(
            previewTime
          )}
        />

        <Info
          label="Final"
          value={formatTime(end)}
        />
      </div>

      <div
        ref={railRef}
        className="relative mt-5 h-28 overflow-hidden rounded-2xl bg-slate-950 select-none"
        onPointerDown={
          setCutFromPointer
        }
      >
        <div className="absolute inset-0 grid grid-cols-10">
          {thumbnails.map(
            (thumb) => (
              <div
                key={thumb.id}
                className="border-r border-white/10 bg-gradient-to-br from-slate-800 to-slate-950"
              >
                <img
                  src={
                    media.thumbnail ||
                    ""
                  }
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover opacity-75"
                />
              </div>
            )
          )}
        </div>

        <div
          className="absolute inset-y-0 bg-black/65"
          style={{
            left: 0,
            width: `${startPercent}%`,
          }}
        />

        <div
          className="absolute inset-y-0 bg-black/65"
          style={{
            left: `${endPercent}%`,
            right: 0,
          }}
        />

        <div
          className="absolute inset-y-0 border-y-4 border-cyan-400"
          style={{
            left: `${startPercent}%`,
            width: `${
              endPercent -
              startPercent
            }%`,
          }}
        />

        <button
          type="button"
          disabled={disabled}
          onPointerDown={(
            event
          ) => {
            event.stopPropagation();
            setDragging("start");
          }}
          className="absolute inset-y-0 z-20 w-6 -translate-x-1/2 cursor-ew-resize bg-cyan-400 shadow-xl disabled:opacity-40"
          style={{
            left: `${startPercent}%`,
          }}
          title="Arrastrar inicio"
        >
          <span className="text-slate-950">
            ‹
          </span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onPointerDown={(
            event
          ) => {
            event.stopPropagation();
            setDragging("end");
          }}
          className="absolute inset-y-0 z-20 w-6 -translate-x-1/2 cursor-ew-resize bg-cyan-400 shadow-xl disabled:opacity-40"
          style={{
            left: `${endPercent}%`,
          }}
          title="Arrastrar final"
        >
          <span className="text-slate-950">
            ›
          </span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onPointerDown={(
            event
          ) => {
            event.stopPropagation();
            setDragging("cursor");
          }}
          className="absolute inset-y-0 z-30 w-0.5 cursor-ew-resize bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.95)]"
          style={{
            left: `${previewPercent}%`,
          }}
          title="Mover cursor"
        >
          <span className="absolute -left-2 top-0 h-0 w-0 border-x-[8px] border-t-[12px] border-x-transparent border-t-red-500" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const next =
              Math.max(
                0,
                Math.min(
                  previewTime,
                  end - 0.1
                )
              );

            onChange({
              start: next,
              sourceDuration,
            });

            onSeekProjectTime?.(
              projectStart
            );
          }}
          className="min-h-12 rounded-xl bg-cyan-50 font-black text-cyan-800 disabled:opacity-40"
        >
          Inicio = cursor
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const next =
              Math.min(
                sourceDuration,
                Math.max(
                  previewTime,
                  start + 0.1
                )
              );

            onChange({
              end: next,
              sourceDuration,
            });

            onSeekProjectTime?.(
              projectStart +
                (next - start)
            );
          }}
          className="min-h-12 rounded-xl bg-cyan-50 font-black text-cyan-800 disabled:opacity-40"
        >
          Final = cursor
        </button>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onChange({
            start: 0,
            end: sourceDuration,
            sourceDuration,
          });

          setPreviewTime(0);
          seekPreview(0);

          onSeekProjectTime?.(
            projectStart
          );
        }}
        className="mt-3 min-h-12 w-full rounded-xl bg-slate-950 font-black text-white disabled:opacity-40"
      >
        Usar video completo
      </button>
    </section>
  );
}

function Info({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}
