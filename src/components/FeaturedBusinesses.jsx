const featured = [
  {
    id: 1,
    name: "Electro Hogar Premium",
    category: "Electrodomésticos",
    city: "Villa Dolores",
    description: "Las mejores ofertas en heladeras, cocinas y lavarropas con atención personalizada.",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    name: "Moda Urbana Store",
    category: "Ropa",
    city: "Córdoba",
    description: "Indumentaria moderna, zapatillas y accesorios para todos los estilos.",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    name: "Casa & Diseño",
    category: "Mueblería",
    city: "Carlos Paz",
    description: "Muebles elegantes, decoración y diseño para transformar tu hogar.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function FeaturedBusinesses() {
  return (
    <section id="destacados" className="py-14 md:py-20 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Título */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900">
            Negocios destacados
          </h2>
          <p className="mt-4 text-sm md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Algunos comercios que ya están ganando visibilidad dentro de la plataforma.
            Tu negocio también puede aparecer aquí y recibir más consultas por WhatsApp.
          </p>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {featured.map((business) => (
            <div
              key={business.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
            >
              {/* Imagen controlada */}
              <div className="h-56 overflow-hidden">
                <img
                  src={business.image}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {business.category}
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {business.name}
                </h3>

                <p className="mt-2 text-sm text-slate-500">{business.city}</p>

                <p className="mt-3 text-slate-600 leading-relaxed">
                  {business.description}
                </p>

                <a
                  href="#contacto"
                  className="mt-5 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  Quiero destacar mi negocio
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}