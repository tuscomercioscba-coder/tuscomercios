const ACTIONS = [
  {
    icon: "☀️",
    label: "¿Qué publico hoy?",
    prompt:
      "¿Qué puedo publicar hoy para ayudar a vender más en mi negocio?",
  },
  {
    icon: "📉",
    label: "Tengo pocas ventas",
    prompt:
      "Estoy teniendo pocas ventas. ¿Qué debería revisar primero y qué puedo hacer hoy?",
  },
  {
    icon: "🎥",
    label: "Crear un Reel",
    prompt:
      "Dame una idea concreta para grabar un Reel sencillo hoy.",
  },
  {
    icon: "🎯",
    label: "Conseguir clientes",
    prompt:
      "Dame una acción concreta para conseguir nuevos clientes en mi zona.",
  },
];

export default function MentorQuickActions({
  disabled,
  onSelect,
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
            Empezá rápido
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Elegí una consulta o escribí la tuya.
          </p>
        </div>

      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
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
              className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md disabled:opacity-40"
            >
              <span className="text-xl">
                {action.icon}
              </span>

              <span className="mt-2 block text-xs font-black text-slate-700">
                {action.label}
              </span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
