export default function StudioChat({ idea, setIdea, selectedBusiness }) {
  const businessName = selectedBusiness?.negocio || "tu negocio";

  return (
    <section className="bg-white rounded-[2rem] shadow border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-4 border-b p-5 bg-slate-50">
        <img src="/logo.png" alt="TusComercios" className="w-28 object-contain" />

        <div>
          <h2 className="text-2xl font-black text-slate-900">
            IA de TusComercios
          </h2>
          <p className="text-slate-500">
            Tu colega inteligente para crear contenido que vende.
          </p>
        </div>
      </div>

      <div className="relative min-h-[420px] p-6">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <img src="/logo.png" alt="" className="w-[520px] object-contain" />
        </div>

        <div className="relative z-10 space-y-5">
          <div className="max-w-xl bg-white border rounded-3xl p-5 shadow-sm">
            <p className="font-bold mb-2">Hola 👋</p>
            <p>
              Soy la IA de TusComercios. Voy a ayudarte a crear contenido para{" "}
              <b>{businessName}</b>.
            </p>
            <p className="mt-2 text-slate-600">
              Contame, ¿qué querés vender hoy?
            </p>
          </div>

          {idea?.trim() && (
            <div className="max-w-xl ml-auto bg-blue-600 text-white rounded-3xl p-5 shadow-sm">
              {idea}
            </div>
          )}

          {idea?.trim() && (
            <div className="max-w-2xl bg-white border rounded-3xl p-5 shadow-sm">
              <p className="font-black mb-3">Perfecto 🚀</p>
              <p>
                Para esta idea te recomiendo crear una campaña simple con:
              </p>

              <div className="grid gap-2 mt-4 text-sm">
                <div>🎬 <b>Reel:</b> para captar atención.</div>
                <div>📱 <b>Historia:</b> para publicar rápido.</div>
                <div>🖼️ <b>Imagen:</b> para redes y WhatsApp.</div>
                <div>✍️ <b>Texto:</b> para acompañar la publicación.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}