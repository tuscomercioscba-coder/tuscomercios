export default function MusicPanel({
  musicUrl,
  musicName,
  volume,
  fadeIn,
  fadeOut,
  disabled,
  inputRef,
  onUpload,
  onRemove,
  onVolume,
  onFadeIn,
  onFadeOut,
}) {
  return (
    <section className="rounded-[2rem] bg-white/95 shadow-xl border border-white/80 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">
            Música
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Subí un audio propio o libre de derechos.
          </p>
        </div>

        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
          Opcional
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg"
        onChange={onUpload}
        className="hidden"
      />

      {musicUrl ? (
        <div className="mt-4">
          <audio
            src={musicUrl}
            controls
            className="w-full"
          />

          <p className="mt-2 truncate text-xs font-bold text-slate-500">
            {musicName || "Música del Reel"}
          </p>

          <div className="mt-4 space-y-4">
            <Range
              label="Volumen"
              value={volume}
              min={0}
              max={100}
              suffix="%"
              disabled={disabled}
              onChange={onVolume}
            />

            <div className="grid grid-cols-2 gap-3">
              <Range
                label="Entrada suave"
                value={fadeIn}
                min={0}
                max={5}
                step={0.5}
                suffix="s"
                disabled={disabled}
                onChange={onFadeIn}
              />

              <Range
                label="Salida suave"
                value={fadeOut}
                min={0}
                max={5}
                step={0.5}
                suffix="s"
                disabled={disabled}
                onChange={onFadeOut}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="mt-4 min-h-11 w-full rounded-xl bg-red-50 font-black text-red-600 disabled:opacity-40"
          >
            Quitar música
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="mt-4 min-h-16 w-full rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 px-4 font-black text-violet-700 disabled:opacity-40"
        >
          Subir música
        </button>
      )}
    </section>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  disabled,
  onChange,
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-700">
          {label}
        </span>
        <span className="text-xs font-black text-violet-700">
          {value}{suffix}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-violet-600"
      />
    </label>
  );
}
