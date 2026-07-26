import SceneCanvasEditor from "./SceneCanvasEditor";
import {
  FRAME_PRESETS,
  getDefaultFraming,
} from "./sceneFraming";

export default function SceneFramingPanel({
  scene,
  disabled,
  onChange,
}) {
  if (!scene) return null;

  const framing = getDefaultFraming(scene);

  return (
    <section className="rounded-[2rem] border border-blue-100 bg-white p-4 shadow-xl sm:p-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          Editor visual de escena
        </p>

        <h3 className="mt-2 text-xl font-black text-slate-950">
          Elegí exactamente qué mostrar
        </h3>

        <p className="mt-2 text-sm font-semibold text-slate-500">
          Especialmente útil para grabaciones horizontales dentro de un Reel vertical.
        </p>
      </div>

      <div className="mt-5">
        <SceneCanvasEditor
          scene={{
            ...scene,
            ...framing,
          }}
          disabled={disabled}
          onChange={onChange}
        />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-black text-slate-800">
          Cómo mostrar el contenido
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onChange({
                mediaFit: "cover",
                mediaZoom: Math.max(
                  1,
                  Number(scene.mediaZoom || 1)
                ),
              })
            }
            className={`min-h-12 rounded-xl px-3 text-sm font-black ${
              framing.mediaFit === "cover"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Llenar pantalla
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onChange({
                mediaFit: "contain",
                mediaZoom: 1,
              })
            }
            className={`min-h-12 rounded-xl px-3 text-sm font-black ${
              framing.mediaFit === "contain"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Mostrar completa
          </button>
        </div>
      </div>

      <Range
        label="Acercamiento de la foto o video"
        value={Math.round(framing.mediaZoom * 100)}
        min={50}
        max={250}
        suffix="%"
        disabled={disabled}
        onChange={(value) =>
          onChange({
            mediaZoom: value / 100,
          })
        }
      />

      <Range
        label="Rotar contenido"
        value={Math.round(framing.mediaRotation)}
        min={-45}
        max={45}
        suffix="°"
        disabled={disabled}
        onChange={(value) =>
          onChange({
            mediaRotation: value,
          })
        }
      />

      <div className="mt-5">
        <p className="mb-2 text-sm font-black text-slate-800">
          Ubicación rápida
        </p>

        <div className="grid grid-cols-3 gap-2">
          {FRAME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange({
                  mediaFocalX: preset.focalX,
                  mediaFocalY: preset.focalY,
                })
              }
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-black text-slate-700 disabled:opacity-40"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onChange({
            mediaFit: "cover",
            mediaZoom: 1,
            mediaFocalX: 50,
            mediaFocalY: 50,
            mediaRotation: 0,
          })
        }
        className="mt-5 min-h-12 w-full rounded-xl border border-slate-200 bg-white font-black text-slate-700 disabled:opacity-40"
      >
        Restaurar encuadre
      </button>
    </section>
  );
}

function Range({
  label,
  value,
  min,
  max,
  suffix,
  disabled,
  onChange,
}) {
  return (
    <label className="mt-5 block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-700">
          {label}
        </span>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          {value}{suffix}
        </span>
      </div>

      <input
        type="range"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="mt-3 w-full accent-blue-600"
      />
    </label>
  );
}
