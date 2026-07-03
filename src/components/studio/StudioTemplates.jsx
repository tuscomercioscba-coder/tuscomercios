export default function StudioTemplates({ setIdea, setSelectedFormat }) {
  const templates = [
    {
      icon: "🔥",
      title: "Oferta",
      text: "Quiero hacer una oferta llamativa para vender más esta semana.",
      format: "image",
    },
    {
      icon: "🎬",
      title: "Reel viral",
      text: "Quiero crear un Reel moderno para mostrar mi negocio y atraer clientes.",
      format: "reel",
    },
    {
      icon: "📱",
      title: "Historia rápida",
      text: "Quiero una historia para publicar hoy con una promoción simple.",
      format: "story",
    },
    {
      icon: "🎁",
      title: "Sorteo",
      text: "Quiero hacer un sorteo para ganar seguidores y conseguir más consultas.",
      format: "post",
    },
    {
      icon: "📢",
      title: "Nuevo producto",
      text: "Quiero anunciar un producto o servicio nuevo de mi negocio.",
      format: "flyer",
    },
    {
      icon: "⭐",
      title: "Destacar negocio",
      text: "Quiero una publicación profesional para presentar mi negocio.",
      format: "campaign",
    },
  ];

  function useTemplate(template) {
    setIdea(template.text);
    setSelectedFormat(template.format);
  }

  return (
    <section className="bg-white rounded-[2rem] shadow p-6 border border-slate-100">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-slate-900">
          Plantillas inteligentes
        </h2>

        <p className="text-slate-500 mt-1">
          Elegí una idea rápida y Studio la adapta a tu comercio.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((template) => (
          <button
            key={template.title}
            onClick={() => useTemplate(template)}
            className="text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl p-4 transition"
          >
            <div className="text-3xl mb-2">{template.icon}</div>
            <h3 className="font-black text-slate-900">{template.title}</h3>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
              {template.text}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}