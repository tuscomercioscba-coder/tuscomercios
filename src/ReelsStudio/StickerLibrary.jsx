import { useMemo, useState } from "react";
import { MODERN_STICKERS, STICKER_CATEGORIES } from "./modernStickerCatalog";

export default function StickerLibrary({ disabled, onAdd }) {
  const [categoryId, setCategoryId] = useState("ventas");
  const [search, setSearch] = useState("");

  const items = useMemo(
    () =>
      MODERN_STICKERS.filter(
        (item) =>
          item.category === categoryId &&
          (!search.trim() ||
            `${item.name} ${item.id}`
              .toLowerCase()
              .includes(search.trim().toLowerCase()))
      ),
    [categoryId, search]
  );

  return (
    <section className="rounded-[2rem] border border-yellow-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-700">
        Stickers modernos
      </p>
      <h3 className="mt-2 text-xl font-black text-slate-950">
        Diseños estilo social
      </h3>
      <p className="mt-2 text-sm font-semibold text-slate-500">
        Stickers SVG nítidos, modernos y consistentes.
      </p>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar sticker..."
        className="mt-4 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-bold"
      />

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {STICKER_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategoryId(item.id)}
            className={`min-h-10 shrink-0 rounded-xl px-3 text-xs font-black ${
              categoryId === item.id
                ? "bg-yellow-400 text-slate-950"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            title={item.name}
            onClick={() => onAdd(item)}
            className="group overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-2 transition hover:-translate-y-0.5 hover:border-yellow-300 hover:bg-yellow-50 disabled:opacity-40"
          >
            <img
              src={item.src}
              alt={item.name}
              className="aspect-square w-full object-contain transition group-hover:scale-105"
              draggable={false}
            />
            <span className="mt-1 block truncate text-[10px] font-black text-slate-600">
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
