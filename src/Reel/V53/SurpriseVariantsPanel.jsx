export default function SurpriseVariantsPanel({
  variants = [],
  selectedId = "",
  disabled,
  onChoose,
}) {
  if (!variants.length) return null;

  return (
    <section className="rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-4 shadow-xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">
            Tus 3 versiones
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Elegí la que más te guste. Después podés editar todo.
          </p>
        </div>

        <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-black text-white">
          Sorprendeme
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
        {variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            disabled={disabled}
            onClick={() => onChoose(variant)}
            className={`rounded-2xl border p-4 text-left transition disabled:opacity-40 ${
              selectedId === variant.id
                ? "border-violet-600 bg-violet-600 text-white shadow-xl"
                : "border-slate-200 bg-white text-slate-800 hover:border-violet-300"
            }`}
          >
            <p className="font-black">
              {variant.label}
            </p>

            <p
              className={`mt-1 text-sm font-semibold ${
                selectedId === variant.id
                  ? "text-violet-100"
                  : "text-slate-500"
              }`}
            >
              {variant.description}
            </p>

            <p
              className={`mt-3 text-xs font-black uppercase tracking-wide ${
                selectedId === variant.id
                  ? "text-white"
                  : "text-violet-600"
              }`}
            >
              {variant.scenes.length} escenas · {Math.round(variant.duration)}s
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
