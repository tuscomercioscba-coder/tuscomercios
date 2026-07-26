export default function DraftPanel({
  lastSavedAt,
  hasDraft,
  onSave,
  onLoad,
  onRemove,
}) {
  return (
    <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
      <h3 className="text-lg font-black text-slate-950">
        Guardado rápido
      </h3>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        Conserva el trabajo en este dispositivo.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSave}
          className="min-h-12 rounded-xl bg-slate-950 font-black text-white"
        >
          Guardar ahora
        </button>

        <button
          type="button"
          onClick={onLoad}
          disabled={!hasDraft}
          className="min-h-12 rounded-xl bg-blue-50 font-black text-blue-700 disabled:opacity-40"
        >
          Recuperar
        </button>
      </div>

      {lastSavedAt && (
        <p className="mt-3 text-xs font-bold text-emerald-600">
          Guardado: {lastSavedAt}
        </p>
      )}

      {hasDraft && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-3 w-full text-xs font-black text-red-500"
        >
          Eliminar guardado local
        </button>
      )}
    </section>
  );
}
