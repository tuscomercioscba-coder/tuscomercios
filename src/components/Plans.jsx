export default function Plans() {
  return (
    <section className="py-20 bg-slate-100 text-center px-4">
      <div className="max-w-4xl mx-auto mb-10">
        <h2 className="text-3xl md:text-4xl font-black mb-3">
          Planes para mostrar mejor tu negocio
        </h2>

        <p className="text-slate-500">
          Empezá gratis o convertí tu vidriera en una mini página web profesional.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="border p-6 rounded-3xl bg-white shadow text-left">
          <h3 className="text-xl font-black">Gratis</h3>
          <p className="mt-2 text-green-600 font-black">$0 / mes</p>

          <ul className="mt-4 text-sm space-y-2">
            <li>✔ Hasta 2 fotos</li>
            <li>✔ WhatsApp directo</li>
            <li>✔ Provincia y localidad</li>
            <li>✔ Descripción básica</li>
            <li>✔ Horarios</li>
            <li>✔ Aparece en búsquedas</li>
          </ul>
        </div>

        <div className="border-2 border-blue-500 p-6 rounded-3xl bg-white shadow-xl text-left relative">
          <div className="absolute -top-3 left-6 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black">
            MÁS ELEGIDO
          </div>

          <h3 className="text-xl font-black mt-2">Estándar</h3>
          <p className="mt-2 text-blue-600 font-black">$8.000 / mes</p>

          <ul className="mt-4 text-sm space-y-2">
            <li>✔ Todo Gratis</li>
            <li>✔ Hasta 6 fotos</li>
            <li>✔ Redes sociales</li>
            <li>✔ Email contacto</li>
            <li>✔ Mayor prioridad</li>
            <li>✔ Vidriera más completa</li>
          </ul>
        </div>

        <div className="border-2 border-amber-400 p-6 rounded-3xl bg-slate-950 shadow-2xl text-left text-white relative">
          <div className="absolute -top-3 left-6 bg-amber-400 text-slate-950 px-4 py-1 rounded-full text-xs font-black">
            PREMIUM
          </div>

          <h3 className="text-xl font-black mt-2">Premium</h3>
          <p className="mt-2 text-amber-300 font-black">$15.000 / mes</p>

          <ul className="mt-4 text-sm space-y-2">
            <li>✔ Todo Estándar</li>
            <li>✔ Hasta 10 fotos</li>
            <li>✔ Video del negocio</li>
            <li>✔ Mapa visible</li>
            <li>✔ Botón “Cómo llegar”</li>
            <li>✔ Sitio web</li>
            <li>✔ Servicios destacados</li>
            <li>✔ Máxima prioridad</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
