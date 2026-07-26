export default function ProjectPanel({
  onSaveProject,
  onLoadProject,
  exportScale,
  onExportScale,
  exportFormat,
  onExportFormat,
}) {
  return (
    <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
      <h3 className="text-lg font-black text-slate-950">Proyecto y descarga</h3>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSaveProject}
          className="min-h-12 rounded-xl bg-slate-950 font-black text-white"
        >
          Guardar proyecto
        </button>

        <label className="cursor-pointer">
          <input
            type="file"
            accept=".json,application/json"
            onChange={onLoadProject}
            className="hidden"
          />
          <span className="flex min-h-12 items-center justify-center rounded-xl bg-blue-50 px-2 text-center font-black text-blue-700">
            Abrir proyecto
          </span>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-black text-slate-700">Formato</span>
          <select
            value={exportFormat}
            onChange={(event) => onExportFormat(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-bold"
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="webp">WebP</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-black text-slate-700">Calidad</span>
          <select
            value={exportScale}
            onChange={(event) => onExportScale(Number(event.target.value))}
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-bold"
          >
            <option value={1}>Normal</option>
            <option value={2}>Alta 2x</option>
            <option value={4}>Máxima 4x</option>
          </select>
        </label>
      </div>
    </section>
  );
}
