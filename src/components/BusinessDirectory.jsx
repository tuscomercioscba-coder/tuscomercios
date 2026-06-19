import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  const navigate = useNavigate();

  const planOrder = {
    premium: 1,
    standard: 2,
    free: 3,
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const handleSearchEvent = (e) => {
      setSearch(normalizeText(e.detail.search || ""));
      setCity(normalizeText(e.detail.city || ""));
    };

    window.addEventListener("search", handleSearchEvent);

    return () => window.removeEventListener("search", handleSearchEvent);
  }, []);

  function normalizeText(text) {
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function normalizePlan(plan) {
    const clean = normalizeText(plan || "free");

    if (
      clean === "premium" ||
      clean === "premiun" ||
      clean === "plan premium"
    ) {
      return "premium";
    }

    if (
      clean === "standard" ||
      clean === "estandar" ||
      clean === "estándar" ||
      clean === "plan standard" ||
      clean === "plan estandar"
    ) {
      return "standard";
    }

    return "free";
  }

  function formatWhatsappNumber(number) {
    if (!number) return "";

    let clean = number.toString().replace(/\D/g, "");

    if (clean.startsWith("00")) clean = clean.slice(2);
    if (clean.startsWith("549")) return clean;
    if (clean.startsWith("54")) return clean;
    if (clean.startsWith("0")) clean = clean.slice(1);

    return `549${clean}`;
  }

  async function fetchBusinesses() {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("status", "published");

    if (error) {
      console.log(error);
      return;
    }

    setBusinesses(data || []);
  }

  async function registerVisit(businessId) {
    if (!businessId) return;

    const { error } = await supabase.from("visits").insert([
      {
        business_id: businessId,
      },
    ]);

    if (error) console.log("Error guardando visita:", error);
  }

  async function registerWhatsappClick(businessId) {
    if (!businessId) return;

    const { error } = await supabase.from("clicks").insert([
      {
        business_id: businessId,
      },
    ]);

    if (error) console.log("Error guardando click:", error);
  }

  async function registerCardViews(items) {
    if (!items || items.length === 0) return;

    const rows = [];

    items.forEach((b) => {
      if (!b?.id) return;

      const key = `tc_view_${b.id}`;

      if (sessionStorage.getItem(key)) return;

      sessionStorage.setItem(key, "true");

      rows.push({
        business_id: b.id,
      });
    });

    if (rows.length === 0) return;

    const { error } = await supabase.from("views").insert(rows);

    if (error) console.log("Error guardando views:", error);
  }

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const getSearchText = (b) => {
    return normalizeText(`
      ${b.negocio || ""}
      ${b.rubro || ""}
      ${b.descripcion || ""}
      ${b.ciudad || ""}
      ${b.provincia || ""}
      ${(b.keywords || []).join(" ")}
    `);
  };

  const getSearchScore = (b) => {
    let score = 0;

    if (search) {
      const negocio = normalizeText(b.negocio || "");
      const rubro = normalizeText(b.rubro || "");
      const descripcion = normalizeText(b.descripcion || "");
      const ciudadText = normalizeText(b.ciudad || "");
      const provincia = normalizeText(b.provincia || "");
      const keywords = normalizeText((b.keywords || []).join(" "));

      if (rubro === search) score += 20;
      if (rubro.includes(search)) score += 12;
      if (negocio.includes(search)) score += 10;
      if (keywords.includes(search)) score += 8;
      if (descripcion.includes(search)) score += 5;
      if (ciudadText.includes(search) || provincia.includes(search)) score += 2;
    }

    if (userLocation && b.lat && b.lng) {
      const distance = getDistance(
        userLocation.lat,
        userLocation.lng,
        b.lat,
        b.lng
      );

      score += Math.max(0, 50 - distance);
    }

    return score;
  };

  const filtered = useMemo(() => {
    return businesses
      .filter((b) => (b.status || "published") === "published")
      .filter((b) => {
        if (!search) return true;

        const text = getSearchText(b);

        return text.includes(search);
      })
      .filter((b) => {
        if (!city) return true;

        const businessCity = normalizeText(b.ciudad || "");
        const businessProvince = normalizeText(b.provincia || "");

        return businessCity.includes(city) || businessProvince.includes(city);
      })
      .sort((a, b) => {
        const planA = normalizePlan(a.plan);
        const planB = normalizePlan(b.plan);

        const byPlan = (planOrder[planA] || 99) - (planOrder[planB] || 99);

        if (byPlan !== 0) return byPlan;

        const byScore = getSearchScore(b) - getSearchScore(a);

        if (byScore !== 0) return byScore;

        return (a.negocio || "").localeCompare(b.negocio || "");
      });
  }, [businesses, search, city, userLocation]);

  useEffect(() => {
    registerCardViews(filtered);
  }, [filtered]);

  async function goToBusiness(b) {
    await registerVisit(b.id);
    navigate(`/${b.slug}`);
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 text-lg">
            No encontramos resultados 😕
          </p>
        )}

        <div className="flex flex-col gap-6">
          {filtered.map((b) => {
            const message = encodeURIComponent(
              `Hola ${b.negocio}, vi tu negocio en Tus Comercios`
            );

            const whatsappNumber = formatWhatsappNumber(b.whatsapp);
            const whatsappLink = whatsappNumber
              ? `https://wa.me/${whatsappNumber}?text=${message}`
              : "#";

            let distanceKm = null;

            if (userLocation && b.lat && b.lng) {
              distanceKm = getDistance(
                userLocation.lat,
                userLocation.lng,
                b.lat,
                b.lng
              );
            }

            const plan = normalizePlan(b.plan);

            return (
              <div
                key={b.id}
                onClick={() => goToBusiness(b)}
                className="flex gap-4 bg-white border rounded-2xl shadow hover:shadow-xl transition cursor-pointer overflow-hidden"
              >
                <div className="w-40 h-32 bg-gray-200 flex-shrink-0">
                  <img
                    src={b.image || "/no-image.jpg"}
                    className="w-full h-full object-cover"
                    alt={b.negocio}
                  />
                </div>

                <div className="flex flex-col justify-between p-4 w-full">
                  <div>
                    <h2 className="text-lg font-bold">{b.negocio}</h2>

                    <p className="text-sm text-gray-500">📍 {b.ciudad}</p>

                    {b.rubro && (
                      <p className="text-xs text-blue-700 mt-1 font-semibold">
                        {b.rubro}
                      </p>
                    )}

                    {distanceKm && (
                      <p className="text-xs text-blue-600 mt-1 font-semibold">
                        📍 A {distanceKm.toFixed(1)} km de vos
                      </p>
                    )}

                    <p className="text-sm mt-2 line-clamp-2 text-gray-700 whitespace-pre-line">
                      {b.descripcion}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span
                      className={`
                        text-xs px-3 py-1 rounded-full font-semibold
                        ${plan === "premium" ? "bg-blue-600 text-white" : ""}
                        ${plan === "standard" ? "bg-blue-100 text-blue-700" : ""}
                        ${plan === "free" ? "bg-gray-100 text-gray-600" : ""}
                      `}
                    >
                      {plan}
                    </span>

                    {whatsappNumber && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();

                          await registerWhatsappClick(b.id);

                          window.open(whatsappLink, "_blank");
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700"
                      >
                        Contactar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
