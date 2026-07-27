import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "./supabase";

import Header from "./components/Header";
import BusinessDirectory from "./components/BusinessDirectory";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import Banners from "./components/Banners";
import CookieConsent from "./components/CookieConsent";

const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const BusinessView = lazy(() => import("./pages/BusinessView"));
const Studio = lazy(() => import("./pages/Studio"));
const StudioImage = lazy(() => import("./pages/StudioImage"));
const StudioCarousel = lazy(() => import("./pages/StudioCarousel"));
const BrandKit = lazy(() => import("./pages/BrandKit"));
const RegisterBanner = lazy(() => import("./pages/RegisterBanner"));
const EditBanner = lazy(() => import("./pages/EditBanner"));
const ReelGenerator = lazy(() => import("./pages/ReelGenerator"));
const Mentor = lazy(() => import("./pages/Mentor"));
const Auth = lazy(() => import("./components/Auth"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RegisterBusiness = lazy(() => import("./pages/RegisterBusiness"));
const PlansPage = lazy(() => import("./pages/PlansPage"));
const Success = lazy(() => import("./pages/Success"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const StoriesManager = lazy(() => import("./pages/StoriesManager"));
const Administration = lazy(() => import("./pages/Administration"));

function PageLoader() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center bg-slate-50 p-6">
      <div className="rounded-3xl bg-white p-7 text-center shadow-xl">
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <p className="mt-4 font-black text-slate-800">Cargando...</p>
      </div>
    </div>
  );
}

import {
  initializeMetaPixel,
  isAnalyticsExcluded,
  setAnalyticsExcluded,
  trackMetaPageView,
  trackMetaStandardEvent,
} from "./services/analytics/metaPixel";

function Home() {
  return (
    <>
      <Helmet>
        <title>
          Tus Comercios | Negocios y comercios de Argentina
        </title>

        <meta
          name="description"
          content="Encontrá comercios, negocios, servicios y empresas de toda Argentina."
        />

        <meta property="og:title" content="Tus Comercios" />

        <meta
          property="og:description"
          content="La nueva plataforma de comercios de Argentina."
        />

        <meta
          property="og:url"
          content="https://tuscomercios.com.ar"
        />
      </Helmet>

      <div className="min-h-screen bg-white text-slate-900">
        <Header />
        <Banners />

        <main>
          <BusinessDirectory />
          <HowItWorks />
        </main>

        <Footer />
      </div>
    </>
  );
}

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    async function resolveAdminExclusion() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) {
            setAnalyticsExcluded(false);
          }
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        const admin =
          String(profile?.role || "").toLowerCase() === "admin";

        if (!cancelled) {
          setAnalyticsExcluded(admin);
        }
      } catch (error) {
        console.warn("No se pudo comprobar el rol para analítica:", error);
      }
    }

    resolveAdminExclusion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      resolveAdminExclusion();
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    function createStableId(storage, key) {
      try {
        const existing = storage.getItem(key);
        if (existing) return existing;

        const generated =
          globalThis.crypto?.randomUUID?.() ||
          `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        storage.setItem(key, generated);
        return generated;
      } catch {
        return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      }
    }

    function argentinaDayKey() {
      return new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Argentina/Cordoba",
      });
    }

    async function registerPageView() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let userRole = "visitor";

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          userRole = String(profile?.role || "user").toLowerCase();
        }

        if (cancelled || userRole === "admin") return;

        const visitorId = createStableId(localStorage, "tc_visitor_id");
        const sessionId = createStableId(sessionStorage, "tc_session_id");
        const dayKey = argentinaDayKey();
        const uniqueVisitKey = `tc_unique_visit_${dayKey}`;

        let businessCity = "";

        if (location.pathname.includes("/categoria/")) {
          const parts = location.pathname.split("/");
          businessCity = decodeURIComponent(parts[3] || "");
        }

        const commonData = {
          path: location.pathname,
          business_city: businessCity,
          visitor_id: visitorId,
          anonymous_id: visitorId,
          device_id: visitorId,
          session_id: sessionId,
          user_id: user?.id || null,
          user_role: userRole,
          role: userRole,
          is_admin: false,
        };

        const events = [
          {
            ...commonData,
            event_type: "page_view",
          },
        ];

        if (!localStorage.getItem(uniqueVisitKey)) {
          events.push({
            ...commonData,
            event_type: "unique_visit",
          });
        }

        const { error } = await supabase.from("page_events").insert(events);

        if (error) {
          console.warn("No se pudo registrar la visita:", error);
          return;
        }

        if (events.some((event) => event.event_type === "unique_visit")) {
          localStorage.setItem(uniqueVisitKey, "1");
        }
      } catch (error) {
        console.warn("No se pudo registrar la visita:", error);
      }
    }

    registerPageView();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (isAnalyticsExcluded()) {
      return;
    }

    initializeMetaPixel();
    trackMetaPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleSearch = async (event) => {
      trackMetaStandardEvent("Search", {
        content_category: "directorio_comercial",
      });

      try {
        await supabase.from("page_events").insert([
          {
            event_type: "search",
            path: window.location.pathname,
            search: event.detail?.search || "",
            city: event.detail?.city || "",
            business_city: event.detail?.city || "",
          },
        ]);
      } catch {}
    };

    window.addEventListener("search", handleSearch);

    return () => {
      window.removeEventListener("search", handleSearch);
    };
  }, []);

  return null;
}

export default function App() {
  return (
    <>
      <AnalyticsTracker />
      <CookieConsent />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/planes" element={<PlansPage />} />
          <Route path="/register-business" element={<RegisterBusiness />} />
          <Route path="/editar/:id" element={<RegisterBusiness />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/studio/imagen/:id" element={<StudioImage />} />
          <Route path="/studio/imagen/:entityType/:id" element={<StudioImage />} />
          <Route path="/studio/carrusel/:entityType/:id" element={<StudioCarousel />} />
          <Route path="/studio/brand/:id" element={<BrandKit />} />
          <Route path="/studio/brand/:entityType/:id" element={<BrandKit />} />
          <Route path="/generar-reel/:id" element={<ReelGenerator />} />
          <Route path="/generar-reel/:entityType/:id" element={<ReelGenerator />} />
          <Route path="/studio/mentor/:entityType/:id" element={<Mentor />} />
          <Route path="/studio/historias" element={<StoriesManager />} />
          <Route path="/administracion" element={<Administration />} />
          <Route path="/crear-banner" element={<RegisterBanner />} />
          <Route path="/editar-banner/:id" element={<EditBanner />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/success" element={<Success />} />
          <Route path="/ayuda" element={<HelpCenter />} />
          <Route path="/ayuda/:section" element={<HelpCenter />} />
          <Route path="/categoria/:rubro/:ciudad" element={<CategoryPage />} />
          <Route path="/:slug" element={<BusinessView />} />
        </Routes>
      </Suspense>
    </>
  );
}
