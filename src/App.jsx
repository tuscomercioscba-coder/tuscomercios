import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "./supabase";

import Header from "./components/Header";
import BusinessDirectory from "./components/BusinessDirectory";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import Plans from "./components/Plans";
import Banners from "./components/Banners";

import CategoryPage from "./pages/CategoryPage";
import BusinessView from "./pages/BusinessView";
import RegisterBanner from "./pages/RegisterBanner";
import EditBanner from "./pages/EditBanner";

import Auth from "./components/Auth";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import RegisterBusiness from "./pages/RegisterBusiness";
import PlansPage from "./pages/PlansPage";
import Success from "./pages/Success";

function Home() {
  return (
    <>
      <Helmet>
        <title>Tus Comercios | Negocios y comercios de Argentina</title>

        <meta
          name="description"
          content="Encontrá comercios, negocios, servicios y empresas de toda Argentina. Publicá tu negocio en Tus Comercios."
        />

        <meta
          name="keywords"
          content="comercios, negocios, empresas, argentina, vidriera digital, servicios, locales"
        />

        <meta property="og:title" content="Tus Comercios" />

        <meta
          property="og:description"
          content="La nueva plataforma de comercios de Argentina."
        />

        <meta property="og:type" content="website" />

        <meta property="og:url" content="https://tuscomercios.com.ar" />
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
    async function registerPageView() {
      await supabase.from("page_events").insert([
        {
          event_type: "page_view",
          path: location.pathname,
        },
      ]);
    }

    registerPageView();
  }, [location.pathname]);

  useEffect(() => {
    const handleSearchEvent = async (e) => {
      await supabase.from("page_events").insert([
        {
          event_type: "search",
          path: window.location.pathname,
          search: e.detail?.search || "",
          city: e.detail?.city || "",
        },
      ]);
    };

    window.addEventListener("search", handleSearchEvent);

    return () => window.removeEventListener("search", handleSearchEvent);
  }, []);

  return null;
}

export default function App() {
  return (
    <>
      <AnalyticsTracker />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Auth />} />

        <Route path="/planes" element={<PlansPage />} />

        <Route path="/register-business" element={<RegisterBusiness />} />

        <Route path="/editar/:id" element={<RegisterBusiness />} />

        <Route path="/crear-banner" element={<RegisterBanner />} />

        <Route path="/editar-banner/:id" element={<EditBanner />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/success" element={<Success />} />

        <Route path="/categoria/:rubro/:ciudad" element={<CategoryPage />} />

        <Route path="/:slug" element={<BusinessView />} />
      </Routes>
    </>
  );
}