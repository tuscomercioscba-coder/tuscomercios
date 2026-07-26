import {
  SOCIAL_PRESETS,
} from "../Utils/constants";

export default function SocialResizePanel({
  currentFormat,
  onApply,
}) {
  return (
    <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
      <h3 className="text-lg font-black text-slate-950">
        Adaptar a redes
      </h3>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        Cambia el tamaño manteniendo todos los elementos.
      </p>

      <div className="mt-4 space-y-2">
        {SOCIAL_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApply(preset)}
            className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left ${
              currentFormat === preset.format
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <span className="font-black">
              {preset.label}
            </span>

            <span className="text-xs font-black text-slate-400">
              {preset.width}×{preset.height}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
