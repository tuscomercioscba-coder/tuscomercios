export default function CanvasControls({
  snapEnabled,
  showSafeArea,
  showRulers,
  safePreset,
  selectedLayer,
  onToggleSnap,
  onToggleSafeArea,
  onToggleRulers,
  onChangeSafePreset,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Toggle
          active={snapEnabled}
          label="🧲 Ajuste magnético"
          onClick={onToggleSnap}
        />

        <Toggle
          active={showSafeArea}
          label="▣ Zona segura"
          onClick={onToggleSafeArea}
        />

        <Toggle
          active={showRulers}
          label="📏 Reglas"
          onClick={onToggleRulers}
        />

        <select
          value={safePreset}
          onChange={(event) =>
            onChangeSafePreset(
              event.target.value
            )
          }
          className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700"
        >
          <option value="instagram">
            Instagram Reels
          </option>
          <option value="tiktok">
            TikTok
          </option>
          <option value="shorts">
            YouTube Shorts
          </option>
        </select>
      </div>

      {selectedLayer && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          <Metric
            label="X"
            value={`${Number(
              selectedLayer.x ?? 50
            ).toFixed(1)}%`}
          />

          <Metric
            label="Y"
            value={`${Number(
              selectedLayer.y ?? 50
            ).toFixed(1)}%`}
          />

          <Metric
            label="W"
            value={`${Number(
              selectedLayer.boxWidth ??
                52
            ).toFixed(1)}%`}
          />

          <Metric
            label="H"
            value={`${Number(
              selectedLayer.boxHeight ??
                14
            ).toFixed(1)}%`}
          />
        </div>
      )}
    </section>
  );
}

function Toggle({
  active,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-xl px-3 text-xs font-black ${
        active
          ? "bg-blue-600 text-white"
          : "bg-white text-slate-700 shadow-sm"
      }`}
    >
      {label}
    </button>
  );
}

function Metric({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white p-2 text-center shadow-sm">
      <p className="text-[10px] font-black uppercase text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}
