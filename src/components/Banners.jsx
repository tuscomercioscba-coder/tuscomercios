import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);

  const navigate = useNavigate();

  function getDistance(lat1, lon1, lat2, lon2) {
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
  }

  async function getUserLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          resolve(null);
        }
      );
    });
  }

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    const location = await getUserLocation();

    const { data, error } = await supabase
      .from("banners")
      .select(`
        *,
        businesses (
          id,
          negocio,
          slug,
          lat,
          lng
        )
      `)
      .eq("active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    const validBanners = (data || []).filter((banner) => {
      if (!banner.image) return false;
      if (!banner.businesses?.slug) return false;

      if (banner.expires_at) {
        const expired = new Date(banner.expires_at) < new Date();
        if (expired) return false;
      }

      return true;
    });

    if (!location) {
      setBanners(validBanners);
      return;
    }

    const filtered = validBanners.filter((banner) => {
      const bannerLat = banner.lat || banner.businesses?.lat;
      const bannerLng = banner.lng || banner.businesses?.lng;

      if (!bannerLat || !bannerLng) {
        return true;
      }

      const distance = getDistance(
        location.lat,
        location.lng,
        bannerLat,
        bannerLng
      );

      return distance <= (banner.radius_km || 50);
    });

    filtered.sort((a, b) => {
      const aLat = a.lat || a.businesses?.lat || 0;
      const aLng = a.lng || a.businesses?.lng || 0;

      const bLat = b.lat || b.businesses?.lat || 0;
      const bLng = b.lng || b.businesses?.lng || 0;

      const distA = getDistance(location.lat, location.lng, aLat, aLng);
      const distB = getDistance(location.lat, location.lng, bLat, bLng);

      return distA - distB;
    });

    setBanners(filtered);
  }

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners]);

  async function registerBannerClick(banner) {
    try {
      await supabase
        .from("banners")
        .update({
          clicks: Number(banner.clicks || 0) + 1,
        })
        .eq("id", banner.id);
    } catch (error) {
      console.log(error);
    }
  }

  async function goToBusiness(banner) {
    if (!banner?.businesses?.slug) {
      return;
    }

    await registerBannerClick(banner);

    navigate(`/${banner.businesses.slug}`);
  }

  if (banners.length === 0) {
    return (
      <section className="w-full py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white">
            <div className="text-left">
              <span className="text-[11px] md:text-xs font-bold tracking-widest text-blue-100 uppercase">
                Espacio publicitario
              </span>

              <h2 className="text-3xl md:text-4xl font-black mt-2">
                Banners
              </h2>

              <p className="mt-2 text-base md:text-lg text-blue-100">
                Contratalo desde tu panel
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const current = banners[index];

  return (
    <section className="w-full py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div
          onClick={() => goToBusiness(current)}
          className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
        >
          <img
            src={current.image}
            alt={current.title || "Banner destacado"}
            className="w-full h-[300px] md:h-[420px] object-cover group-hover:scale-105 transition duration-500"
          />

          <div className="absolute inset-0 bg-black/45"></div>

          <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-14 text-white">
            <span className="bg-green-500 px-4 py-2 rounded-full text-sm font-bold mb-4">
              PUBLICIDAD DESTACADA
            </span>

            <h2 className="text-3xl md:text-5xl font-black max-w-2xl leading-tight">
              {current.title}
            </h2>

            <p className="mt-4 text-lg text-gray-100 max-w-xl">
              {current.subtitle}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToBusiness(current);
              }}
              className="mt-6 bg-white text-black px-8 py-4 rounded-2xl font-black hover:scale-105 transition"
            >
              Ver negocio
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}