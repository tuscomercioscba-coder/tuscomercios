import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function Municipalities() {
  const navigate = useNavigate();

  const municipalities = [
    {
      name: "Municipalidad de Villa Dolores",
      slug: "villa-dolores",
      city: "Villa Dolores, Córdoba",
      image: "https://placehold.co/1200x700?text=Municipalidad+Villa+Dolores",
    },
  ];

  return (
    <Layout fullWidth>
      <div className="min-h-screen bg-slate-50">
        <section className="bg-blue-700 text-white px-4 py-14 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Municipalidades
          </h1>
          <p className="text-white/90">
            Portales institucionales dentro de Tus Comercios.
          </p>
        </section>

        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {municipalities.map((m) => (
              <button
                key={m.slug}
                onClick={() => navigate(`/municipalidad/${m.slug}`)}
                className="bg-white rounded-3xl overflow-hidden shadow border text-left hover:scale-[1.02] transition"
              >
                <img src={m.image} alt={m.name} className="w-full h-48 object-cover" />
                <div className="p-5">
                  <h2 className="text-xl font-black">{m.name}</h2>
                  <p className="text-slate-500 mt-1">📍 {m.city}</p>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
}