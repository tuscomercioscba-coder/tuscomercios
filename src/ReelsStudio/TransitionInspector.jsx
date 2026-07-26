import {
  SCENE_TRANSITIONS,
} from "./motionUtils";

export default function TransitionInspector({
  clip,
  isLast,
  disabled,
  onChange,
  onPreview,
}) {
  if (!clip) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-black text-slate-950">
          Transición
        </h3>

        <p className="mt-2 text-sm font-semibold text-slate-500">
          Seleccioná una escena.
        </p>
      </section>
    );
  }

  if (isLast) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-black text-slate-950">
          Transición
        </h3>

        <p className="mt-2 text-sm font-semibold text-slate-500">
          La última escena no necesita transición de salida.
        </p>
      </section>
    );
  }

  const selected =
    SCENE_TRANSITIONS.find(
      (item) =>
        item.id ===
        (clip.transition ||
          "cut")
    ) ||
    SCENE_TRANSITIONS[0];

  return (
    <section className="rounded-[2rem] border border-cyan-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
        Entre escenas
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Transición después de{" "}
        {clip.name}
      </h3>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        El efecto se reproduce en la vista previa y también aparece al exportar.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {SCENE_TRANSITIONS.map(
          (transition) => (
            <button
              key={transition.id}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange({
                  transition:
                    transition.id,
                  transitionDuration:
                    transition.duration,
                })
              }
              className={`min-h-20 rounded-xl border p-3 text-left ${
                (clip.transition ||
                  "cut") ===
                transition.id
                  ? "border-cyan-500 bg-cyan-500 text-slate-950"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <span className="block text-sm font-black">
                {transition.label}
              </span>

              <span className="mt-1 block text-[10px] font-bold opacity-75">
                {
                  transition.description
                }
              </span>
            </button>
          )
        )}
      </div>

      {(clip.transition ||
        "cut") !== "cut" && (
        <>
          <label className="mt-5 block">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-black text-slate-700">
                Duración
              </span>

              <span className="text-xs font-black text-cyan-700">
                {Number(
                  clip.transitionDuration ??
                    selected.duration
                ).toFixed(2)}
                s
              </span>
            </div>

            <input
              type="range"
              min={0.15}
              max={1.2}
              step={0.05}
              value={Number(
                clip.transitionDuration ??
                  selected.duration
              )}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  transitionDuration:
                    Number(
                      event.target
                        .value
                    ),
                })
              }
              className="mt-3 w-full accent-cyan-600"
            />
          </label>

          <button
            type="button"
            disabled={disabled}
            onClick={onPreview}
            className="mt-4 min-h-12 w-full rounded-xl bg-slate-950 font-black text-white disabled:opacity-40"
          >
            ▶ Ver transición
          </button>
        </>
      )}
    </section>
  );
}
