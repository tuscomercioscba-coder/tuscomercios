import { useMemo, useState } from "react";
import { normalizeTrim, splitSceneAt } from "../V8Cut";

export default function ProfessionalTimeline({
  scenes = [],
  selectedSceneId,
  currentTime,
  disabled,
  onSelect,
  onSeek,
  onReplaceScenes,
}) {
  const [splitSeconds, setSplitSeconds] = useState(1);
  const totalDuration = useMemo(
    () => scenes.reduce((sum, scene) => sum + Math.max(0.1, Number(scene.duration || 0)), 0),
    [scenes]
  );

  let accumulated = 0;

  function splitSelected() {
    const index = scenes.findIndex((scene) => scene.id === selectedSceneId);
    if (index < 0) return;
    const scene = scenes[index];
    if (scene.mediaType !== "video") return;

    const trim = normalizeTrim(scene);
    const local = Math.max(0.1, Math.min(trim.duration - 0.1, Number(splitSeconds || 0)));
    const parts = splitSceneAt(scene, local);
    const next = [...scenes];
    next.splice(index, 1, ...parts);
    onReplaceScenes(next, parts[0].id);
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Línea de tiempo</p>
          <h3 className="mt-2 text-xl font-black text-slate-950">Cortá y ordená el video</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">Cada bloque es una escena. Tocá para editarla.</p>
        </div>
        <p className="text-sm font-black text-slate-700">Total: {totalDuration.toFixed(1)}s</p>
      </div>

      <div className="mt-5 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-2">
          {scenes.map((scene, index) => {
            const start = accumulated;
            const duration = Math.max(0.1, Number(scene.duration || 0));
            accumulated += duration;
            const width = Math.max(110, Math.min(300, duration * 28));
            const selected = scene.id === selectedSceneId;

            return (
              <button
                key={scene.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onSelect(scene.id);
                  onSeek(start);
                }}
                className={`relative h-24 shrink-0 overflow-hidden rounded-2xl border-2 p-3 text-left transition disabled:opacity-40 ${selected ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-slate-100"}`}
                style={{ width }}
              >
                {scene.media && scene.mediaType !== "video" && (
                  <img src={scene.media} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
                )}
                <div className="relative z-10">
                  <p className="text-xs font-black uppercase text-slate-500">Escena {index + 1}</p>
                  <p className="mt-1 truncate text-sm font-black text-slate-900">{scene.title || (scene.mediaType === "video" ? "Video" : "Imagen")}</p>
                  <p className="mt-2 text-xs font-black text-blue-700">{duration.toFixed(1)}s</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="text-sm font-black text-slate-700">Dividir la escena seleccionada en el segundo</span>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={splitSeconds}
            onChange={(event) => setSplitSeconds(Number(event.target.value))}
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-bold"
          />
        </label>
        <button
          type="button"
          disabled={disabled || !selectedSceneId}
          onClick={splitSelected}
          className="min-h-12 self-end rounded-xl bg-violet-600 px-5 font-black text-white disabled:opacity-40"
        >
          Cortar aquí
        </button>
      </div>
    </section>
  );
}
