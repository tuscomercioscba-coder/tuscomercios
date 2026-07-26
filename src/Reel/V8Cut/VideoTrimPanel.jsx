import { normalizeTrim } from "./videoTrimUtils";

export default function VideoTrimPanel({ scene, disabled, onChange, onSplit }) {
  if (!scene || scene.mediaType !== "video") return null;
  const trim = normalizeTrim(scene);
  const sourceDuration = Math.max(trim.sourceDuration, trim.trimEnd);
  const middle = (trim.trimStart + trim.trimEnd) / 2;
  return (
    <section className="rounded-[2rem] border border-violet-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Recortar video</p>
      <h3 className="mt-2 text-xl font-black text-slate-950">Elegí qué parte usar</h3>
      <p className="mt-2 text-sm font-semibold text-slate-500">Quitá el comienzo y el final, o dividí el mismo video en varias escenas.</p>
      <Range label="Comenzar en" min={0} max={Math.max(0.1, trim.trimEnd - 0.1)} step={0.1} value={trim.trimStart} disabled={disabled} onChange={(value)=>onChange({trimStart:Math.min(value,trim.trimEnd-0.1),duration:Math.max(0.1,trim.trimEnd-value)})}/>
      <Range label="Terminar en" min={trim.trimStart+0.1} max={Math.max(trim.trimStart+0.1,sourceDuration)} step={0.1} value={trim.trimEnd} disabled={disabled} onChange={(value)=>onChange({trimEnd:Math.max(value,trim.trimStart+0.1),duration:Math.max(0.1,value-trim.trimStart)})}/>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-black text-slate-700">Esta escena usa:</p><p className="mt-1 text-lg font-black text-violet-700">{trim.trimStart.toFixed(1)}s → {trim.trimEnd.toFixed(1)}s</p><p className="mt-1 text-xs font-bold text-slate-500">Duración final: {trim.duration.toFixed(1)} segundos</p></div>
      <button type="button" disabled={disabled || trim.duration < 0.4} onClick={()=>onSplit(middle-trim.trimStart)} className="mt-4 min-h-12 w-full rounded-xl bg-violet-600 px-4 font-black text-white disabled:opacity-40">Dividir esta escena en dos</button>
    </section>
  );
}
function Range({label,min,max,step,value,disabled,onChange}){return <label className="mt-5 block"><div className="flex items-center justify-between"><span className="text-sm font-black text-slate-700">{label}</span><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">{Number(value).toFixed(1)}s</span></div><input type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(e)=>onChange(Number(e.target.value))} className="mt-3 w-full accent-violet-600"/></label>}
