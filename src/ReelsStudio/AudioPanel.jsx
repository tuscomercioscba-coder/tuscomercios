import { useRef } from "react";
import { BUILT_IN_MUSIC } from "./builtInMusic";

export default function AudioPanel({
  track,
  projectDuration,
  disabled,
  onUpload,
  onChange,
  onRemove,
  onUsePreset,
  onSyncBeat,
}) {
  const inputRef = useRef(null);

  return (
    <section className="rounded-[2rem] border border-fuchsia-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-700">
        Audio
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Música del Reel
      </h3>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        Elegí una base original o subí música propia. Las escenas pueden
        sincronizarse automáticamente con su ritmo.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {BUILT_IN_MUSIC.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onUsePreset(preset)}
            className="min-h-20 rounded-2xl border border-fuchsia-100 bg-gradient-to-br from-white to-fuchsia-50 p-3 text-left disabled:opacity-40"
          >
            <span className="block text-sm font-black text-slate-900">
              {preset.name}
            </span>
            <span className="mt-1 block text-[11px] font-bold text-fuchsia-700">
              {preset.mood} · {preset.bpm} BPM
            </span>
          </button>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg"
        onChange={onUpload}
        className="hidden"
      />

      {!track ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-4 min-h-14 w-full rounded-2xl bg-fuchsia-600 px-4 font-black text-white disabled:opacity-40"
        >
          🎵 Subir música
        </button>
      ) : (
        <div className="mt-4 space-y-4">
          <audio
            src={track.url}
            controls
            className="w-full"
          />

          <p className="truncate text-xs font-black text-slate-500">
            {track.name}
          </p>

          {track.bpm && (
            <button
              type="button"
              onClick={() => onSyncBeat(track.bpm)}
              className="min-h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 font-black text-white"
            >
              ✨ Sincronizar escenas a {track.bpm} BPM
            </button>
          )}

          <Range
            label="Volumen"
            min={0}
            max={100}
            step={1}
            value={track.volume}
            suffix="%"
            onChange={(value) =>
              onChange({ volume: value })
            }
          />

          <Range
            label="Comienza en el Reel"
            min={0}
            max={Math.max(0, projectDuration - 0.1)}
            step={0.1}
            value={track.start}
            suffix="s"
            onChange={(value) =>
              onChange({
                start: Math.min(value, track.end - 0.1),
              })
            }
          />

          <Range
            label="Termina en el Reel"
            min={track.start + 0.1}
            max={projectDuration}
            step={0.1}
            value={track.end}
            suffix="s"
            onChange={(value) =>
              onChange({
                end: Math.max(value, track.start + 0.1),
              })
            }
          />

          <Range
            label="Entrada suave"
            min={0}
            max={5}
            step={0.1}
            value={track.fadeIn}
            suffix="s"
            onChange={(value) =>
              onChange({ fadeIn: value })
            }
          />

          <Range
            label="Salida suave"
            min={0}
            max={5}
            step={0.1}
            value={track.fadeOut}
            suffix="s"
            onChange={(value) =>
              onChange({ fadeOut: value })
            }
          />

          <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
            <span className="font-black text-slate-700">
              Silenciar música
            </span>

            <input
              type="checkbox"
              checked={Boolean(track.muted)}
              onChange={(event) =>
                onChange({
                  muted: event.target.checked,
                })
              }
            />
          </label>

          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="min-h-12 w-full rounded-xl bg-red-50 font-black text-red-600 disabled:opacity-40"
          >
            Quitar música
          </button>
        </div>
      )}
    </section>
  );
}

function Range({
  label,
  min,
  max,
  step,
  value,
  suffix,
  onChange,
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-700">
          {label}
        </span>

        <span className="text-xs font-black text-fuchsia-700">
          {Number(value).toFixed(step < 1 ? 1 : 0)}{suffix}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="mt-3 w-full accent-fuchsia-600"
      />
    </label>
  );
}
