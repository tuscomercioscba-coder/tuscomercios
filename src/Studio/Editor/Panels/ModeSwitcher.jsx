export default function ModeSwitcher({ mode, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-2">
      <button
        type="button"
        onClick={() => onChange("easy")}
        className={`min-h-12 rounded-xl px-4 font-black ${
          mode === "easy" ? "bg-white text-slate-950" : "text-white"
        }`}
      >
        Modo fácil
      </button>

      <button
        type="button"
        onClick={() => onChange("professional")}
        className={`min-h-12 rounded-xl px-4 font-black ${
          mode === "professional" ? "bg-white text-slate-950" : "text-white"
        }`}
      >
        Modo profesional
      </button>
    </div>
  );
}
