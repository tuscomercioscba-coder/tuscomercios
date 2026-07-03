export default function StudioLibrary() {
  const items = [
    {
      icon: "🎬",
      title: "Reel automático",
      date: "Próximamente",
    },
    {
      icon: "🖼️",
      title: "Imagen promocional",
      date: "Próximamente",
    },
    {
      icon: "📱",
      title: "Historia para redes",
      date: "Próximamente",
    },
  ];

  return (
    <section className="bg-white rounded-[2rem] shadow p-6 border border-slate-100">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-slate-900">
          Biblioteca
        </h2>

        <p className="text-slate-500 mt-1">
          Acá se guardará todo el contenido creado con Studio.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{item.icon}</div>

              <div>
                <h3 className="font-black text-slate-900">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-500">
                  {item.date}
                </p>
              </div>
            </div>

            <button
              disabled
              className="bg-white text-slate-400 px-4 py-2 rounded-xl font-bold cursor-not-allowed"
            >
              Ver
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}