const steps = [
  {
    id: 1,
    title: "Registrá tu negocio",
    description:
      "Sumá tu comercio, emprendimiento o servicio para aparecer dentro de la plataforma y ganar visibilidad.",
  },
  {
    id: 2,
    title: "Recibí consultas reales",
    description:
      "Los clientes interesados pueden encontrarte y contactarte directamente por WhatsApp en segundos.",
  },
  {
    id: 3,
    title: "Vendé más y crecé",
    description:
      "Más exposición local, más oportunidades de venta y una presencia digital simple y efectiva.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900">
            ¿Cómo funciona?
          </h2>
          <p className="mt-4 text-sm md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Un sistema simple para que más personas descubran tu negocio y te contacten sin vueltas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:shadow-lg transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
                {step.id}
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">{step.title}</h3>

              <p className="mt-3 text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}