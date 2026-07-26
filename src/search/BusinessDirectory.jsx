import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, RotateCcw } from "lucide-react";
import { supabase } from "../supabase";
import BusinessCard from "./BusinessCard";
import BusinessSection from "./BusinessSection";
import EmptyResults from "./EmptyResults";
import LoadingSearch from "./LoadingSearch";
import useBusinesses from "./hooks/useBusinesses";
import useGeolocation from "./hooks/useGeolocation";
import { getProvinceName } from "./utils/provinces";
import "./search.css";

const SEARCH_SELECT = `
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
  keywords,
  user_id
`;

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Córdoba");
  const [selectedLocality, setSelectedLocality] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const navigate = useNavigate();

  const geolocation = useGeolocation({
    autoRequest: true,
    options: {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 5 * 60 * 1000,
    },
  });

  useEffect(() => {
    let active = true;

    const fetchBusinesses = async () => {
      setIsLoading(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("businesses")
        .select(SEARCH_SELECT)
        .eq("status", "published");

      if (!active) return;

      if (error) {
        console.error("Error cargando comercios:", error);
        setBusinesses([]);
        setLoadError("No pudimos cargar los comercios. Intentá nuevamente.");
      } else {
        setBusinesses(data || []);
      }

      setIsLoading(false);
    };

    fetchBusinesses();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleSearchEvent = (event) => {
      const detail = event.detail || {};

      setQuery(detail.search || "");

      if (detail.province) {
        setSelectedProvince(getProvinceName(detail.province));
      }

      if (detail.city !== undefined) {
        setSelectedLocality(detail.city || "");
      }
    };

    window.addEventListener("search", handleSearchEvent);
    return () => window.removeEventListener("search", handleSearchEvent);
  }, []);

  const results = useBusinesses({
    businesses,
    query,
    selectedLocality,
    selectedProvince,
    userCoordinates: geolocation.coordinates,
    nearbyDistanceKm: 30,
  });


  const shouldTrackInteraction = async (business) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) return true;
    if (business?.user_id && user.id === business.user_id) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return profile?.role !== "admin";
  };

  const registerWhatsappClick = async (business) => {
    if (!business?.id) return;

    const canTrack = await shouldTrackInteraction(business);
    if (!canTrack) return;

    const { error } = await supabase
      .from("clicks")
      .insert([{ business_id: business.id }]);

    if (error) console.error("Error guardando clic:", error);
  };

  const openBusiness = (business) => {
    navigate(`/${business.slug}`);
  };

  const renderBusiness = (business, index) => (
    <BusinessCard
      key={business.id || business.slug}
      business={business}
      index={index}
      onOpen={openBusiness}
      onWhatsapp={registerWhatsappClick}
    />
  );

  const gpsActive = geolocation.status === "success";
  const gpsLoading = geolocation.status === "loading";

  return (
    <section
      id="directorio-comercios"
      className="bg-slate-50 py-10 sm:py-14"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
            Explorar comercios
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Encontrá opciones cerca tuyo
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Los resultados se organizan automáticamente por tu localidad,
            cercanía y prioridad del plan.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.07)] sm:p-6">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-slate-900">
                Ubicación para ordenar resultados
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Podés activarla o desactivarla cuando quieras.
              </p>
            </div>

            <button
              type="button"
              onClick={
                gpsActive
                  ? geolocation.clearLocation
                  : geolocation.requestLocation
              }
              disabled={gpsLoading}
              className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-black transition ${
                gpsActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              } disabled:cursor-wait disabled:opacity-70`}
            >
              {gpsActive ? <RotateCcw size={18} /> : <MapPin size={18} />}
              {gpsLoading
                ? "Buscando ubicación..."
                : gpsActive
                  ? "Ubicación activada"
                  : "Usar mi ubicación"}
            </button>
          </div>

          {geolocation.error && (
            <div
              className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              role="alert"
            >
              {geolocation.error}
            </div>
          )}

          {isLoading && <LoadingSearch />}

          {!isLoading && loadError && (
            <div className="search-directory__error" role="alert">
              {loadError}
            </div>
          )}

          {!isLoading && !loadError && !results.hasResults && (
            <EmptyResults query={query} onClear={null} />
          )}

          {!isLoading && !loadError && results.hasResults && (
            <div className="search-directory__results">
              <BusinessSection
                title={results.resolvedLocality || "Tu localidad"}
                description={
                  results.resolvedLocality
                    ? `Comercios ubicados en ${results.resolvedLocality}`
                    : "Comercios de tu localidad"
                }
                icon="local"
                businesses={results.sections.local}
                renderBusiness={renderBusiness}
              />

              <BusinessSection
                title="Localidades cercanas"
                description="Comercios ubicados hasta 30 km de tu localidad"
                icon="nearby"
                businesses={results.sections.nearby}
                renderBusiness={renderBusiness}
              />

              <BusinessSection
                title="Otras localidades"
                description="Comercios ubicados a más de 30 km dentro de Córdoba"
                icon="cordoba"
                businesses={results.sections.cordoba}
                renderBusiness={renderBusiness}
              />

              <BusinessSection
                title="Otras provincias"
                description="Resultados disponibles en el resto de Argentina"
                icon="other"
                businesses={results.sections.otherProvinces}
                renderBusiness={renderBusiness}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
