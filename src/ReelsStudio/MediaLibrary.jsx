import { useRef } from "react";

export default function MediaLibrary({
  mediaItems,
  selectedMediaId,
  disabled,
  onUpload,
  onSelect,
  onAddScene,
  onReplaceScene,
  hasSelectedScene,
  onRemove,
}) {
  const inputRef = useRef(null);

  return (
    <section className="rounded-[2rem] border border-blue-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
        Bandeja del proyecto
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Fotos, videos y grabaciones
      </h3>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        Seleccioná una escena y reemplazá su fondo sin perder textos ni efectos.
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
        onChange={onUpload}
        className="hidden"
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-4 min-h-14 w-full rounded-2xl bg-blue-600 px-4 font-black text-white disabled:opacity-40"
      >
        + Subir fotos y videos
      </button>

      {!mediaItems.length ? (
        <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center">
          <p className="font-black text-slate-700">
            La bandeja está vacía
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Podés seleccionar varios archivos juntos.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {mediaItems.map((item) => {
            const selected =
              item.id === selectedMediaId;

            return (
              <article
                key={item.id}
                className={`overflow-hidden rounded-2xl border-2 bg-slate-50 ${
                  selected
                    ? "border-blue-500"
                    : "border-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-950">
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={
                          item.thumbnail ||
                          item.url
                        }
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}

                    <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-black text-white">
                      {item.type === "image"
                        ? "FOTO"
                        : item.origin ===
                          "recording"
                        ? "GRABACIÓN"
                        : "VIDEO"}
                    </span>
                  </div>

                  <div className="p-3">
                    <p className="truncate text-xs font-black text-slate-800">
                      {item.name}
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-slate-500">
                      {item.type === "image"
                        ? "Duración inicial: 4s"
                        : `${Number(
                            item.duration || 0
                          ).toFixed(1)}s`}
                    </p>
                  </div>
                </button>

                <div className="grid gap-2 p-2 pt-0">
                  <button
                    type="button"
                    disabled={!hasSelectedScene}
                    onClick={() => onReplaceScene(item.id)}
                    className="min-h-11 rounded-xl bg-blue-600 px-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    Reemplazar fondo
                  </button>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onAddScene(item.id)
                    }
                    className="min-h-10 rounded-xl bg-emerald-500 px-2 text-xs font-black text-slate-950"
                  >
                    + Escena
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onRemove(item.id)
                    }
                    className="min-h-10 rounded-xl bg-red-50 px-3 text-xs font-black text-red-600"
                    title="Quitar de la bandeja"
                  >
                    ×
                  </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
