import { TEXT_POSITIONS } from "./layerUtils";
import { formatTime } from "./utils";

export default function LayerInspector({
  layer,
  currentTime,
  projectDuration,
  disabled,
  onChange,
  onSetStart,
  onSetEnd,
  onDuplicate,
  onDelete,
}) {
  if (!layer) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-black text-slate-950">
          Editar texto
        </h3>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Agregá o seleccioná un texto del timeline.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
      <h3 className="text-lg font-black text-slate-950">
        Editar {layer.name}
      </h3>

      <div className="mt-4 space-y-4">
        <Field label="Contenido">
          <textarea
            rows={3}
            value={layer.text}
            disabled={disabled}
            onChange={(event) => onChange({ text: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 p-3 font-bold"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Color">
            <input
              type="color"
              value={layer.color}
              disabled={disabled}
              onChange={(event) => onChange({ color: event.target.value })}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white"
            />
          </Field>

          <Field label="Fuente">
            <select
              value={layer.fontFamily}
              disabled={disabled}
              onChange={(event) => onChange({ fontFamily: event.target.value })}
              className="min-h-11 w-full rounded-xl border border-slate-200 px-3 font-bold"
            >
              <option value="Arial">Arial</option>
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Georgia">Georgia</option>
              <option value="Impact">Impact</option>
            </select>
          </Field>
        </div>

        <Range
          label="Tamaño"
          min={18}
          max={140}
          value={layer.fontSize}
          onChange={(value) => onChange({ fontSize: value })}
        />

        <Field label="Ubicación">
          <div className="grid grid-cols-3 gap-2">
            {TEXT_POSITIONS.map((position) => (
              <button
                key={position.id}
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange({
                    position: position.id,
                    y:
                      position.id === "top"
                        ? 18
                        : position.id === "bottom"
                        ? 82
                        : 50,
                  })
                }
                className={`min-h-11 rounded-xl text-xs font-black ${
                  layer.position === position.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {position.label}
              </button>
            ))}
          </div>
        </Field>

        <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
          <span className="font-black text-slate-700">Fondo del texto</span>
          <input
            type="checkbox"
            checked={Boolean(layer.backgroundEnabled)}
            disabled={disabled}
            onChange={(event) =>
              onChange({ backgroundEnabled: event.target.checked })
            }
          />
        </label>

        {layer.backgroundEnabled && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Color de fondo">
              <input
                type="color"
                value={layer.backgroundColor}
                disabled={disabled}
                onChange={(event) =>
                  onChange({ backgroundColor: event.target.value })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white"
              />
            </Field>

            <Range
              label="Opacidad"
              min={0}
              max={100}
              value={Math.round(layer.backgroundOpacity * 100)}
              onChange={(value) =>
                onChange({ backgroundOpacity: value / 100 })
              }
            />
          </div>
        )}

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-700">
            Aparición
          </p>
          <p className="mt-1 text-lg font-black text-blue-700">
            {formatTime(layer.start)} → {formatTime(layer.end)}
          </p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            Cursor actual: {formatTime(currentTime)}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={onSetStart}
              className="min-h-11 rounded-xl bg-white font-black text-slate-700"
            >
              Iniciar aquí
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={onSetEnd}
              className="min-h-11 rounded-xl bg-white font-black text-slate-700"
            >
              Finalizar aquí
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={onDuplicate}
            className="min-h-12 rounded-xl bg-blue-50 font-black text-blue-700"
          >
            Duplicar
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="min-h-12 rounded-xl bg-red-50 font-black text-red-600"
          >
            Eliminar
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Range({ label, min, max, value, onChange }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-slate-700">{label}</span>
        <span className="text-xs font-black text-blue-700">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-blue-600"
      />
    </label>
  );
}
