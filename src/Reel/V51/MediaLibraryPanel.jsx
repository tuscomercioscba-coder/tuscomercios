export default function MediaLibraryPanel({
  items,
  selectedScene,
  disabled,
  onUse,
}) {
  return (
    <section className="rounded-[2rem] bg-white/95 shadow-xl border border-white/80 p-4 sm:p-5">
      <h3 className="text-lg font-black text-slate-950">
        Biblioteca de recursos
      </h3>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        Elegí una foto o video para la escena seleccionada.
      </p>

      {!selectedScene ? (
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
          Primero seleccioná una escena.
        </p>
      ) : items.length ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {items.map((item) => (
            <button
              key={`${item.id}-${item.src}`}
              type="button"
              onClick={() => onUse(item)}
              disabled={disabled}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 disabled:opacity-40"
              title={item.fileName}
            >
              {item.type === "video" ? (
                <video
                  src={item.src}
                  muted
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={item.src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}

              <span className="absolute bottom-1 right-1 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-black text-white">
                {item.type === "video" ? "VIDEO" : "FOTO"}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
          Todavía no hay recursos disponibles.
        </p>
      )}
    </section>
  );
}
