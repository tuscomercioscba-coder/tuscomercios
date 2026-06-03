export default function MarketplaceHero({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  categories,
  cities,
}) {
  return (
    <section className="bg-gradient-to-br from-white via-blue-50 to-sky-100 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-14 md:py-20">
        <div className="text-center mb-10">
          <img
            src="/logo.png"
            alt="Tus Comercios"
            className="w-28 md:w-36 mx-auto mb-5 object-contain"
          />

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
            Encuentra negocios cerca tuyo
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Busca comercios, productos y servicios por categoría o ciudad.
            Descubre oportunidades locales y contacta directamente por WhatsApp.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Buscar negocio, producto o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2 w-full rounded-2xl border border-gray-300 px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las ciudades</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}