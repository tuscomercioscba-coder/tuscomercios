import { BACKGROUND_PRESETS } from "../Utils/constants";

export default function BackgroundPanel({ background, onChange }) {
  const solidColor =
    background?.type === "solid" ? background.color : "#0f172a";

  return (
    <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
      <h3 className="text-lg font-black text-slate-950">Fondo</h3>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {BACKGROUND_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.value)}
            className="h-12 rounded-xl border-2 border-white shadow"
            style={{
              background:
                preset.value.type === "solid"
                  ? preset.value.color
                  : `linear-gradient(135deg, ${preset.value.colors.join(",")})`,
            }}
            title={preset.label}
          />
        ))}
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-black text-slate-700">Color personalizado</span>
        <input
          type="color"
          value={solidColor}
          onChange={(event) =>
            onChange({ type: "solid", color: event.target.value })
          }
          className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white"
        />
      </label>
    </section>
  );
}
