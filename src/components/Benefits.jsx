const benefits = [
  {
    title: "Mayor visibilidad",
    text: "Haz que más personas descubran tu negocio en tu ciudad y alrededores.",
  },
  {
    title: "Contacto directo",
    text: "Los clientes te escriben directamente por WhatsApp, sin complicaciones.",
  },
  {
    title: "Resultados locales",
    text: "Aparece en búsquedas por categoría, ciudad y tipo de producto o servicio.",
  },
];

export default function Benefits() {
  return (
    <section id="beneficios" className="py-14 md:py-20 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900">
            ¿Por qué publicar en Tus Comercios?
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Diseñado para ayudar a negocios locales a conseguir clientes reales, rápido y simple.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}