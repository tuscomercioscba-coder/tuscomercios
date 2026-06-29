import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Helmet } from "react-helmet-async";

export default function CategoryPage() {
  const { rubro, ciudad } = useParams();

  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    fetchData();
  }, [rubro, ciudad]);

  function normalizeText(text) {
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/-/g, " ");
  }

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select(`
        id,
        slug,
        negocio,
        rubro,
        descripcion,
        ciudad,
        provincia,
        image,
        plan,
        status,
        keywords
      `)
      .eq("status", "published");

    if (error) {
      console.log(error);
      return;
    }

    const rubroSearch = normalizeText(rubro || "");
    const ciudadSearch = normalizeText(ciudad || "");

    const filtered = (data || [])
      .filter((b) => {
        const text = normalizeText(`
          ${b.negocio || ""}
          ${b.descripcion || ""}
          ${b.rubro || ""}
          ${b.ciudad || ""}
          ${b.provincia || ""}
          ${(b.keywords || []).join(" ")}
        `);

        const cityText = normalizeText(`
          ${b.ciudad || ""}
          ${b.provincia || ""}
        `);

        const matchRubro = text.includes(rubroSearch);

        const matchCity =
          ciudadSearch === "argentina" ||
          ciudadSearch === "" ||
          cityText.includes(ciudadSearch);

        return matchRubro && matchCity;
      })
      .sort((a, b) => {
        const planScore = {
          premium: 3,
          standard: 2,
          free: 1,
        };

        return (planScore[b.plan] || 0) - (planScore[a.plan] || 0);
      });

    setBusinesses(filtered);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Helmet>
        <title>
          {normalizeText(rubro)} en {normalizeText(ciudad)} | Tus Comercios
        </title>

        <meta
          name="description"
          content={`Encontrá ${normalizeText(rubro)} en ${normalizeText(
            ciudad
          )}. Negocios verificados, contacto directo y atención rápida.`}
        />

        <meta
          property="og:title"
          content={`${normalizeText(rubro)} en ${normalizeText(
            ciudad
          )} | Tus Comercios`}
        />

        <meta
          property="og:description"
          content={`Los mejores ${normalizeText(rubro)} en ${normalizeText(
            ciudad
          )}. Compará servicios y contactá directo.`}
        />

        <meta property="og:type" content="website" />
      </Helmet>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 mb-3 capitalize">
            {normalizeText(rubro)} en {normalizeText(ciudad)}
          </h1>

          <p className="text-lg text-gray-600 max-w-3xl">
            Encontrá los mejores {normalizeText(rubro)} en{" "}
            {normalizeText(ciudad)}. Compará servicios y contactá directamente
            por WhatsApp con negocios verificados.
          </p>
        </div>

        {businesses.length === 0 && (
          <div className="bg-white rounded-2xl p-10 shadow text-center">
            <h2 className="text-2xl font-bold mb-3">
              No encontramos resultados
            </h2>

            <p className="text-gray-500">
              Todavía no hay negocios cargados en esta categoría.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {businesses.map((b, i) => (
            <div
              key={b.id}
              onClick={() => navigate(`/${b.slug}`)}
              className="bg-white rounded-2xl shadow hover:shadow-2xl transition overflow-hidden cursor-pointer"
            >
              <img
                src={b.image || "https://placehold.co/600x400"}
                loading={i < 3 ? "eager" : "lazy"}
                fetchPriority={i < 3 ? "high" : "auto"}
                decoding="async"
                className="w-full h-52 object-cover bg-slate-100"
                alt={b.negocio}
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x400";
                }}
              />

              <div className="p-5">
                <h2 className="text-xl font-bold mb-2">{b.negocio}</h2>

                <p className="text-sm text-gray-500 mb-1">📍 {b.ciudad}</p>

                {b.rubro && (
                  <p className="text-xs text-blue-700 font-semibold mb-2">
                    {b.rubro}
                  </p>
                )}

                <p className="text-gray-600 text-sm line-clamp-3 whitespace-pre-line">
                  {b.descripcion}
                </p>

                <div className="mt-4">
                  <span
                    className={`
                      text-xs px-3 py-1 rounded-full font-semibold
                      ${b.plan === "premium" ? "bg-purple-600 text-white" : ""}
                      ${b.plan === "standard" ? "bg-blue-100 text-blue-700" : ""}
                      ${b.plan === "free" ? "bg-gray-100 text-gray-600" : ""}
                    `}
                  >
                    {b.plan || "free"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}