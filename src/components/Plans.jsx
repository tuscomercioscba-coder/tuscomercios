export default function Plans() {
  return (
    <section className="py-20 bg-slate-100 text-center">
      <h2 className="text-3xl font-bold mb-10">Nuestros Planes</h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">

        {/* GRATUITO */}
        <div className="border p-6 rounded-xl bg-white shadow">
          <h3 className="text-xl font-bold">Plan Gratuito</h3>
          <p className="mt-2 text-green-600 font-bold">Gratis</p>

          <ul className="mt-4 text-sm space-y-2">
            <li>✔ Publicación básica</li>
            <li>✔ Hasta 2 fotos</li>
            <li>✔ Botón WhatsApp</li>
          </ul>
        </div>

        {/* ESTANDAR */}
        <div className="border p-6 rounded-xl bg-white shadow">
          <h3 className="text-xl font-bold">Plan Estándar</h3>
          <p className="mt-2 text-blue-600 font-bold">$8.000 / mes</p>

          <ul className="mt-4 text-sm space-y-2">
            <li>✔ Más visibilidad</li>
            <li>✔ Hasta 6 fotos</li>
            <li>✔ Redes sociales</li>
            <li>✔ Prioridad en búsquedas</li>
          </ul>
        </div>

        {/* PREMIUM */}
        <div className="border-2 border-yellow-500 p-6 rounded-xl bg-white shadow-lg">
          <h3 className="text-xl font-bold">Plan Premium</h3>
          <p className="mt-2 text-yellow-600 font-bold">$15.000 / mes</p>

          <ul className="mt-4 text-sm space-y-2">
            <li>✔ Máxima visibilidad</li>
            <li>✔ Hasta 10 fotos</li>
            <li>✔ 1 Video </li>
            <li>✔ Redes sociales </li>
            <li>✔ Página web </li>
            <li>✔ Ubicación en Google Maps</li>
            <li>✔ Posición destacada</li>
          </ul>
        </div>

      </div>
    </section>
  );
}