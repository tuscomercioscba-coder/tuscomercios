import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function InstitutionsHome() {
  const navigate = useNavigate();

  return (
    <Layout fullWidth>
      <div className="min-h-screen bg-slate-50">
        <section className="bg-slate-950 text-white px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            Servicios e Instituciones
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Encontrá municipalidades, cooperativas, instituciones y servicios importantes de tu ciudad.
          </p>
        </section>

        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <button
              onClick={() => navigate("/municipalidades")}
              className="bg-white rounded-3xl shadow p-8 text-left hover:scale-[1.02] transition border"
            >
              <div className="text-5xl mb-4">🏛️</div>
              <h2 className="text-2xl font-black mb-2">Municipalidades</h2>
              <p className="text-slate-600">
                Información institucional, áreas, teléfonos, eventos y servicios.
              </p>
            </button>

            <div className="bg-white rounded-3xl shadow p-8 text-left border opacity-70">
              <div className="text-5xl mb-4">⚡</div>
              <h2 className="text-2xl font-black mb-2">Cooperativas</h2>
              <p className="text-slate-600">Próximamente.</p>
            </div>

            <div className="bg-white rounded-3xl shadow p-8 text-left border opacity-70">
              <div className="text-5xl mb-4">🏢</div>
              <h2 className="text-2xl font-black mb-2">Empresas grandes</h2>
              <p className="text-slate-600">Próximamente.</p>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}