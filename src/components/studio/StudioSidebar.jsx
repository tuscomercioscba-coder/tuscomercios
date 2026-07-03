export default function StudioSidebar({ active = "inicio", setActive }) {
  const items = [
    ["inicio", "🏠 Inicio"],
    ["crear", "✨ Crear"],
    ["biblioteca", "📚 Biblioteca"],
    ["marketing", "📊 Marketing IA"],
    ["admin", "👑 Admin"],
  ];

  return (
    <aside className="bg-white rounded-[2rem] shadow p-4 border border-slate-100">
      <h2 className="text-xl font-black mb-4">Studio</h2>

      <div className="space-y-2">
        {items.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActive?.(key)}
            className={`w-full text-left px-4 py-3 rounded-2xl font-bold transition ${
              active === key
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}