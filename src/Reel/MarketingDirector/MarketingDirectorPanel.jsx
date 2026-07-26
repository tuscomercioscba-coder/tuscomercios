import {
  OFFICIAL_CAMPAIGNS,
  SUBTITLE_PRESETS,
} from "./campaigns";

export default function MarketingDirectorPanel({
  selectedCampaignId,
  selectedSubtitlePreset,
  mediaCount,
  disabled,
  onCampaign,
  onSubtitlePreset,
  onCreate,
  onOpenCapture,
}) {
  const selected = OFFICIAL_CAMPAIGNS.find(
    (item) => item.id === selectedCampaignId
  );

  return (
    <section className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-4 text-white shadow-2xl sm:p-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
          Solo workspace
        </p>

        <h3 className="mt-2 text-xl font-black">
          Marketing Director
        </h3>

        <p className="mt-2 text-sm font-semibold text-blue-100">
          Elegí una campaña oficial, cargá capturas o grabaciones reales y Studio arma el Reel.
        </p>
      </div>

      <div className="mt-5 grid gap-2">
        {OFFICIAL_CAMPAIGNS.map((campaign) => (
          <button
            key={campaign.id}
            type="button"
            disabled={disabled}
            onClick={() => onCampaign(campaign.id)}
            className={`rounded-2xl border p-3 text-left transition disabled:opacity-40 ${
              selectedCampaignId === campaign.id
                ? "border-cyan-300 bg-white text-slate-950"
                : "border-white/15 bg-white/10 text-white"
            }`}
          >
            <p className="font-black">
              {campaign.label}
            </p>

            <p className={`mt-1 text-xs font-semibold ${
              selectedCampaignId === campaign.id
                ? "text-slate-500"
                : "text-blue-100"
            }`}>
              {campaign.description}
            </p>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-5 rounded-2xl bg-black/20 p-4">
          <p className="font-black text-cyan-200">
            Guion de grabación
          </p>

          <ol className="mt-3 space-y-2 text-sm font-semibold text-blue-50">
            {selected.steps.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={onOpenCapture}
            disabled={disabled}
            className="mt-4 min-h-12 w-full rounded-xl bg-cyan-400 px-4 font-black text-slate-950 disabled:opacity-40"
          >
            Abrir herramientas de captura
          </button>
        </div>
      )}

      <div className="mt-5">
        <p className="mb-2 text-sm font-black">
          Estilo de subtítulos
        </p>

        <div className="grid grid-cols-3 gap-2">
          {SUBTITLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onSubtitlePreset(preset.id)}
              className={`min-h-11 rounded-xl px-2 text-xs font-black ${
                selectedSubtitlePreset === preset.id
                  ? "bg-violet-500 text-white"
                  : "bg-white/10 text-blue-100"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-white/10 p-3 text-sm font-bold text-blue-100">
        Recursos cargados: {mediaCount}
      </div>

      <button
        type="button"
        onClick={onCreate}
        disabled={disabled || !selectedCampaignId || mediaCount < 1}
        className="mt-4 min-h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 font-black text-slate-950 shadow-xl disabled:opacity-40"
      >
        Crear campaña profesional
      </button>
    </section>
  );
}
