export default function CompositionInspector({
  clip,
  mediaItems,
  disabled,
  onChange,
}) {
  if (!clip) return null;

  const videoItems =
    mediaItems.filter(
      (item) =>
        item.type === "video"
    );

  return (
    <section className="rounded-[2rem] border border-amber-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
        Composición avanzada
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Pantalla y voz
      </h3>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        Podés mostrar dos contenidos juntos o conservar la voz de otro video mientras enseñás una grabación.
      </p>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-black text-slate-700">
          Diseño de pantalla
        </span>

        <select
          disabled={disabled}
          value={clip.compositionMode || "single"}
          onChange={(event) =>
            onChange({
              compositionMode:
                event.target.value,
            })
          }
          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold"
        >
          <option value="single">
            Pantalla completa
          </option>
          <option value="split-horizontal">
            Dividir arriba / abajo
          </option>
          <option value="split-vertical">
            Dividir izquierda / derecha
          </option>
        </select>
      </label>

      {(clip.compositionMode ===
        "split-horizontal" ||
        clip.compositionMode ===
          "split-vertical") && (
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-black text-slate-700">
            Segundo contenido
          </span>

          <select
            disabled={disabled}
            value={
              clip.secondaryMediaId ||
              ""
            }
            onChange={(event) =>
              onChange({
                secondaryMediaId:
                  event.target.value,
              })
            }
            className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold"
          >
            <option value="">
              Elegir foto o video
            </option>

            {mediaItems.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              )
            )}
          </select>
        </label>
      )}

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-black text-slate-700">
          Audio principal de esta escena
        </span>

        <select
          disabled={disabled}
          value={
            clip.narrationMediaId ||
            clip.mediaId ||
            ""
          }
          onChange={(event) =>
            onChange({
              narrationMediaId:
                event.target.value,
            })
          }
          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold"
        >
          <option value="">
            Sin voz del video
          </option>

          {videoItems.map(
            (item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            )
          )}
        </select>
      </label>

      <Range
        label="Volumen de la voz"
        min={0}
        max={100}
        step={1}
        value={Number(
          clip.narrationVolume ?? 100
        )}
        suffix="%"
        onChange={(value) =>
          onChange({
            narrationVolume: value,
          })
        }
      />

      <Range
        label="La voz comienza en"
        min={0}
        max={Math.max(
          0,
          Number(
            videoItems.find(
              (item) =>
                item.id ===
                (clip.narrationMediaId ||
                  clip.mediaId)
            )?.duration || 0
          ) - 0.1
        )}
        step={0.1}
        value={Number(
          clip.narrationStart || 0
        )}
        suffix="s"
        onChange={(value) =>
          onChange({
            narrationStart: value,
          })
        }
      />

      <div className="mt-5 rounded-2xl bg-amber-50 p-4">
        <p className="text-sm font-black text-amber-900">
          Ejemplo recomendado
        </p>

        <p className="mt-2 text-xs font-semibold text-amber-800">
          Elegí la grabación de pantalla como contenido principal y tu filmación hablando como “Audio principal”. Así se ve la página mientras continúa escuchándose tu explicación.
        </p>
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
    <label className="mt-4 block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-700">
          {label}
        </span>

        <span className="text-xs font-black text-amber-700">
          {Number(value).toFixed(
            step < 1 ? 1 : 0
          )}
          {suffix}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={Math.max(min, max)}
        step={step}
        value={Math.min(
          Math.max(value, min),
          Math.max(min, max)
        )}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="mt-3 w-full accent-amber-600"
      />
    </label>
  );
}
