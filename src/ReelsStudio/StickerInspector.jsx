export default function StickerInspector({
  layer,
  disabled,
  projectDuration,
  onChange,
  onDuplicate,
  onDelete,
}) {
  if (
    !layer ||
    layer.type !== "sticker"
  ) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-yellow-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-700">
        Editar sticker
      </p>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
          {layer.stickerSrc ? (
            <img src={layer.stickerSrc} alt={layer.name} className="h-full w-full object-contain" />
          ) : (
            <span className="text-5xl">{layer.sticker}</span>
          )}
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-950">
            {layer.name}
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            También se puede editar directamente sobre el video.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <Range
          label="Tamaño"
          min={24}
          max={320}
          step={1}
          value={Number(
            layer.stickerSize || 96
          )}
          suffix="px"
          onChange={(stickerSize) =>
            onChange({
              stickerSize,
            })
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <Range
            label="Posición X"
            min={2}
            max={98}
            step={1}
            value={Number(
              layer.x ?? 50
            )}
            suffix="%"
            onChange={(x) =>
              onChange({ x })
            }
          />

          <Range
            label="Posición Y"
            min={2}
            max={98}
            step={1}
            value={Number(
              layer.y ?? 50
            )}
            suffix="%"
            onChange={(y) =>
              onChange({ y })
            }
          />
        </div>

        <Range
          label="Rotación"
          min={-180}
          max={180}
          step={1}
          value={Number(
            layer.rotation || 0
          )}
          suffix="°"
          onChange={(rotation) =>
            onChange({
              rotation,
            })
          }
        />

        <Range
          label="Opacidad"
          min={0}
          max={100}
          step={1}
          value={Math.round(
            Number(
              layer.opacity ?? 1
            ) * 100
          )}
          suffix="%"
          onChange={(value) =>
            onChange({
              opacity:
                value / 100,
            })
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <Range
            label="Comienza"
            min={0}
            max={Math.max(
              0,
              projectDuration - 0.2
            )}
            step={0.1}
            value={Number(
              layer.start || 0
            )}
            suffix="s"
            onChange={(start) =>
              onChange({
                start: Math.min(
                  start,
                  layer.end - 0.1
                ),
              })
            }
          />

          <Range
            label="Termina"
            min={Number(
              layer.start || 0
            ) + 0.1}
            max={projectDuration}
            step={0.1}
            value={Number(
              layer.end ||
                projectDuration
            )}
            suffix="s"
            onChange={(end) =>
              onChange({
                end: Math.max(
                  end,
                  layer.start + 0.1
                ),
              })
            }
          />
        </div>

        <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
          <span className="font-black text-slate-700">
            Sombra
          </span>

          <input
            type="checkbox"
            checked={Boolean(
              layer.shadowEnabled
            )}
            onChange={(event) =>
              onChange({
                shadowEnabled:
                  event.target
                    .checked,
              })
            }
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-black text-slate-700">
            Animación
          </span>

          <select
            value={
              layer.animation ||
              "pop"
            }
            onChange={(event) =>
              onChange({
                animation:
                  event.target
                    .value,
              })
            }
            className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold"
          >
            <option value="none">
              Sin animación
            </option>
            <option value="fade">
              Aparecer
            </option>
            <option value="pop">
              Pop
            </option>
            <option value="slide-up">
              Subir
            </option>
            <option value="bounce">
              Rebote
            </option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={onDuplicate}
            className="min-h-12 rounded-xl bg-blue-50 font-black text-blue-700 disabled:opacity-40"
          >
            Duplicar
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="min-h-12 rounded-xl bg-red-50 font-black text-red-600 disabled:opacity-40"
          >
            Eliminar
          </button>
        </div>
      </div>
    </section>
  );
}

function Range({
  label,
  min,
  max,
  step,
  value,
  suffix,
  onChange,
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-700">
          {label}
        </span>

        <span className="text-xs font-black text-yellow-700">
          {Number(value).toFixed(
            step < 1 ? 1 : 0
          )}
          {suffix}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="mt-3 w-full accent-yellow-500"
      />
    </label>
  );
}
