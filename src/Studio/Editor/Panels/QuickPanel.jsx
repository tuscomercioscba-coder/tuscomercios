import { useMemo, useState } from "react";
import {
  FORMAT_SIZES,
  MODERN_ICON_PATHS,
  MODERN_OCCASION_TEMPLATES,
  QUICK_TEMPLATES,
} from "../Utils/constants";

export default function QuickPanel({
  format,
  onFormat,
  onMainImage,
  onAddText,
  onAddImage,
  onAddLogo,
  onAddShape,
  onApplyTemplate,
}) {
  const [selectedId, setSelectedId] = useState(QUICK_TEMPLATES[0].id);
  const [catalog, setCatalog] = useState("everyday");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryCategory, setGalleryCategory] = useState("Todas");
  const [gallerySearch, setGallerySearch] = useState("");
  const [title, setTitle] = useState(QUICK_TEMPLATES[0].title);
  const [subtitle, setSubtitle] = useState(QUICK_TEMPLATES[0].subtitle);
  const allTemplates = useMemo(
    () => [...QUICK_TEMPLATES, ...MODERN_OCCASION_TEMPLATES],
    []
  );
  const selectedTemplate = useMemo(
    () => allTemplates.find((item) => item.id === selectedId) || QUICK_TEMPLATES[0],
    [allTemplates, selectedId]
  );
  const categories = useMemo(
    () => ["Todas", ...new Set(MODERN_OCCASION_TEMPLATES.map((item) => item.category))],
    []
  );
  const visibleGalleryTemplates = MODERN_OCCASION_TEMPLATES.filter(
    (item) =>
      (galleryCategory === "Todas" || item.category === galleryCategory) &&
      item.holiday.toLowerCase().includes(gallerySearch.trim().toLowerCase())
  );

  function selectTemplate(template) {
    setSelectedId(template.id);
    setTitle(template.title);
    setSubtitle(template.subtitle);
    onApplyTemplate(template);
  }

  function applyPersonalizedDesign() {
    onApplyTemplate({ ...selectedTemplate, title, subtitle });
  }

  function previewStyle(template) {
    if (template.background?.type === "solid") {
      return { background: template.background.color };
    }

    const colors = template.background?.colors || ["#0f172a", "#2563eb"];
    return {
      background: `linear-gradient(135deg, ${colors.join(", ")})`,
    };
  }

  function chooseFromGallery(template) {
    selectTemplate(template);
    setCatalog("holidays");
    setGalleryOpen(false);
  }

  function getOccasionPath(template) {
    const occasionId = String(template.id || "").split("-")[0];
    const artKey = {
      birthday: "cake",
      valentine: "heart",
      carnival: "sparkles",
      women: "star",
      school: "calendar",
      easter: "gift",
      worker: "wrench",
      may25: "flag",
      father: "heart",
      flag: "flag",
      friend: "message",
      july9: "flag",
      children: "balloon",
      spring: "sun",
      mother: "heart",
      halloween: "sparkles",
      blackfriday: "percent",
      christmas: "tree",
      newyear: "sparkles",
    }[occasionId];

    return MODERN_ICON_PATHS[artKey] || "";
  }

  function TemplatePreview({ template, large = false }) {
    const occasionPath = getOccasionPath(template);

    return (
      <span
        className={`relative flex w-full overflow-hidden rounded-2xl shadow-inner ${
          large ? "aspect-square" : "aspect-[4/3]"
        }`}
        style={previewStyle(template)}
      >
        <span className="absolute -right-[12%] -top-[8%] h-[48%] w-[48%] rounded-full border border-white/30 bg-white/10" />
        <span className="absolute -bottom-[12%] -left-[10%] h-[42%] w-[42%] rotate-12 rounded-[28%] bg-black/15" />
        <span className="absolute left-[9%] top-[10%] h-1 w-[22%] rounded-full bg-white/70" />
        {occasionPath && (
          <svg
            viewBox="0 0 24 24"
            className={`absolute right-[9%] top-[10%] text-white/80 ${
              large ? "h-[28%] w-[28%]" : "h-[26%] w-[26%]"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.45"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={occasionPath} />
          </svg>
        )}
        <span className="relative z-10 flex h-full w-full flex-col justify-end p-[9%] text-left">
          <span className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/75">
            {template.holiday || "TusComercios"}
          </span>
          <span
            className={`${large ? "text-lg sm:text-xl" : "text-[10px]"} max-w-[90%] font-black leading-[0.95]`}
            style={{ color: template.titleColor }}
          >
            {template.title}
          </span>
          {large && (
            <span className="mt-2 line-clamp-2 max-w-[80%] text-xs font-semibold text-white/75">
              {template.subtitle}
            </span>
          )}
        </span>
      </span>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          Paso 1 de 3
        </span>
        <h3 className="mt-1 text-lg font-black text-slate-950">¿Qué querés publicar?</h3>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Elegí un objetivo y te dejamos el diseño preparado.
        </p>

        <div className="mt-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setCatalog("everyday")}
            className={`min-h-10 rounded-lg text-sm font-black ${catalog === "everyday" ? "bg-white text-blue-700 shadow" : "text-slate-600"}`}
          >
            Para vender
          </button>
          <button
            type="button"
            onClick={() => setCatalog("holidays")}
            className={`min-h-10 rounded-lg text-sm font-black ${catalog === "holidays" ? "bg-white text-blue-700 shadow" : "text-slate-600"}`}
          >
            Fechas especiales
          </button>
        </div>

        {catalog === "holidays" ? (
          <div className="mt-4">
            {selectedTemplate.holiday && (
              <div className="mb-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                  Plantilla seleccionada
                </p>
                <p className="mt-1 font-black text-slate-900">
                  {selectedTemplate.holiday} · {selectedTemplate.variant}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="min-h-16 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 font-black text-white shadow-lg"
            >
              Ver galería de plantillas
              <span className="mt-1 block text-xs font-semibold text-white/75">
                57 diseños · vista grande
              </span>
            </button>
          </div>
        ) : (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {QUICK_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => selectTemplate(template)}
              className={`min-h-24 rounded-2xl border p-3 text-left transition ${
                selectedId === template.id
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <TemplatePreview template={template} />
              <span className="mt-2 block font-black text-slate-900">
                {template.name || template.variant}
              </span>
              <span className="mt-1 block text-[11px] font-semibold leading-snug text-slate-500">
                {template.description || `${template.holiday} · ${template.variant}`}
              </span>
            </button>
          ))}
        </div>
        )}
      </section>

      <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          Paso 2 de 3
        </span>
        <h3 className="mt-1 text-lg font-black text-slate-950">Agregá tu foto</h3>
        <label className="mt-4 block cursor-pointer">
          <input type="file" accept="image/*" onChange={onMainImage} className="hidden" />
          <span className="flex min-h-16 items-center justify-center rounded-2xl bg-blue-600 px-4 text-center font-black text-white shadow-lg">
            📷 Elegir foto principal
          </span>
        </label>
        <p className="mt-2 text-center text-xs font-semibold text-slate-500">
          También podés continuar sin foto y usar el fondo elegido.
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          Paso 3 de 3
        </span>
        <h3 className="mt-1 text-lg font-black text-slate-950">Escribí tu mensaje</h3>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Título</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-bold text-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Detalle</span>
            <textarea
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-semibold text-slate-900"
            />
          </label>
          <button
            type="button"
            onClick={applyPersonalizedDesign}
            className="min-h-14 w-full rounded-2xl bg-emerald-500 px-4 font-black text-white shadow-lg"
          >
            ✓ Aplicar y ver mi diseño
          </button>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
        <h3 className="text-lg font-black text-slate-950">Tamaño de publicación</h3>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {Object.entries(FORMAT_SIZES).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => onFormat(key)}
              className={`rounded-2xl border p-3 text-left ${
                format === key
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <span className="block font-black">{key}</span>
              <span className="mt-1 block text-xs font-semibold">{value.label}</span>
            </button>
          ))}
        </div>
      </section>

      <details className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-lg">
        <summary className="cursor-pointer font-black text-slate-800">Más herramientas</summary>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={onAddText} className="min-h-12 rounded-xl bg-slate-950 text-sm font-black text-white">Texto</button>
          <button onClick={onAddImage} className="min-h-12 rounded-xl bg-indigo-600 text-sm font-black text-white">Imagen</button>
          <button onClick={onAddLogo} className="min-h-12 rounded-xl bg-violet-600 text-sm font-black text-white">Logo</button>
          <button onClick={onAddShape} className="min-h-12 rounded-xl bg-cyan-600 text-sm font-black text-white">Forma</button>
        </div>
      </details>

      {galleryOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/70 p-2 backdrop-blur-md sm:p-5">
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] bg-slate-50 shadow-2xl">
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white p-4 sm:p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  TusComercios Studio
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                  Plantillas para Argentina
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Elegí un diseño. Después podés cambiar cada texto, color, forma e imagen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGalleryOpen(false)}
                className="grid size-12 shrink-0 place-items-center rounded-full bg-slate-100 text-2xl font-black text-slate-700"
                aria-label="Cerrar galería"
              >
                ×
              </button>
            </header>

            <div className="shrink-0 border-b border-slate-200 bg-white px-4 pb-4 sm:px-6">
              <input
                value={gallerySearch}
                onChange={(event) => setGallerySearch(event.target.value)}
                placeholder="Buscar: cumpleaños, Navidad, trabajador..."
                className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold text-slate-900 outline-none focus:border-blue-500"
              />
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setGalleryCategory(category)}
                    className={`min-h-10 shrink-0 rounded-xl px-4 text-sm font-black ${
                      galleryCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {visibleGalleryTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => chooseFromGallery(template)}
                    className="rounded-[1.4rem] border border-slate-200 bg-white p-2 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl"
                  >
                    <TemplatePreview template={template} large />
                    <span className="block px-2 pb-1 pt-3 font-black text-slate-900">
                      {template.holiday}
                    </span>
                    <span className="block px-2 pb-2 text-xs font-bold text-slate-500">
                      {template.variant}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
