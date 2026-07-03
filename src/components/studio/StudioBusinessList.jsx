export default function StudioBusinessList({
  businesses,
  selectedBusiness,
  setSelectedBusiness,
}) {
  if (!businesses || businesses.length === 0) {
    return (
      <section className="bg-white rounded-[2rem] shadow p-6 border border-slate-100">
        <h2 className="text-2xl font-black text-slate-900">
          Tus negocios
        </h2>

        <p className="text-slate-500 mt-2">
          Todavía no tenés negocios Estándar o Premium disponibles para Studio.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-[2rem] shadow p-6 border border-slate-100">
      <h2 className="text-2xl font-black text-slate-900 mb-1">
        Elegí el negocio
      </h2>

      <p className="text-slate-500 mb-5">
        Studio usará la información de esta vidriera para crear contenido.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {businesses.map((business) => {
          const active = selectedBusiness?.id === business.id;

          return (
            <button
              key={business.id}
              onClick={() => setSelectedBusiness(business)}
              className={`text-left rounded-3xl overflow-hidden border transition ${
                active
                  ? "border-blue-600 bg-blue-50 shadow-lg"
                  : "border-slate-200 bg-slate-50 hover:bg-white"
              }`}
            >
              {business.image ? (
                <img
                  src={business.image}
                  alt={business.negocio}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                  Sin imagen
                </div>
              )}

              <div className="p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-900">
                      {business.negocio}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {business.rubro || "Sin rubro"} · {business.ciudad || "Sin ciudad"}
                    </p>
                  </div>

                  <span
                    className={`h-fit px-3 py-1 rounded-full text-xs font-black ${
                      business.plan === "premium"
                        ? "bg-amber-400 text-slate-950"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {business.plan === "premium" ? "Premium" : "Estándar"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}