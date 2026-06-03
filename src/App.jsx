import { Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet-async";

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
        <title>
          Tus Comercios | Negocios y comercios de Argentina
        </title>

        <meta
          name="description"
          content="Encontrá comercios, negocios, servicios y empresas de toda Argentina. Publicá tu negocio en Tus Comercios."
        />

        <meta
          name="keywords"
          content="comercios, negocios, empresas, argentina, vidriera digital, servicios, locales"
        />

        <meta
          property="og:title"
          content="Tus Comercios"
        />

        <meta
          property="og:description"
          content="La nueva plataforma de comercios de Argentina."
        />

        <meta
          property="og:type"
          content="website"
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

export default function App() {
  return (
    <Routes>
      {/* 🏠 HOME */}
      <Route
        path="/"
        element={<Home />}
      />

      {/* 👤 USUARIO */}
      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/login"
        element={<Auth />}
      />

      {/* 📋 PLANES */}
      <Route
        path="/planes"
        element={<PlansPage />}
      />

      {/* 🏪 CREAR / EDITAR NEGOCIO */}
      <Route
        path="/register-business"
        element={<RegisterBusiness />}
      />

      <Route
        path="/editar/:id"
        element={<RegisterBusiness />}
      />

      {/* 🎯 CREAR / EDITAR BANNER */}
      <Route
        path="/crear-banner"
        element={<RegisterBanner />}
      />

      <Route
        path="/editar-banner/:id"
        element={<EditBanner />}
      />

      {/* 👤 DASHBOARD */}
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      {/* 🎉 SUCCESS */}
      <Route
        path="/success"
        element={<Success />}
      />

      {/* 📂 CATEGORÍAS */}
      <Route
        path="/categoria/:rubro/:ciudad"
        element={<CategoryPage />}
      />

      {/* 🏪 NEGOCIO */}
      <Route
        path="/:slug"
        element={<BusinessView />}
      />
    </Routes>
  );
}