import { useState } from "react";

const OBJECTIVES = [
  { id: "offer", icon: "🔥", name: "Vender una oferta", title: "OFERTA ESPECIAL", subtitle: "Escribinos y aprovechala hoy." },
  { id: "product", icon: "✨", name: "Mostrar un producto", title: "NUEVO INGRESO", subtitle: "Conocé todos los detalles." },
  { id: "service", icon: "🛠️", name: "Promocionar un servicio", title: "ESTAMOS PARA AYUDARTE", subtitle: "Pedí tu presupuesto sin compromiso." },
  { id: "business", icon: "🏪", name: "Presentar mi negocio", title: "CONOCÉ NUESTRO NEGOCIO", subtitle: "Te esperamos. Escribinos para saber más." },
];

export default function ReelQuickStartPanel({
  hasContent,
  onChooseMedia,
  onCreateCopy,
  onOpenMusic,
  onExport,
}) {
  const [selected, setSelected] = useState(OBJECTIVES[0]);

  return (
    <section className="rounded-[2rem] border border-blue-100 bg-white p-4 shadow-xl">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
        Modo guiado
      </span>
      <h2 className="mt-1 text-2xl font-black text-slate-950">Creá tu Reel en 4 pasos</h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        No necesitás saber editar. Empezá eligiendo qué querés lograr.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {OBJECTIVES.map((objective) => (
          <button
            key={objective.id}
            type="button"
            onClick={() => setSelected(objective)}
            className={`min-h-24 rounded-2xl border p-3 text-left ${
              selected.id === objective.id
                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">{objective.icon}</span>
            <span className="mt-1 block text-sm font-black text-slate-900">{objective.name}</span>
          </button>
        ))}
      </div>

      <ol className="mt-5 space-y-2">
        <li>
          <button type="button" onClick={onChooseMedia} className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-blue-600 px-4 text-left font-black text-white">
            <span className="grid size-8 place-items-center rounded-full bg-white/20">1</span>
            {hasContent ? "Agregar más fotos o videos" : "Elegir fotos o videos"}
          </button>
        </li>
        <li>
          <button
            type="button"
            disabled={!hasContent}
            onClick={() => onCreateCopy(selected)}
            className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-slate-950 px-4 text-left font-black text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span className="grid size-8 place-items-center rounded-full bg-white/15">2</span>
            Agregar textos sugeridos
          </button>
        </li>
        <li>
          <button type="button" disabled={!hasContent} onClick={onOpenMusic} className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-violet-600 px-4 text-left font-black text-white disabled:opacity-35">
            <span className="grid size-8 place-items-center rounded-full bg-white/15">3</span>
            Agregar música o voz
          </button>
        </li>
        <li>
          <button type="button" disabled={!hasContent} onClick={onExport} className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-emerald-500 px-4 text-left font-black text-white disabled:opacity-35">
            <span className="grid size-8 place-items-center rounded-full bg-white/20">4</span>
            Revisar y descargar
          </button>
        </li>
      </ol>
    </section>
  );
}
