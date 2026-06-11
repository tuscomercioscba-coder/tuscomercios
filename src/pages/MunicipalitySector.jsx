import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function MunicipalitySector() {
  const { slug, sector } = useParams();
  const navigate = useNavigate();

  const sectorName = sector
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const data = {
    cover: `https://placehold.co/1600x700?text=${sectorName}`,
    description: "Información del área disponible para vecinos.",
    phone: "03544-000000",
    whatsapp: "",
    email: "",
    address: "Villa Dolores, Córdoba",
    map: "",
    hours: "Lunes a viernes de 08:00 a 13:00",
  };

  return (
    <Layout fullWidth>
      <div className="min-h-screen bg-slate-50 pb-12">
        <section className="relative bg-slate-950 text-white">
          <img
            src={data.cover}
            alt={sectorName}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />

          <div className="relative max-w-7xl mx-auto px-4 py-16">
            <button
              onClick={() => navigate(`/municipalidad/${slug}`)}
              className="mb-6 bg-white/90 text-slate-900 px-4 py-2 rounded-xl font-bold"
            >
              ← Volver
            </button>

            <h1 className="text-4xl md:text-6xl font-black">{sectorName}</h1>
            <p className="text-white/85 mt-3 text-lg max-w-2xl">
              Área perteneciente al portal institucional municipal.
            </p>
          </div>
        </section>

        <main className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl border p-6 md:p-8">
            <h2 className="text-2xl font-black mb-4">Información del área</h2>

            <p className="text-slate-700 leading-relaxed mb-6">
              {data.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border">
                <p className="font-black">☎ Teléfono</p>
                <p>{data.phone || "No disponible"}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border">
                <p className="font-black">🕒 Horarios</p>
                <p>{data.hours || "No disponible"}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border">
                <p className="font-black">📍 Dirección</p>
                <p>{data.address || "No disponible"}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border">
                <p className="font-black">✉ Email</p>
                <p>{data.email || "No disponible"}</p>
              </div>
            </div>

            {data.whatsapp && (
              <a
                href={`https://wa.me/${data.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="block mt-6 bg-green-600 text-white text-center px-5 py-4 rounded-2xl font-black"
              >
                💬 Contactar por WhatsApp
              </a>
            )}

            {data.map ? (
              <iframe
                src={data.map}
                title="Mapa"
                className="w-full h-72 rounded-2xl mt-6 border"
                loading="lazy"
              />
            ) : (
              <div className="mt-6 bg-slate-100 rounded-2xl p-6 text-center text-slate-500 border">
                Mapa no disponible por el momento.
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}