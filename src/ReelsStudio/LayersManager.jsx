export default function LayersManager({
  layers,
  selectedLayerId,
  disabled,
  onSelect,
  onToggleHidden,
  onToggleLocked,
  onMoveForward,
  onMoveBackward,
  onBringFront,
  onSendBack,
  onDuplicate,
  onDelete,
}) {
  const ordered = [
    ...layers,
  ].sort(
    (a, b) =>
      Number(b.zIndex || 0) -
      Number(a.zIndex || 0)
  );

  return (
    <section className="rounded-[2rem] border border-violet-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">
        Capas del Reel
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Orden y visibilidad
      </h3>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        La primera capa de la lista aparece por delante de las demás.
      </p>

      {!ordered.length ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-center text-sm font-bold text-slate-500">
          Todavía no agregaste textos, subtítulos ni stickers.
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {ordered.map(
            (layer) => {
              const selected =
                layer.id ===
                selectedLayerId;

              return (
                <article
                  key={layer.id}
                  className={`rounded-2xl border p-3 ${
                    selected
                      ? "border-violet-500 bg-violet-50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      onSelect(
                        layer.id
                      )
                    }
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                      {getIcon(layer)}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black text-slate-800">
                        {layer.name}
                      </span>

                      <span className="mt-1 block text-[10px] font-bold text-slate-500">
                        {Number(
                          layer.start || 0
                        ).toFixed(1)}
                        s →{" "}
                        {Number(
                          layer.end || 0
                        ).toFixed(1)}
                        s
                      </span>
                    </span>

                    <span className="text-[10px] font-black text-slate-400">
                      #{Number(
                        layer.zIndex ||
                          0
                      )}
                    </span>
                  </button>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <SmallButton
                      label={
                        layer.hidden
                          ? "👁"
                          : "👁️"
                      }
                      title={
                        layer.hidden
                          ? "Mostrar"
                          : "Ocultar"
                      }
                      onClick={() =>
                        onToggleHidden(
                          layer.id
                        )
                      }
                    />

                    <SmallButton
                      label={
                        layer.locked
                          ? "🔒"
                          : "🔓"
                      }
                      title={
                        layer.locked
                          ? "Desbloquear"
                          : "Bloquear"
                      }
                      onClick={() =>
                        onToggleLocked(
                          layer.id
                        )
                      }
                    />

                    <SmallButton
                      label="↑"
                      title="Subir una capa"
                      onClick={() =>
                        onMoveForward(
                          layer.id
                        )
                      }
                    />

                    <SmallButton
                      label="↓"
                      title="Bajar una capa"
                      onClick={() =>
                        onMoveBackward(
                          layer.id
                        )
                      }
                    />

                    <SmallButton
                      label="Frente"
                      title="Traer al frente"
                      onClick={() =>
                        onBringFront(
                          layer.id
                        )
                      }
                    />

                    <SmallButton
                      label="Fondo"
                      title="Enviar al fondo"
                      onClick={() =>
                        onSendBack(
                          layer.id
                        )
                      }
                    />

                    <SmallButton
                      label="Duplicar"
                      title="Duplicar"
                      onClick={() =>
                        onDuplicate(
                          layer.id
                        )
                      }
                    />

                    <SmallButton
                      danger
                      label="Eliminar"
                      title="Eliminar"
                      onClick={() =>
                        onDelete(
                          layer.id
                        )
                      }
                    />
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}

function getIcon(layer) {
  if (
    layer.type === "sticker"
  ) {
    return layer.stickerSrc ? (
      <img src={layer.stickerSrc} alt="" className="h-8 w-8 object-contain" />
    ) : layer.sticker;
  }

  if (
    layer.type ===
    "subtitle"
  ) {
    return "💬";
  }

  return "📝";
}

function SmallButton({
  label,
  title,
  onClick,
  danger,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`min-h-9 rounded-lg px-1 text-[10px] font-black ${
        danger
          ? "bg-red-100 text-red-600"
          : "bg-white text-slate-700 shadow-sm"
      }`}
    >
      {label}
    </button>
  );
}
