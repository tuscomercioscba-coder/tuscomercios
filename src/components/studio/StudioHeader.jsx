export default function StudioHeader() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-900 p-10 text-white shadow-2xl">

      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"></div>

      <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl"></div>

      <div className="relative z-10">

        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
          ✨ Tu departamento de marketing con IA
        </span>

        <h1 className="mt-6 text-5xl font-black">
          TusComercios Studio
        </h1>

        <p className="mt-4 max-w-3xl text-xl leading-relaxed text-blue-100">
          Creá campañas completas para tu negocio.
          Imágenes, Reels, Historias, Flyers y publicaciones
          profesionales en minutos.
        </p>

      </div>

    </section>
  );
}