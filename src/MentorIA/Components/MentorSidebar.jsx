const ACTIONS = [
  {
    icon: "📈",
    label: "Vender más",
    prompt:
      "Estoy vendiendo menos de lo esperado. Analizá mi negocio y decime qué acción concreta puedo aplicar hoy para aumentar las ventas.",
  },
  {
    icon: "📱",
    label: "Publicación",
    prompt:
      "Dame una idea concreta para publicar hoy en redes sociales y ayudarme a vender más.",
  },
  {
    icon: "🎬",
    label: "Idea para Reel",
    prompt:
      "Dame una idea sencilla para un Reel que pueda grabar hoy y que promocione mi negocio.",
  },
  {
    icon: "🏷️",
    label: "Promoción",
    prompt:
      "Ayudame a crear una promoción simple, rentable y atractiva para mi negocio.",
  },
  {
    icon: "⭐",
    label: "Fidelizar",
    prompt:
      "Dame una estrategia económica para que mis clientes vuelvan a comprar.",
  },
  {
    icon: "📣",
    label: "Publicidad",
    prompt:
      "Decime qué debería comunicar en una publicidad para atraer clientes de mi zona.",
  },
  {
    icon: "💬",
    label: "Responder cliente",
    prompt:
      "Ayudame a responder profesionalmente un mensaje de un cliente. Primero pedime que copie el mensaje.",
  },
  {
    icon: "🧭",
    label: "Analizar negocio",
    prompt:
      "Haceme un diagnóstico breve de mi negocio y decime cuál debería ser mi prioridad comercial.",
  },
];

export default function MentorSidebar({
  business,
  planLabel,
  disabled,
  onSelect,
  onNewConversation,
}) {
  return (
    <aside className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-lg">
      <div className="border-b border-slate-100 bg-gradient-to-br from-blue-950 to-slate-950 p-5 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-300">
          Comercio activo
        </p>

        <h2 className="mt-2 truncate text-xl font-black">
          {business?.negocio ||
            business?.name ||
            "Mi comercio"}
        </h2>

        <p className="mt-1 truncate text-sm font-semibold text-blue-100">
          {business?.rubro ||
            "Comercio"}{" "}
          ·{" "}
          {business?.ciudad ||
            "Argentina"}
        </p>

        <span className="mt-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black">
          Plan {planLabel}
        </span>
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={onNewConversation}
          className="min-h-12 w-full rounded-xl bg-red-600 px-4 font-black text-white transition hover:bg-red-700"
        >
          ＋ Nueva conversación
        </button>

        <p className="mb-3 mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          Accesos rápidos
        </p>

        <div className="grid grid-cols-2 gap-2">
          {ACTIONS.map(
            (action) => (
              <button
                key={action.label}
                type="button"
                disabled={disabled}
                onClick={() =>
                  onSelect(
                    action.prompt
                  )
                }
                className="group min-h-[78px] rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="text-xl">
                  {action.icon}
                </span>

                <span className="mt-2 block text-xs font-black text-slate-700 group-hover:text-red-700">
                  {action.label}
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </aside>
  );
}
