export default function StudioWorkspaceSelector({
  workspaces = [],
  businesses = [],
  selectedItem,
  onSelect,
  isAdmin = false,
}) {
  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/90 p-3 shadow-xl sm:rounded-[2rem] sm:p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            Espacio de trabajo
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            Elegí dónde vas a crear contenido
          </h2>
        </div>

        {isAdmin && (
          <span className="self-start rounded-full bg-amber-100 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-amber-700">
            Acceso administrador
          </span>
        )}
      </div>

      {workspaces.length > 0 && (
        <div>
          <SectionTitle>Espacios</SectionTitle>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                onClick={() =>
                  onSelect({
                    ...workspace,
                    entityType: "workspace",
                  })
                }
                className={`min-w-0 rounded-2xl border p-3 text-left transition sm:rounded-3xl sm:p-4 ${
                  selectedItem?.entityType === "workspace" &&
                  selectedItem?.id === workspace.id
                    ? "border-violet-500 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xl"
                    : "border-violet-100 bg-violet-50 text-slate-900 hover:border-violet-300 hover:shadow-lg"
                }`}
              >
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white sm:h-14 sm:w-14">
                    {workspace.logo || workspace.image ? (
                      <img
                        src={workspace.logo || workspace.image}
                        alt=""
                        className="h-full w-full rounded-2xl object-contain p-1"
                      />
                    ) : (
                      <PlatformIcon />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="break-words text-sm font-black leading-tight sm:text-lg">
                      {workspace.name || "TusComercios"}
                    </p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] opacity-75">
                      Espacio administrativo
                    </p>
                    <p className="mt-2 text-sm font-semibold opacity-75">
                      Uso ilimitado
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {businesses.length > 0 && (
        <div className={workspaces.length > 0 ? "mt-7" : ""}>
          <SectionTitle>Comercios</SectionTitle>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
            {businesses.map((business) => {
              const selected =
                selectedItem?.entityType === "business" &&
                selectedItem?.id === business.id;

              return (
                <button
                  key={business.id}
                  type="button"
                  onClick={() =>
                    onSelect({
                      ...business,
                      entityType: "business",
                    })
                  }
                  className={`min-w-0 rounded-2xl border p-3 text-left transition sm:rounded-3xl sm:p-4 ${
                    selected
                      ? "border-blue-500 bg-slate-950 text-white shadow-xl"
                      : "border-slate-200 bg-slate-50 text-slate-900 hover:border-blue-300 hover:bg-white hover:shadow-lg"
                  }`}
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-200 sm:h-14 sm:w-14">
                      {business.logo || business.image ? (
                        <img
                          src={business.logo || business.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-500">
                          <StoreIcon />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="break-words text-sm font-black leading-tight sm:text-lg">
                        {business.negocio}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold opacity-70">
                        {business.ciudad || business.rubro || "Comercio"}
                      </p>
                      <p className="mt-2 text-xs font-black uppercase tracking-[0.1em] opacity-70">
                        {business.plan || "free"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {children}
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function PlatformIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16v10H4z" />
      <path d="M8 19h8M12 15v4" />
      <path d="m8 10 2.5-2.5L13 10l3-3" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10h16l-2-5H6l-2 5Z" />
      <path d="M5 10v9h14v-9" />
      <path d="M9 19v-5h6v5" />
    </svg>
  );
}
