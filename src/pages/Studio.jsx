import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Layout from "../components/Layout";

import StudioHeader from "../components/studio/StudioHeader";
import StudioTemplates from "../components/studio/StudioTemplates";
import StudioCounters from "../components/studio/StudioCounters";
import StudioBusinessList from "../components/studio/StudioBusinessList";
import StudioLibrary from "../components/studio/StudioLibrary";
import StudioSidebar from "../components/studio/StudioSidebar";
import StudioColleague from "../components/studio/StudioColleague";

export default function Studio() {
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [usage, setUsage] = useState({ image: 0, reel: 0, story: 0 });
  const [activeSection, setActiveSection] = useState("inicio");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      loadUsage(selectedBusiness.id);
    }
  }, [selectedBusiness]);

  async function loadBusinesses() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("businesses")
      .select("id, negocio, slug, plan, image, ciudad, rubro")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      setBusinesses([]);
      setLoading(false);
      return;
    }

    const allowed = (data || []).filter(
      (b) => b.plan === "standard" || b.plan === "premium"
    );

    setBusinesses(allowed);
    setSelectedBusiness(allowed[0] || null);
    setLoading(false);
  }

  async function loadUsage(businessId) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("studio_usage")
      .select("content_type")
      .eq("business_id", businessId)
      .gte("created_at", startOfWeek.toISOString());

    if (error) {
      console.error(error);
      setUsage({ image: 0, reel: 0, story: 0 });
      return;
    }

    const counts = { image: 0, reel: 0, story: 0 };

    (data || []).forEach((item) => {
      if (counts[item.content_type] !== undefined) {
        counts[item.content_type] += 1;
      }
    });

    setUsage(counts);
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="bg-white rounded-3xl shadow p-8 font-bold">
            Cargando TusComercios Studio...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[260px_1fr] gap-6">
            <div className="lg:sticky lg:top-6 h-fit">
              <StudioSidebar
                active={activeSection}
                setActive={setActiveSection}
              />
            </div>

            <main className="space-y-6">
              <StudioHeader />

              {businesses.length === 0 ? (
                <section className="bg-white rounded-[2rem] shadow p-8 text-center border border-slate-100">
                  <div className="text-5xl mb-4">🔒</div>

                  <h2 className="text-2xl font-black mb-3">
                    Studio está disponible para Estándar y Premium
                  </h2>

                  <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
                    Cuando tu negocio tenga un plan pago, vas a poder acceder a
                    herramientas para crear contenido profesional.
                  </p>

                  <button
                    onClick={() => navigate("/planes")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-700 transition"
                  >
                    Ver planes
                  </button>
                </section>
              ) : (
                <>
                  <StudioBusinessList
                    businesses={businesses}
                    selectedBusiness={selectedBusiness}
                    setSelectedBusiness={setSelectedBusiness}
                  />

                  <StudioCounters
                    selectedBusiness={selectedBusiness}
                    usage={usage}
                  />

                  <StudioColleague
                    business={selectedBusiness}
                    navigate={navigate}
                  />

                  <StudioTemplates
                    setIdea={() => {}}
                    setSelectedFormat={() => {}}
                  />

                  <StudioLibrary />
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}