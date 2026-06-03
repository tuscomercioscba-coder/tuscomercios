const categories = [
  "Electrodomésticos",
  "Ropa",
  "Bazar",
  "Mueblería",
  "Tecnología",
  "Ferretería",
  "Farmacia",
  "Supermercado",
];

export default function Categories() {
  return (
    <section id="categorias" className="py-14 md:py-20 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900">Categorías destacadas</h2>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Explora los rubros más buscados y encuentra negocios confiables en tu zona.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category}
              className="rounded-3xl bg-white border border-slate-200 p-5 text-center font-semibold text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition"
            >
              {category}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}