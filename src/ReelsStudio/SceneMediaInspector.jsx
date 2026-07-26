export default function SceneMediaInspector({
  clip,
  media,
  mediaItems,
  disabled,
  onReplace,
  onChange,
}) {
  if (!clip) return null;

  const sceneDuration = Math.max(
    0.1,
    Number(clip.end || 0) - Number(clip.start || 0)
  );

  const sourceDuration = Math.max(
    sceneDuration,
    Number(media?.duration || clip.sourceDuration || sceneDuration)
  );

  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">
        Contenido de escena
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        {clip.name}
      </h3>

      <div className="mt-4 overflow-hidden rounded-2xl bg-slate-950">
        <img
          src={media?.type === "image" ? media.url : media?.thumbnail || ""}
          alt=""
          className="aspect-video w-full object-cover"
        />
      </div>

      <p className="mt-3 truncate text-sm font-black text-slate-700">
        {media?.name || "Sin contenido"}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Info label="Tipo" value={media?.type === "image" ? "Foto" : "Video"} />
        <Info label="Duración original" value={`${sourceDuration.toFixed(1)}s`} />
        <Info label="Inicio" value={`${Number(clip.start || 0).toFixed(1)}s`} />
        <Info label="Duración escena" value={`${sceneDuration.toFixed(1)}s`} />
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-black text-slate-700">
          Cambiar contenido sin perder textos
        </span>
        <select
          disabled={disabled}
          value={media?.id || ""}
          onChange={(event) => onReplace(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold"
        >
          {mediaItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      {clip.mediaType === "image" ? (
        <>
          <Range
            label="Duración de la foto"
            min={1}
            max={30}
            step={0.5}
            value={sceneDuration}
            suffix="s"
            onChange={(duration) =>
              onChange({
                start: 0,
                end: duration,
                sourceDuration: duration,
              })
            }
          />

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-black text-slate-700">
              Movimiento de la foto
            </span>
            <select
              disabled={disabled}
              value={clip.photoMotion || "zoom-in"}
              onChange={(event) =>
                onChange({ photoMotion: event.target.value })
              }
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold"
            >
              <option value="none">Sin movimiento</option>
              <option value="zoom-in">Zoom lento</option>
              <option value="zoom-out">Alejar lentamente</option>
              <option value="pan-left">Mover hacia izquierda</option>
              <option value="pan-right">Mover hacia derecha</option>
            </select>
          </label>
        </>
      ) : (
        <>
          <Range
            label="Comenzar video en"
            min={0}
            max={Math.max(0, sourceDuration - 0.1)}
            step={0.1}
            value={Number(clip.start || 0)}
            suffix="s"
            onChange={(start) =>
              onChange({
                start,
                end: Math.max(
                  start + 0.1,
                  Math.min(sourceDuration, start + sceneDuration)
                ),
                sourceDuration,
              })
            }
          />

          <Range
            label="Terminar video en"
            min={Number(clip.start || 0) + 0.1}
            max={sourceDuration}
            step={0.1}
            value={Math.min(sourceDuration, Number(clip.end || sourceDuration))}
            suffix="s"
            onChange={(end) =>
              onChange({
                end: Math.max(end, Number(clip.start || 0) + 0.1),
                sourceDuration,
              })
            }
          />

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onChange({
                start: 0,
                end: sourceDuration,
                sourceDuration,
              })
            }
            className="mt-4 min-h-12 w-full rounded-xl bg-indigo-50 font-black text-indigo-700 disabled:opacity-40"
          >
            Usar video completo ({sourceDuration.toFixed(1)}s)
          </button>
        </>
      )}

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-black text-slate-700">
          Encuadre
        </span>
        <select
          disabled={disabled}
          value={clip.fit || "cover"}
          onChange={(event) => onChange({ fit: event.target.value })}
          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold"
        >
          <option value="cover">Llenar pantalla</option>
          <option value="contain">Mostrar completa</option>
        </select>
      </label>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function Range({ label, min, max, step, value, suffix, onChange }) {
  return (
    <label className="mt-4 block">
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-slate-700">{label}</span>
        <span className="text-xs font-black text-indigo-700">
          {Number(value).toFixed(1)}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-indigo-600"
      />
    </label>
  );
}
