export default function MediaTransformInspector({
  clip,
  media,
  disabled,
  onChange,
  onReset,
}) {
  if (!clip || !media) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
        Transformar contenido
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Mover, achicar y encuadrar
      </h3>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        Seleccioná la imagen o video sobre el canvas y acomodalo dentro de la zona segura.
      </p>

      <div className="mt-5 space-y-4">
        <Range
          label="Escala"
          min={20}
          max={300}
          step={1}
          value={Number(
            clip.mediaScale ?? 100
          )}
          suffix="%"
          onChange={(mediaScale) =>
            onChange({ mediaScale })
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <Range
            label="Posición X"
            min={0}
            max={100}
            step={1}
            value={Number(
              clip.mediaX ?? 50
            )}
            suffix="%"
            onChange={(mediaX) =>
              onChange({ mediaX })
            }
          />

          <Range
            label="Posición Y"
            min={0}
            max={100}
            step={1}
            value={Number(
              clip.mediaY ?? 50
            )}
            suffix="%"
            onChange={(mediaY) =>
              onChange({ mediaY })
            }
          />
        </div>

        <Range
          label="Rotación"
          min={-180}
          max={180}
          step={1}
          value={Number(
            clip.mediaRotation || 0
          )}
          suffix="°"
          onChange={(mediaRotation) =>
            onChange({
              mediaRotation,
            })
          }
        />

        <Range
          label="Opacidad"
          min={0}
          max={100}
          step={1}
          value={Number(
            clip.mediaOpacity ?? 100
          )}
          suffix="%"
          onChange={(mediaOpacity) =>
            onChange({
              mediaOpacity,
            })
          }
        />

        <Range
          label="Esquinas redondeadas"
          min={0}
          max={120}
          step={1}
          value={Number(
            clip.mediaBorderRadius || 0
          )}
          suffix="px"
          onChange={(mediaBorderRadius) =>
            onChange({
              mediaBorderRadius,
            })
          }
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onChange({
                fit: "cover",
              })
            }
            className={`min-h-12 rounded-xl font-black ${
              (clip.fit || "cover") ===
              "cover"
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Llenar
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onChange({
                fit: "contain",
              })
            }
            className={`min-h-12 rounded-xl font-black ${
              clip.fit === "contain"
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Completa
          </button>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={onReset}
          className="min-h-12 w-full rounded-xl bg-slate-950 font-black text-white disabled:opacity-40"
        >
          Restablecer encuadre
        </button>
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

        <span className="text-xs font-black text-emerald-700">
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
            Number(event.target.value)
          )
        }
        className="mt-3 w-full accent-emerald-600"
      />
    </label>
  );
}
