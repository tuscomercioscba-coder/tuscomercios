export default function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onToggleHidden,
  onToggleLocked,
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-lg">
      <h3 className="text-lg font-black text-slate-950">Capas</h3>

      <div className="mt-4 space-y-2">
        {[...elements].reverse().map((element) => (
          <div
            key={element.id}
            className={`rounded-2xl border p-3 ${
              selectedId === element.id
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(element.id)}
              className="w-full text-left text-sm font-black text-slate-700"
            >
              {element.name}
            </button>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onToggleHidden(element.id)}
                className="rounded-lg bg-white px-2 py-1 text-xs font-black text-slate-500"
              >
                {element.hidden ? "Mostrar" : "Ocultar"}
              </button>
              <button
                type="button"
                onClick={() => onToggleLocked(element.id)}
                className="rounded-lg bg-white px-2 py-1 text-xs font-black text-slate-500"
              >
                {element.locked ? "Desbloquear" : "Bloquear"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
