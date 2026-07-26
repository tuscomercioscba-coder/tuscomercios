import { FORMAT_SIZES, QUICK_TEMPLATES } from "../Utils/constants";

export default function QuickPanel({
  format,
  onFormat,
  onMainImage,
  onAddText,
  onAddImage,
  onAddLogo,
  onAddShape,
  onApplyTemplate,
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
        <h3 className="text-lg font-black text-slate-950">Crear rápido</h3>

        <label className="mt-4 block cursor-pointer">
          <input type="file" accept="image/*" onChange={onMainImage} className="hidden" />
          <span className="flex min-h-16 items-center justify-center rounded-2xl bg-blue-600 px-4 text-center font-black text-white shadow-lg">
            Subir foto principal
          </span>
        </label>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={onAddText} className="min-h-12 rounded-xl bg-slate-950 text-sm font-black text-white">
            Agregar texto
          </button>
          <button onClick={onAddImage} className="min-h-12 rounded-xl bg-indigo-600 text-sm font-black text-white">
            Agregar imagen
          </button>
          <button onClick={onAddLogo} className="min-h-12 rounded-xl bg-violet-600 text-sm font-black text-white">
            Agregar logo
          </button>
          <button onClick={onAddShape} className="min-h-12 rounded-xl bg-cyan-600 text-sm font-black text-white">
            Agregar forma
          </button>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
        <h3 className="text-lg font-black text-slate-950">Diseños rápidos</h3>
        <div className="mt-4 grid grid-cols-1 gap-2">
          {QUICK_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onApplyTemplate(template)}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left"
            >
              <span className="block font-black text-slate-800">{template.name}</span>
              <span className="mt-1 block text-xs font-semibold text-slate-500">
                Aplica textos, colores y fondo
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
        <h3 className="text-lg font-black text-slate-950">Formato</h3>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {Object.entries(FORMAT_SIZES).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => onFormat(key)}
              className={`rounded-2xl border p-3 text-left ${
                format === key
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <span className="block font-black">{key}</span>
              <span className="mt-1 block text-xs font-semibold">{value.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
