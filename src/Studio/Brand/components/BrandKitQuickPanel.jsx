export default function BrandKitQuickPanel({ brandKit, onApply, onAddLogo }) {
  const colors = [
    brandKit?.colors?.primary,
    brandKit?.colors?.secondary,
    brandKit?.colors?.accent,
    brandKit?.colors?.background,
    brandKit?.colors?.text,
  ].filter(Boolean);

  const logo = brandKit?.logos?.primary || "";

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
          {logo ? (
            <img src={logo} alt="Logo del Brand Kit" className="h-full w-full object-contain p-1" />
          ) : (
            <span className="text-2xl">🎨</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Brand Kit conectado
          </p>
          <p className="truncate font-black text-slate-950">
            {brandKit?.identity?.businessName || "Identidad del negocio"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <span
            key={`${color}-${index}`}
            className="h-8 w-8 rounded-full border-2 border-white shadow ring-1 ring-slate-200"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onApply}
          className="min-h-11 rounded-xl bg-blue-600 px-3 text-sm font-black text-white"
        >
          Aplicar marca
        </button>
        <button
          type="button"
          onClick={onAddLogo}
          disabled={!logo}
          className="min-h-11 rounded-xl bg-slate-950 px-3 text-sm font-black text-white disabled:opacity-40"
        >
          Agregar logo
        </button>
      </div>
    </section>
  );
}
