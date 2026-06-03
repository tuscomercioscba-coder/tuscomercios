import { supabase } from "../supabase";

export default function Hero() {
  async function registerEvent(eventType) {
    await supabase.from("page_events").insert([
      {
        event_type: eventType,
        path: window.location.pathname,
      },
    ]);
  }

  return (
    <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block bg-white/20 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Impulsa tu negocio local
          </span>

          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            La vidriera digital que tu comercio necesita
          </h2>

          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">
            Publica tu negocio, muestra tus productos y recibe consultas directas
            por WhatsApp en una plataforma moderna, simple y profesional.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://wa.me/5493544573187"
              target="_blank"
              rel="noreferrer"
              onClick={() => registerEvent("click_publish_whatsapp")}
              className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-4 rounded-2xl font-bold text-center transition"
            >
              Publicar mi negocio
            </a>

            <a
              href="#destacados"
              onClick={() => registerEvent("click_featured_businesses")}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-4 rounded-2xl font-bold text-center transition"
            >
              Ver negocios destacados
            </a>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
          <div className="bg-white rounded-3xl p-5 text-gray-900">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">
                🏪
              </div>

              <div>
                <h3 className="font-extrabold text-xl">Tu negocio aquí</h3>
                <p className="text-sm text-gray-500">Más visibilidad, más ventas</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-100 rounded-2xl p-4">
                <p className="font-semibold">✔ Publicación profesional</p>
              </div>

              <div className="bg-gray-100 rounded-2xl p-4">
                <p className="font-semibold">✔ Contacto directo por WhatsApp</p>
              </div>

              <div className="bg-gray-100 rounded-2xl p-4">
                <p className="font-semibold">✔ Mayor alcance local</p>
              </div>
            </div>

            <a
              href="https://wa.me/5493544573187"
              target="_blank"
              rel="noreferrer"
              onClick={() => registerEvent("click_quiero_aparecer")}
              className="mt-6 block w-full text-center bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold transition"
            >
              Quiero aparecer aquí
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}