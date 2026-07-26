const POSITIONS = [
  ["top-left", "↖"],
  ["top-center", "↑"],
  ["top-right", "↗"],
  ["center-left", "←"],
  ["center", "●"],
  ["center-right", "→"],
  ["bottom-left", "↙"],
  ["bottom-center", "↓"],
  ["bottom-right", "↘"],
];

export default function PositionPanel({
  disabled,
  onPosition,
}) {
  return (
    <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
      <h3 className="text-lg font-black text-slate-950">
        Ubicación rápida
      </h3>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        Coloca el elemento seleccionado en una zona exacta.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {POSITIONS.map(([id, symbol]) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onPosition(id)}
            className="aspect-square rounded-xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700 disabled:opacity-40"
          >
            {symbol}
          </button>
        ))}
      </div>
    </section>
  );
}
