import { formatTime } from "./utils";

export default function LayerTimeline({
  layers,
  duration,
  selectedLayerId,
  pixelsPerSecond,
  disabled,
  onSelect,
  onChange,
}) {
  if (!duration) return null;

  const width = Math.max(900, duration * pixelsPerSecond);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
      <div>
        <h3 className="text-lg font-black text-slate-950">
          Capas de texto y subtítulos
        </h3>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Cada bloque muestra exactamente cuándo aparece y desaparece.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl bg-slate-950">
        <div className="relative min-h-[170px]" style={{ width }}>
          {layers.length ? (
            layers.map((layer, index) => {
              const left = layer.start * pixelsPerSecond;
              const blockWidth = Math.max(
                60,
                (layer.end - layer.start) * pixelsPerSecond
              );

              return (
                <button
                  key={layer.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(layer.id)}
                  className={`absolute h-12 overflow-hidden rounded-xl border-2 px-3 text-left text-white shadow-lg ${
                    selectedLayerId === layer.id
                      ? "border-cyan-300 bg-cyan-600"
                      : layer.type === "subtitle"
                      ? "border-violet-400 bg-violet-700"
                      : "border-blue-400 bg-blue-700"
                  }`}
                  style={{
                    left,
                    top: 18 + index * 56,
                    width: blockWidth,
                  }}
                >
                  <span className="block truncate text-xs font-black">
                    {layer.name}: {layer.text}
                  </span>
                  <span className="mt-1 block text-[10px] font-bold opacity-75">
                    {formatTime(layer.start)} → {formatTime(layer.end)}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="absolute inset-0 flex items-center justify-center p-5 text-center text-sm font-bold text-slate-400">
              Agregá un texto o subtítulo en el momento actual del video.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
