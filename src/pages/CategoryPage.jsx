import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Helmet } from "react-helmet-async";
import BusinessCard from "../search/BusinessCard";
import BusinessSection from "../search/BusinessSection";
import EmptyResults from "../search/EmptyResults";
import LoadingSearch from "../search/LoadingSearch";
import useBusinesses from "../search/hooks/useBusinesses";
import useGeolocation from "../search/hooks/useGeolocation";
import { trackMetaStandardEvent } from "../services/analytics/metaPixel";
import "../search/search.css";

export default function CategoryPage() {
  const { rubro, ciudad } = useParams();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const geolocation = useGeolocation({
    autoRequest: true,
    options: {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 30 * 60 * 1000,
    },
  });

  function normalizeText(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/-/g, " ");
  }

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setIsLoading(true);

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
          whatsapp,
          image,
          plan,
          status,
          lat,
          lng,
          keywords
        `)
        .eq("status", "published");

      if (!active) return;

      if (error) {
        console.error("Error cargando categoría:", error);
        setBusinesses([]);
      } else {
        setBusinesses(data || []);
      }

      setIsLoading(false);
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [rubro, ciudad]);

  const selectedLocality = ["", "argentina"].includes(normalizeText(ciudad))
    ? ""
    : normalizeText(ciudad);

  const results = useBusinesses({
    businesses,
    query: normalizeText(rubro),
    selectedLocality,
    selectedProvince: "Córdoba",
    userCoordinates: geolocation.coordinates,
    nearbyDistanceKm: 80,
  });

  const registerVisit = async (business) => {
    if (!business?.id) return;
    const sessionKey = `tc_visit_${business.id}`;

    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "true");
      await supabase.from("visits").insert([{ business_id: business.id }]);
    }

    navigate(`/${business.slug}`);
  };

  const registerWhatsappClick = async (business) => {
    if (!business?.id) return;
    trackMetaStandardEvent("Contact", {
      content_type: "product",
      content_ids: [business.id],
      content_category: business.rubro || "comercio",
    });
    await supabase.from("clicks").insert([{ business_id: business.id }]);
  };

  const renderBusiness = (business, index) => (
    <BusinessCard
      key={business.id || business.slug}
      business={business}
      index={index}
      variant="grid"
      onOpen={registerVisit}
      onWhatsapp={registerWhatsappClick}
    />
  );

  const categoryName = normalizeText(rubro);
  const locationName = normalizeText(ciudad) || "argentina";

  return (
    <div className="min-h-screen bg-slate-100">
      <Helmet>
        <title>{categoryName} en {locationName} | Tus Comercios</title>
        <meta
          name="description"
          content={`Encontrá ${categoryName} en ${locationName}. Negocios verificados, contacto directo y atención rápida.`}
        />
        <meta property="og:title" content={`${categoryName} en ${locationName} | Tus Comercios`} />
        <meta
          property="og:description"
          content={`Los mejores ${categoryName} en ${locationName}. Compará servicios y contactá directo.`}
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 mb-3 capitalize">
            {categoryName} en {locationName}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Encontrá los mejores {categoryName} en {locationName}. Compará servicios y
            contactá directamente por WhatsApp con negocios verificados.
          </p>
        </div>

        {isLoading && <LoadingSearch />}
        {!isLoading && !results.hasResults && <EmptyResults query={categoryName} />}

        {!isLoading && results.hasResults && (
          <div className="search-directory__results">
            <BusinessSection
              title="En tu localidad"
              description={results.resolvedLocality ? `Resultados en ${results.resolvedLocality}` : "Resultados de tu localidad"}
              icon="📍"
              businesses={results.sections.local}
              renderBusiness={renderBusiness}
              className="search-section--cards"
            />
            <BusinessSection
              title="Localidades cercanas"
              description="Opciones ubicadas cerca de vos"
              icon="🧭"
              businesses={results.sections.nearby}
              renderBusiness={renderBusiness}
              className="search-section--cards"
            />
            <BusinessSection
              title="Más opciones en Córdoba"
              description="Otros resultados disponibles en la provincia"
              icon="🏪"
              businesses={results.sections.cordoba}
              renderBusiness={renderBusiness}
              className="search-section--cards"
            />
            <BusinessSection
              title="Otras provincias"
              description="Resultados disponibles en el resto de Argentina"
              icon="🇦🇷"
              businesses={results.sections.otherProvinces}
              renderBusiness={renderBusiness}
              className="search-section--cards"
            />
          </div>
        )}
      </div>
    </div>
  );
}
