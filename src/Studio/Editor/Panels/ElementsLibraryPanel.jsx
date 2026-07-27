import { useMemo, useState } from "react";
import {
  MODERN_ICON_LIBRARY,
  MODERN_STICKER_LIBRARY,
} from "../Utils/constants";

export default function ElementsLibraryPanel({
  onAddIcon,
  onAddSticker,
  onAddLine,
}) {
  const [section, setSection] = useState("icons");
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const source =
    section === "icons" ? MODERN_ICON_LIBRARY : MODERN_STICKER_LIBRARY;
  const categories = useMemo(
    () => ["Todos", ...new Set(source.map((item) => item.category))],
    [source]
  );
  const visible = source.filter(
    (item) =>
      (category === "Todos" || item.category === category) &&
      item.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  function changeSection(next) {
    setSection(next);
    setCategory("Todos");
    setSearch("");
  }

  return (
    <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
      <h3 className="text-lg font-black text-slate-950">Elementos modernos</h3>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Íconos vectoriales y etiquetas editables para tu diseño.
      </p>

      <div className="mt-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => changeSection("icons")}
          className={`min-h-10 rounded-lg text-sm font-black ${
            section === "icons" ? "bg-white text-blue-700 shadow" : "text-slate-600"
          }`}
        >
          Íconos
        </button>
        <button
          type="button"
          onClick={() => changeSection("stickers")}
          className={`min-h-10 rounded-lg text-sm font-black ${
            section === "stickers" ? "bg-white text-blue-700 shadow" : "text-slate-600"
          }`}
        >
          Stickers
        </button>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={`Buscar ${section === "icons" ? "ícono" : "sticker"}...`}
        className="mt-3 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-bold text-slate-900 outline-none focus:border-blue-500"
      />

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`min-h-9 shrink-0 rounded-lg px-3 text-xs font-black ${
              category === item
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {section === "icons" ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {visible.map((icon) => (
            <button
              key={icon.id}
              type="button"
              onClick={() => onAddIcon(icon)}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-2 text-center transition hover:border-blue-400 hover:bg-blue-50"
              title={icon.label}
            >
              <span className="mx-auto grid aspect-square w-full place-items-center rounded-xl bg-white text-slate-700 shadow-sm group-hover:text-blue-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={icon.path} />
                </svg>
              </span>
              <span className="mt-2 block truncate text-[10px] font-black text-slate-600">
                {icon.label}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-2">
          {visible.map((sticker) => (
            <button
              key={sticker.id}
              type="button"
              onClick={() => onAddSticker(sticker)}
              className="min-h-13 rounded-xl border-2 px-3 py-3 text-sm font-black tracking-wide shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: sticker.fill,
                color: sticker.color,
                borderColor: sticker.stroke,
                borderRadius: `${Math.min(sticker.cornerRadius, 24)}px`,
              }}
            >
              {sticker.label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAddLine}
        className="mt-4 min-h-12 w-full rounded-xl bg-slate-900 font-black text-white"
      >
        Agregar línea decorativa
      </button>
    </section>
  );
}
