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
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
            Empezá rápido
          </p>

          <p className="mt-1 hidden text-sm font-semibold text-slate-500 sm:block">
            Elegí una consulta o escribí la tuya.
          </p>
        </div>

      </div>

      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
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
              className="flex min-h-12 w-[155px] shrink-0 items-center gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md disabled:opacity-40 sm:block sm:min-h-0 sm:w-auto sm:shrink sm:rounded-2xl sm:p-3"
            >
              <span className="shrink-0 text-lg sm:text-xl">
                {action.icon}
              </span>

              <span className="block break-words text-xs font-black leading-tight text-slate-700 sm:mt-2">
                {action.label}
              </span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
