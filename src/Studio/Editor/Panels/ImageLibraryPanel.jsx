export default function ImageLibraryPanel({ images = [], selectedId, onUseImage }) {
  if (!images.length) return null;

  return (
    <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
      <h3 className="text-lg font-black text-slate-950">Fotos disponibles</h3>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Tocá una foto para colocarla en el elemento seleccionado.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            disabled={!selectedId}
            onClick={() => onUseImage(src)}
            className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 disabled:opacity-40"
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}
