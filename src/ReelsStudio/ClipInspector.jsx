import { MIN_CLIP_DURATION } from "./constants";
import { formatTime } from "./utils";

export default function ClipInspector({
  clip,
  sourceDuration,
  disabled,
  onChange,
  onDuplicate,
  onDelete,
}) {
  if (!clip) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-black text-slate-950">
          Editar escena
        </h3>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Seleccioná una escena de la línea de tiempo.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
      <h3 className="text-lg font-black text-slate-950">
        Editar {clip.name}
      </h3>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        Ajustá inicio y final mirando el video.
      </p>

      <div className="mt-5 space-y-5">
        <Range
          label="Comienza"
          min={0}
          max={Math.max(0, clip.end - MIN_CLIP_DURATION)}
          value={clip.start}
          onChange={(value) =>
            onChange({
              start: Math.min(
                value,
                clip.end - MIN_CLIP_DURATION
              ),
            })
          }
        />

        <Range
          label="Termina"
          min={clip.start + MIN_CLIP_DURATION}
          max={sourceDuration}
          value={clip.end}
          onChange={(value) =>
            onChange({
              end: Math.max(
                value,
                clip.start + MIN_CLIP_DURATION
              ),
            })
          }
        />
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm font-black text-slate-700">
          Fragmento seleccionado
        </p>
        <p className="mt-1 text-lg font-black text-blue-700">
          {formatTime(clip.start)} → {formatTime(clip.end)}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={onDuplicate}
          className="min-h-12 rounded-xl bg-blue-50 font-black text-blue-700 disabled:opacity-40"
        >
          Duplicar
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="min-h-12 rounded-xl bg-red-50 font-black text-red-600 disabled:opacity-40"
        >
          Eliminar
        </button>
      </div>
    </section>
  );
}

function Range({
  label,
  min,
  max,
  value,
  onChange,
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-700">
          {label}
        </span>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          {formatTime(value)}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="mt-3 w-full accent-blue-600"
      />
    </label>
  );
}
