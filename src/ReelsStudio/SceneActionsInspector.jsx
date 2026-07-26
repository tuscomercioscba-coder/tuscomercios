export default function SceneActionsInspector({
  clip,
  index,
  total,
  disabled,
  onChange,
  onDuplicate,
  onDelete,
  onMoveLeft,
  onMoveRight,
}) {
  if (!clip) return null;

  return (
    <section className="rounded-[2rem] border border-rose-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">
        Controles de escena
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        {clip.name}
      </h3>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-black text-slate-700">
          Nombre de la escena
        </span>

        <input
          type="text"
          disabled={disabled}
          value={clip.name || ""}
          onChange={(event) =>
            onChange({
              name: event.target.value,
            })
          }
          className="min-h-12 w-full rounded-xl border border-slate-200 px-3 font-bold"
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={
            disabled || index <= 0
          }
          onClick={onMoveLeft}
          className="min-h-12 rounded-xl bg-slate-100 font-black text-slate-700 disabled:opacity-35"
        >
          ← Mover
        </button>

        <button
          type="button"
          disabled={
            disabled ||
            index >= total - 1
          }
          onClick={onMoveRight}
          className="min-h-12 rounded-xl bg-slate-100 font-black text-slate-700 disabled:opacity-35"
        >
          Mover →
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onDuplicate}
          className="min-h-12 rounded-xl bg-blue-50 font-black text-blue-700 disabled:opacity-35"
        >
          Duplicar
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="min-h-12 rounded-xl bg-red-50 font-black text-red-600 disabled:opacity-35"
        >
          Eliminar
        </button>
      </div>

      <label className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-3">
        <div>
          <p className="font-black text-slate-700">
            Silenciar voz
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            Mantiene la imagen, pero apaga la voz de esta escena.
          </p>
        </div>

        <input
          type="checkbox"
          checked={
            Number(
              clip.narrationVolume ??
                100
            ) === 0
          }
          onChange={(event) =>
            onChange({
              narrationVolume:
                event.target.checked
                  ? 0
                  : 100,
            })
          }
        />
      </label>
    </section>
  );
}
