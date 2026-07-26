import {
  ENTRANCE_ANIMATIONS,
  EXIT_ANIMATIONS,
  LOOP_ANIMATIONS,
} from "./motionUtils";

export default function MotionInspector({
  layer,
  disabled,
  onChange,
}) {
  if (!layer) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-black text-slate-950">
          Animaciones
        </h3>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Seleccioná un texto o subtítulo.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-violet-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
        Motion Designer
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Movimiento de {layer.name}
      </h3>

      <div className="mt-5 space-y-4">
        <Select
          label="Animación de entrada"
          value={layer.entranceAnimation || "fade"}
          options={ENTRANCE_ANIMATIONS}
          disabled={disabled}
          onChange={(value) =>
            onChange({ entranceAnimation: value })
          }
        />

        <Range
          label="Duración de entrada"
          min={0.1}
          max={1.5}
          step={0.05}
          value={Number(layer.entranceDuration ?? 0.35)}
          suffix="s"
          disabled={disabled}
          onChange={(value) =>
            onChange({ entranceDuration: value })
          }
        />

        <Select
          label="Mientras está visible"
          value={layer.loopAnimation || "none"}
          options={LOOP_ANIMATIONS}
          disabled={disabled}
          onChange={(value) =>
            onChange({ loopAnimation: value })
          }
        />

        <Select
          label="Animación de salida"
          value={layer.exitAnimation || "fade"}
          options={EXIT_ANIMATIONS}
          disabled={disabled}
          onChange={(value) =>
            onChange({ exitAnimation: value })
          }
        />

        <Range
          label="Duración de salida"
          min={0.1}
          max={1.5}
          step={0.05}
          value={Number(layer.exitDuration ?? 0.3)}
          suffix="s"
          disabled={disabled}
          onChange={(value) =>
            onChange({ exitDuration: value })
          }
        />
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  options,
  disabled,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Range({
  label,
  min,
  max,
  step,
  value,
  suffix,
  disabled,
  onChange,
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-700">
          {label}
        </span>
        <span className="text-xs font-black text-violet-700">
          {Number(value).toFixed(2)}{suffix}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="mt-3 w-full accent-violet-600"
      />
    </label>
  );
}
