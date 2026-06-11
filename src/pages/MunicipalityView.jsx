import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";

export default function MunicipalityView() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const municipality = {
    name: "Municipalidad de Villa Dolores",
    shortDescription: "Portal institucional con información útil para vecinos.",
    phone: "03544-000000",
    website: "https://www.google.com",
    cover: "https://placehold.co/1600x700?text=Foto+de+Portada",
    logo: "https://placehold.co/400x400?text=Logo",
  };

  const banners = [
    "Comunicados importantes",
    "Eventos de la ciudad",
    "Información para vecinos",
  ];

  const sectors = [
    { name: "Obras Públicas", slug: "obras-publicas", icon: "🏗️" },
    { name: "Tránsito", slug: "transito", icon: "🚦" },
    { name: "Bromatología", slug: "bromatologia", icon: "🍽️" },
    { name: "Servicios Urbanos", slug: "servicios-urbanos", icon: "🗑️" },
    { name: "Registro Civil", slug: "registro-civil", icon: "📄" },
    { name: "Cultura", slug: "cultura", icon: "🎭" },
    { name: "Deportes", slug: "deportes", icon: "⚽" },
    { name: "Desarrollo Social", slug: "desarrollo-social", icon: "🤝" },
    { name: "Medio Ambiente", slug: "medio-ambiente", icon: "🌱" },
    { name: "Rentas", slug: "rentas", icon: "💳" },
    { name: "Habilitaciones", slug: "habilitaciones", icon: "🏪" },
    { name: "Prensa", slug: "prensa", icon: "📰" },
    { name: "Turismo", slug: "turismo", icon: "🧭" },
    { name: "Gobierno", slug: "gobierno", icon: "🏛️" },
    { name: "Educación", slug: "educacion", icon: "🎓" },
    { name: "Cementerio", slug: "cementerio", icon: "🕯️" },
    { name: "Defensa Civil", slug: "defensa-civil", icon: "🚨" },
  ];

  return (
    <Layout fullWidth>
      <div className="min-h-screen bg-slate-50 pb-12">
        <section className="relative bg-slate-950 text-white">
          <img
            src={municipality.cover}
            alt={municipality.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />

          <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <img
                src={municipality.logo}
                alt={municipality.name}
                className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-white bg-white shadow-xl"
              />

              <div>
                <h1 className="text-4xl md:text-6xl font-black">
                  {municipality.name}
                </h1>

                <p className="text-white/85 mt-3 text-lg max-w-2xl">
                  {municipality.shortDescription}
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="bg-white text-slate-900 px-4 py-3 rounded-2xl font-bold">
                    ☎ {municipality.phone}
                  </div>

                  <a
                    href={municipality.website}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 text-white px-4 py-3 rounded-2xl font-black hover:bg-blue-700 transition"
                  >
                    Sitio oficial
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {banners.map((b, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl shadow border p-6"
              >
                <div className="text-3xl mb-3">📢</div>
                <h2 className="font-black text-xl">{b}</h2>
              </div>
            ))}
          </section>

          <section>
            <h2 className="text-3xl font-black mb-5">Áreas y sectores</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sectors.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => navigate(`/municipalidad/${slug}/${s.slug}`)}
                  className="bg-white rounded-3xl shadow border p-5 text-left hover:scale-[1.03] transition"
                >
                  <div className="text-4xl mb-3">{s.icon}</div>
                  <h3 className="font-black text-lg">{s.name}</h3>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}