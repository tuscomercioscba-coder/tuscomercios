import { createSubtitle, normalizeSubtitles } from "./subtitleUtils";

export default function SubtitleTimelinePanel({ scene, disabled, onChange }) {
  if (!scene) return null;
  const subtitles = normalizeSubtitles(scene);
  const duration = Math.max(0.1, Number(scene.duration || 3));

  function updateSubtitle(id, changes) {
    onChange({
      subtitles: subtitles.map((item) => item.id === id ? { ...item, ...changes } : item),
    });
  }

  function removeSubtitle(id) {
    onChange({ subtitles: subtitles.filter((item) => item.id !== id) });
  }

  return (
    <section className="rounded-[2rem] border border-amber-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Subtítulos por tiempo</p>
      <h3 className="mt-2 text-xl font-black text-slate-950">Elegí cuándo aparece cada texto</h3>
      <p className="mt-2 text-sm font-semibold text-slate-500">Podés agregar varios subtítulos en una misma escena.</p>

      <div className="mt-5 space-y-4">
        {subtitles.map((subtitle, index) => (
          <div key={subtitle.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-slate-800">Subtítulo {index + 1}</p>
              <button type="button" disabled={disabled} onClick={() => removeSubtitle(subtitle.id)} className="text-xs font-black text-red-600 disabled:opacity-40">Eliminar</button>
            </div>

            <textarea
              rows="2"
              value={subtitle.text}
              disabled={disabled}
              onChange={(event) => updateSubtitle(subtitle.id, { text: event.target.value })}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 font-bold"
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <TimeField label="Desde" value={subtitle.start} max={Math.max(0, subtitle.end - 0.1)} disabled={disabled} onChange={(value) => updateSubtitle(subtitle.id, { start: Math.max(0, Math.min(value, subtitle.end - 0.1)) })} />
              <TimeField label="Hasta" value={subtitle.end} min={subtitle.start + 0.1} max={duration} disabled={disabled} onChange={(value) => updateSubtitle(subtitle.id, { end: Math.max(subtitle.start + 0.1, Math.min(value, duration)) })} />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange({ subtitles: [...subtitles, createSubtitle(scene)] })}
        className="mt-4 min-h-12 w-full rounded-xl bg-amber-500 px-4 font-black text-slate-950 disabled:opacity-40"
      >
        Agregar subtítulo
      </button>

      <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-800">
        La transcripción automática de voz se agregará después con reconocimiento de audio. Esta versión deja el sistema de tiempos listo y permite importar o escribir subtítulos sin costo de IA.
      </div>
    </section>
  );
}

function TimeField({ label, value, min = 0, max, disabled, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step="0.1"
        value={Number(value).toFixed(1)}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold"
      />
    </label>
  );
}
