import { useMemo, useState } from "react";
import {
  REEL_TEMPLATE_CATEGORIES,
  REEL_TEMPLATES,
} from "./reelTemplateCatalog";

function Preview({ template }) {
  return (
    <span
      className="relative block aspect-[9/16] overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(155deg, ${template.palette.join(", ")})`,
      }}
    >
      <span className="absolute -right-8 top-8 size-28 rounded-full border border-white/30 bg-white/10" />
      <span className="absolute -left-10 bottom-24 size-32 rotate-12 rounded-[2rem] bg-black/20" />
      <span className="absolute left-5 top-6 h-1 w-12 rounded-full bg-white/80" />
      <span className="absolute inset-x-4 bottom-8">
        <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-white/70">
          {template.name}
        </span>
        <span className="mt-2 block text-lg font-black leading-[0.95] text-white">
          {template.title}
        </span>
        <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-[8px] font-black text-slate-950">
          {template.styleName}
        </span>
      </span>
    </span>
  );
}

export default function ReelTemplateGallery({ onApply }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Todas");
  const [search, setSearch] = useState("");

  const visible = useMemo(
    () =>
      REEL_TEMPLATES.filter(
        (template) =>
          (category === "Todas" || template.category === category) &&
          `${template.name} ${template.styleName}`
            .toLowerCase()
            .includes(search.trim().toLowerCase())
      ),
    [category, search]
  );

  function apply(template) {
    onApply(template);
    setOpen(false);
  }

  return (
    <>
      <section className="rounded-[2rem] border border-violet-100 bg-white p-4 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
          Reels listos para editar
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Empezá con una plantilla
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Incluyen cuatro escenas, movimiento, textos y transiciones.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 min-h-16 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 font-black text-white shadow-lg"
        >
          Ver 57 Reels editables
          <span className="mt-1 block text-xs font-semibold text-white/75">
            Comerciales y fechas especiales
          </span>
        </button>
      </section>

      {open && (
        <div className="fixed inset-0 z-[120] flex flex-col bg-slate-950/75 p-2 backdrop-blur-md sm:p-5">
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] bg-slate-50 shadow-2xl">
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white p-4 sm:p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
                  Reels Studio
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                  Plantillas profesionales
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Elegí una y presioná Reproducir. Después reemplazá su contenido.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-12 shrink-0 place-items-center rounded-full bg-slate-100 text-2xl font-black text-slate-700"
              >
                ×
              </button>
            </header>

            <div className="shrink-0 border-b border-slate-200 bg-white px-4 pb-4 sm:px-6">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar Navidad, cumpleaños, trabajador..."
                className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold outline-none focus:border-violet-500"
              />
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {REEL_TEMPLATE_CATEGORIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`min-h-10 shrink-0 rounded-xl px-4 text-sm font-black ${
                      category === item
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {visible.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => apply(template)}
                    className="rounded-[1.4rem] border border-slate-200 bg-white p-2 text-left shadow-sm transition hover:-translate-y-1 hover:border-violet-400 hover:shadow-xl"
                  >
                    <Preview template={template} />
                    <span className="block px-2 pb-1 pt-3 text-sm font-black text-slate-900">
                      {template.name}
                    </span>
                    <span className="block px-2 pb-2 text-xs font-bold text-slate-500">
                      {template.styleName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
