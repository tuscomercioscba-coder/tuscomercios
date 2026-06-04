import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [banners, setBanners] = useState([]);
  const [pageEvents, setPageEvents] = useState([]);
  const [myUserId, setMyUserId] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("resumen");

  const [clicksByBusiness, setClicksByBusiness] = useState({});
  const [visitsByBusiness, setVisitsByBusiness] = useState({});
  const [viewsByBusiness, setViewsByBusiness] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    const userId = userData.user.id;
    setMyUserId(userId);

    const { data: myProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const admin = myProfile?.role === "admin";
    setIsAdmin(admin);

    const { data: allData } = await supabase.from("businesses").select("*");

    const { data: myBusinesses } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", userId);

    const { data: clicksData } = await supabase
      .from("clicks")
      .select("business_id");

    const { data: visitsData } = await supabase
      .from("visits")
      .select("business_id");

    const { data: viewsData } = await supabase
      .from("views")
      .select("business_id");

    const { data: pageEventsData } = await supabase
      .from("page_events")
      .select("*")
      .order("created_at", { ascending: false });

    const groupedClicks = groupByBusiness(clicksData || []);
    const groupedVisits = groupByBusiness(visitsData || []);
    const groupedViews = groupByBusiness(viewsData || []);

    setClicksByBusiness(groupedClicks);
    setVisitsByBusiness(groupedVisits);
    setViewsByBusiness(groupedViews);
    setPageEvents(pageEventsData || []);

    const sortedMyBusinesses = [...(myBusinesses || [])].sort((a, b) => {
      return (groupedClicks[b.id] || 0) - (groupedClicks[a.id] || 0);
    });

    setBusinesses(sortBusinessesByPlan(sortedMyBusinesses));
    setAllBusinesses(sortBusinessesByPlan(allData || []));

    let bannersQuery = supabase.from("banners").select(`
      *,
      businesses (
        id,
        negocio,
        slug,
        user_id
      )
    `);

    if (!admin) {
      bannersQuery = bannersQuery.eq("user_id", userId);
    }

    const { data: bannersData } = await bannersQuery;
    setBanners(bannersData || []);

    if (admin) {
      const { data: profilesData } = await supabase.from("profiles").select("*");

      const { data: subscriptionsData } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      setProfiles(profilesData || []);
      setSubscriptions(subscriptionsData || []);
    }

    setLoading(false);
  }

  function groupByBusiness(rows) {
    const grouped = {};

    rows.forEach((item) => {
      grouped[item.business_id] = (grouped[item.business_id] || 0) + 1;
    });

    return grouped;
  }

  function sortBusinessesByPlan(list) {
    const planOrder = {
      premium: 1,
      standard: 2,
      free: 3,
    };

    return [...(list || [])].sort((a, b) => {
      const planA = (a.plan || "free").toLowerCase();
      const planB = (b.plan || "free").toLowerCase();

      const byPlan = (planOrder[planA] || 99) - (planOrder[planB] || 99);

      if (byPlan !== 0) return byPlan;

      return (a.negocio || "").localeCompare(b.negocio || "");
    });
  }

  function money(value) {
    return `$${Number(value || 0).toLocaleString("es-AR")}`;
  }

  function getUserEmail(profile) {
    if (profile?.email) return profile.email;

    const sub = subscriptions.find((s) => s.user_id === profile.id);

    if (sub?.payer_email) return sub.payer_email;

    return "Email no disponible";
  }

  async function cancelMercadoPagoSubscription(mpSubscriptionId) {
    if (!mpSubscriptionId) return;

    const response = await fetch("/.netlify/functions/cancel-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mp_subscription_id: mpSubscriptionId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("ERROR CANCELANDO MP:", result);
      throw new Error(result?.error || "No se pudo cancelar en Mercado Pago");
    }

    return result;
  }

  const totalClicks = Object.values(clicksByBusiness).reduce((a, b) => a + b, 0);
  const totalViews = Object.values(viewsByBusiness).reduce((a, b) => a + b, 0);

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "authorized"
  );

  const pendingSubscriptions = subscriptions.filter(
    (s) => s.status === "pending"
  );

  const realMonthlyIncome = activeSubscriptions.reduce(
    (total, s) => total + Number(s.amount || 0),
    0
  );

  const paidBusinesses = businesses.filter(
    (b) => b.plan === "standard" || b.plan === "premium"
  );

  const canCreateBanner = isAdmin || paidBusinesses.length > 0;

  function getComparison(business) {
    const sameCategory = allBusinesses.filter(
      (x) => x.id !== business.id && x.rubro === business.rubro
    );

    if (sameCategory.length === 0) return null;

    const plansToCompare =
      business.plan === "free"
        ? ["standard", "premium"]
        : business.plan === "standard"
        ? ["premium"]
        : [];

    const filtered = sameCategory.filter((x) =>
      plansToCompare.includes(x.plan)
    );

    if (filtered.length === 0) return null;

    let avgViews = 0;
    let avgClicks = 0;

    filtered.forEach((b) => {
      avgViews += viewsByBusiness[b.id] || 0;
      avgClicks += clicksByBusiness[b.id] || 0;
    });

    return {
      avgViews: Math.round(avgViews / filtered.length),
      avgClicks: Math.round(avgClicks / filtered.length),
    };
  }

  async function deleteBusiness(id) {
    const confirmDelete = confirm("¿Eliminar este negocio?");
    if (!confirmDelete) return;

    await supabase.from("businesses").delete().eq("id", id);

    setBusinesses((prev) => prev.filter((b) => b.id !== id));
    setAllBusinesses((prev) => prev.filter((b) => b.id !== id));
  }

  async function changeBusinessPlan(businessId, plan) {
    await supabase.from("businesses").update({ plan }).eq("id", businessId);
    await getData();
  }

  async function cancelBusinessPlan(business) {
    const confirmCancel = confirm(
      "¿Querés dar de baja el plan pago de esta vidriera? La vidriera seguirá publicada en plan gratuito."
    );

    if (!confirmCancel) return;

    try {
      const ownerId = business.user_id || myUserId;

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", ownerId)
        .in("status", ["authorized", "pending"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscription?.mp_subscription_id) {
        await cancelMercadoPagoSubscription(subscription.mp_subscription_id);

        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("id", subscription.id);
      }

      await supabase
        .from("businesses")
        .update({ plan: "free" })
        .eq("id", business.id);

      await supabase
        .from("profiles")
        .update({ plan: "free" })
        .eq("id", ownerId);

      await getData();

      alert("La suscripción fue cancelada y la vidriera pasó a plan gratuito.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al cancelar el plan");
    }
  }

  async function cancelBanner(banner) {
    const confirmCancel = confirm(
      "¿Dar de baja este banner? Se cancelará la suscripción de Mercado Pago si existe."
    );

    if (!confirmCancel) return;

    try {
      if (banner.mp_subscription_id) {
        await cancelMercadoPagoSubscription(banner.mp_subscription_id);
      }

      await supabase
        .from("banners")
        .update({
          active: false,
          payment_status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", banner.id);

      await getData();

      alert("Banner dado de baja correctamente.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al dar de baja el banner");
    }
  }

  async function toggleBannerActive(id, currentValue) {
    await supabase
      .from("banners")
      .update({ active: !currentValue })
      .eq("id", id);

    await getData();
  }

  function goToBannerBusiness(banner) {
    if (banner.businesses?.slug) {
      navigate(`/${banner.businesses.slug}`);
      return;
    }

    alert("Este banner todavía no tiene una vidriera asociada correctamente.");
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow">
            Cargando panel...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-8 gap-3">
            <div>
              <h1 className="text-3xl font-black text-slate-800">
                {isAdmin ? "Panel de Control" : "Mi Panel"}
              </h1>

              <p className="text-gray-500 mt-1">
                {isAdmin
                  ? "Control profesional de negocios, pagos, banners y métricas."
                  : "Administrá tus negocios, banners y resultados."}
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              {isAdmin && (
                <button
                  onClick={() => navigate("/register-business?admin=true")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  + Crear negocio Admin
                </button>
              )}

              {canCreateBanner ? (
                <button
                  onClick={() => navigate("/crear-banner")}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition font-bold"
                >
                  + {isAdmin ? "Crear banner" : "Contratar banner"}
                </button>
              ) : (
                <button
                  onClick={() => navigate("/planes")}
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl hover:bg-purple-200 transition font-bold"
                >
                  Banner disponible en planes pagos
                </button>
              )}

              <button
                onClick={() => navigate("/planes")}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
              >
                + Agregar negocio
              </button>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-2xl shadow p-2 mb-8 flex gap-2 overflow-x-auto">
              {[
                ["resumen", "Resumen"],
                ["mis-negocios", "Mis negocios"],
                ["negocios", "Todos los negocios"],
                ["usuarios", "Usuarios"],
                ["suscripciones", "Suscripciones"],
                ["banners", "Banners"],
                ["metricas", "Métricas"],
                ["analiticas", "Analíticas"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap ${
                    activeTab === key
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {!isAdmin && (
            <>
              <StatsGrid
                items={[
                  ["Mis negocios", businesses.length, "bg-white", "text-slate-800"],
                  ["Mis banners", banners.length, "bg-pink-50", "text-pink-700"],
                  ["Vistas", totalViews, "bg-blue-50", "text-blue-700"],
                  ["Clicks WhatsApp", totalClicks, "bg-green-50", "text-green-700"],
                ]}
              />

              <BannerCTA canCreateBanner={canCreateBanner} navigate={navigate} />

              <UserBanners
                banners={banners}
                navigate={navigate}
                goToBannerBusiness={goToBannerBusiness}
                cancelBanner={cancelBanner}
                toggleBannerActive={toggleBannerActive}
              />

              <BusinessCards
                businesses={businesses}
                clicksByBusiness={clicksByBusiness}
                viewsByBusiness={viewsByBusiness}
                getComparison={getComparison}
                navigate={navigate}
                deleteBusiness={deleteBusiness}
                cancelBusinessPlan={cancelBusinessPlan}
              />
            </>
          )}

          {isAdmin && activeTab === "resumen" && (
            <>
              <StatsGrid
                items={[
                  ["Total negocios", allBusinesses.length, "bg-white", "text-slate-800"],
                  ["Usuarios", profiles.length, "bg-blue-50", "text-blue-700"],
                  ["Suscripciones activas", activeSubscriptions.length, "bg-green-50", "text-green-700"],
                  ["Pendientes", pendingSubscriptions.length, "bg-orange-50", "text-orange-700"],
                  ["Ingresos reales", money(realMonthlyIncome), "bg-purple-50", "text-purple-700"],
                  ["Banners", banners.length, "bg-pink-50", "text-pink-700"],
                  ["Clicks WhatsApp", totalClicks, "bg-green-50", "text-green-700"],
                  ["Vistas vidrieras", totalViews, "bg-blue-50", "text-blue-700"],
                ]}
              />

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <AdminBox title="Planes de negocios">
                  <Row label="Gratis" value={allBusinesses.filter((b) => b.plan === "free").length} />
                  <Row label="Estándar" value={allBusinesses.filter((b) => b.plan === "standard").length} />
                  <Row label="Premium" value={allBusinesses.filter((b) => b.plan === "premium").length} />
                </AdminBox>

                <AdminBox title="Suscripciones reales">
                  <Row label="Autorizadas" value={activeSubscriptions.length} />
                  <Row label="Pendientes" value={pendingSubscriptions.length} />
                  <Row label="Total registros" value={subscriptions.length} />
                  <Row label="Ingreso real mensual" value={money(realMonthlyIncome)} />
                </AdminBox>

                <AdminBox title="Acciones rápidas">
                  <button
                    onClick={() => navigate("/register-business?admin=true")}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mb-3"
                  >
                    Crear negocio
                  </button>

                  <button
                    onClick={() => navigate("/crear-banner")}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold mb-3"
                  >
                    Crear banner gratis
                  </button>

                  <button
                    onClick={() => navigate("/planes")}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
                  >
                    Ver planes
                  </button>
                </AdminBox>
              </div>
            </>
          )}

          {isAdmin && activeTab === "mis-negocios" && (
            <>
              <StatsGrid
                items={[
                  ["Mis negocios", businesses.length, "bg-white", "text-slate-800"],
                  ["Mis banners", banners.filter((b) => b.user_id === myUserId).length, "bg-pink-50", "text-pink-700"],
                  [
                    "Mis vistas",
                    businesses.reduce((total, b) => total + (viewsByBusiness[b.id] || 0), 0),
                    "bg-blue-50",
                    "text-blue-700",
                  ],
                  [
                    "Mis WhatsApp",
                    businesses.reduce((total, b) => total + (clicksByBusiness[b.id] || 0), 0),
                    "bg-green-50",
                    "text-green-700",
                  ],
                ]}
              />

              <BannerCTA canCreateBanner={true} navigate={navigate} isAdmin />

              <UserBanners
                banners={banners.filter((b) => b.user_id === myUserId)}
                navigate={navigate}
                goToBannerBusiness={goToBannerBusiness}
                cancelBanner={cancelBanner}
                toggleBannerActive={toggleBannerActive}
              />

              <BusinessCards
                businesses={businesses}
                clicksByBusiness={clicksByBusiness}
                viewsByBusiness={viewsByBusiness}
                getComparison={getComparison}
                navigate={navigate}
                deleteBusiness={deleteBusiness}
                cancelBusinessPlan={cancelBusinessPlan}
              />
            </>
          )}

          {isAdmin && activeTab === "negocios" && (
            <AdminTable title="Todos los negocios">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-3">Negocio</th>
                    <th className="p-3">Ciudad</th>
                    <th className="p-3">Rubro</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Clicks</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {allBusinesses.map((b) => (
                    <tr key={b.id} className="border-b">
                      <td className="p-3 font-bold">{b.negocio}</td>
                      <td className="p-3">{b.ciudad}</td>
                      <td className="p-3">{b.rubro}</td>
                      <td className="p-3">
                        <select
                          value={b.plan || "free"}
                          onChange={(e) => changeBusinessPlan(b.id, e.target.value)}
                          className="border rounded-lg px-2 py-1"
                        >
                          <option value="free">free</option>
                          <option value="standard">standard</option>
                          <option value="premium">premium</option>
                        </select>
                      </td>
                      <td className="p-3">{clicksByBusiness[b.id] || 0}</td>
                      <td className="p-3 flex gap-2 flex-wrap">
                        <button
                          onClick={() => navigate(`/${b.slug}`)}
                          className="bg-gray-200 px-3 py-1 rounded-lg"
                        >
                          Ver
                        </button>

                        <button
                          onClick={() => navigate(`/editar/${b.id}`)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg"
                        >
                          Editar
                        </button>

                        {b.plan !== "free" && (
                          <button
                            onClick={() => cancelBusinessPlan(b)}
                            className="bg-orange-500 text-white px-3 py-1 rounded-lg"
                          >
                            Cancelar plan
                          </button>
                        )}

                        <button
                          onClick={() => deleteBusiness(b.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTable>
          )}

          {isAdmin && activeTab === "usuarios" && (
            <AdminTable title="Usuarios registrados">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-3">Email</th>
                    <th className="p-3">Rol</th>
                    <th className="p-3">Negocios</th>
                  </tr>
                </thead>

                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td
                        className={`p-3 font-bold ${
                          getUserEmail(p) === "Email no disponible"
                            ? "text-gray-400"
                            : ""
                        }`}
                      >
                        {getUserEmail(p)}
                      </td>

                      <td className="p-3">{p.role || "user"}</td>

                      <td className="p-3">
                        {allBusinesses.filter((b) => b.user_id === p.id).length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTable>
          )}

          {isAdmin && activeTab === "suscripciones" && (
            <AdminTable title="Suscripciones Mercado Pago">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-3">Email</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">MP ID</th>
                  </tr>
                </thead>

                <tbody>
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="p-3 font-bold">{s.payer_email || "-"}</td>
                      <td className="p-3">{s.plan}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            s.status === "authorized"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3">{money(s.amount)}</td>
                      <td className="p-3 text-xs">{s.mp_subscription_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTable>
          )}

          {isAdmin && activeTab === "banners" && (
            <AdminTable title="Banners regionales">
              <div className="p-4 border-b">
                <button
                  onClick={() => navigate("/crear-banner")}
                  className="bg-purple-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-purple-700 transition"
                >
                  + Crear banner
                </button>
              </div>

              <BannersTable
                banners={banners}
                navigate={navigate}
                goToBannerBusiness={goToBannerBusiness}
                toggleBannerActive={toggleBannerActive}
                cancelBanner={cancelBanner}
              />
            </AdminTable>
          )}

          {isAdmin && activeTab === "metricas" && (
            <AdminTable title="Ranking por rendimiento">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-3">Negocio</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Vistas</th>
                    <th className="p-3">Clicks WhatsApp</th>
                    <th className="p-3">Conversión</th>
                  </tr>
                </thead>

                <tbody>
                  {[...allBusinesses]
                    .sort(
                      (a, b) =>
                        (clicksByBusiness[b.id] || 0) -
                        (clicksByBusiness[a.id] || 0)
                    )
                    .map((b) => {
                      const views = viewsByBusiness[b.id] || 0;
                      const clicks = clicksByBusiness[b.id] || 0;
                      const conversion = views ? Math.round((clicks / views) * 100) : 0;

                      return (
                        <tr key={b.id} className="border-b">
                          <td className="p-3 font-bold">{b.negocio}</td>
                          <td className="p-3">{b.plan || "free"}</td>
                          <td className="p-3">{views}</td>
                          <td className="p-3">{clicks}</td>
                          <td className="p-3">{conversion}%</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </AdminTable>
          )}

          {isAdmin && activeTab === "analiticas" && (
            <AdminAnalytics
              pageEvents={pageEvents}
              allBusinesses={allBusinesses}
              viewsByBusiness={viewsByBusiness}
              clicksByBusiness={clicksByBusiness}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

function BannerCTA({ canCreateBanner, navigate, isAdmin = false }) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl mb-8">
      <h2 className="text-2xl font-black mb-2">Banner regional destacado</h2>

      <p className="text-purple-100 mb-4">
        Mostrá tu negocio en los espacios principales de la plataforma y llevá visitantes directo a tu vidriera.
      </p>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="bg-white text-purple-700 px-5 py-3 rounded-2xl font-black">
          {isAdmin ? "Gratis para admin" : "$50.000 / mes"}
        </div>

        <button
          onClick={() =>
            canCreateBanner ? navigate("/crear-banner") : navigate("/planes")
          }
          className="bg-white/20 border border-white/30 px-5 py-3 rounded-2xl font-bold hover:bg-white/30 transition"
        >
          {canCreateBanner ? "Crear / contratar banner" : "Mejorar mi plan"}
        </button>
      </div>
    </div>
  );
}

function UserBanners({
  banners,
  navigate,
  goToBannerBusiness,
  cancelBanner,
  toggleBannerActive,
}) {
  if (banners.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow p-6 mb-8">
      <h2 className="text-2xl font-black mb-4">Mis banners</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="border rounded-2xl overflow-hidden bg-slate-50">
            {banner.image && (
              <img src={banner.image} alt={banner.title} className="w-full h-40 object-cover" />
            )}

            <div className="p-4">
              <h3 className="font-black text-lg">{banner.title}</h3>

              <p className="text-sm text-gray-500">
                {banner.businesses?.negocio || "Sin negocio asociado"}
              </p>

              <p className="text-sm mt-1">
                Estado:{" "}
                <b className={banner.active ? "text-green-600" : "text-red-600"}>
                  {banner.active ? "Activo" : "Inactivo"}
                </b>
              </p>

              <p className="text-sm mt-1">
                Pago: <b>{banner.payment_status || "-"}</b>
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => goToBannerBusiness(banner)} className="bg-gray-200 px-3 py-2 rounded-lg text-sm">
                  Ver negocio
                </button>

                <button onClick={() => navigate(`/editar-banner/${banner.id}`)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
                  Editar
                </button>

                <button onClick={() => toggleBannerActive(banner.id, banner.active)} className="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm">
                  {banner.active ? "Pausar" : "Reactivar"}
                </button>

                {banner.payment_status !== "cancelled" && (
                  <button onClick={() => cancelBanner(banner)} className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm">
                    Dar de baja
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BannersTable({
  banners,
  navigate,
  goToBannerBusiness,
  toggleBannerActive,
  cancelBanner,
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b">
          <th className="p-3">Imagen</th>
          <th className="p-3">Título</th>
          <th className="p-3">Negocio</th>
          <th className="p-3">Ciudad</th>
          <th className="p-3">Pago</th>
          <th className="p-3">Activo</th>
          <th className="p-3">Acciones</th>
        </tr>
      </thead>

      <tbody>
        {banners.map((b) => (
          <tr key={b.id} className="border-b">
            <td className="p-3">
              {b.image && (
                <img src={b.image} alt={b.title} className="w-24 h-14 object-cover rounded-lg" />
              )}
            </td>

            <td className="p-3 font-bold">{b.title || "-"}</td>
            <td className="p-3">{b.businesses?.negocio || "Sin negocio"}</td>
            <td className="p-3">{b.city || b.ciudad || "-"}</td>
            <td className="p-3">{b.payment_status || "-"}</td>

            <td className="p-3">
              <button
                onClick={() => toggleBannerActive(b.id, b.active)}
                className={`px-3 py-1 rounded-lg font-bold ${
                  b.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {b.active ? "Activo" : "Inactivo"}
              </button>
            </td>

            <td className="p-3 flex gap-2 flex-wrap">
              <button onClick={() => goToBannerBusiness(b)} className="bg-gray-200 px-3 py-1 rounded-lg">
                Ver negocio
              </button>

              <button onClick={() => navigate(`/editar-banner/${b.id}`)} className="bg-blue-600 text-white px-3 py-1 rounded-lg">
                Editar
              </button>

              {b.payment_status !== "cancelled" && (
                <button onClick={() => cancelBanner(b)} className="bg-red-500 text-white px-3 py-1 rounded-lg">
                  Dar de baja
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatsGrid({ items }) {
  return (
    <div className="grid md:grid-cols-4 gap-4 mb-8">
      {items.map(([label, value, bg, color]) => (
        <div key={label} className={`${bg} p-5 rounded-2xl shadow`}>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-3xl font-black ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

function AdminBox({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h3 className="font-black text-lg mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <b>{value}</b>
    </div>
  );
}

function AdminTable({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-x-auto">
      <div className="p-5 border-b">
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <div className="min-w-[900px]">{children}</div>
    </div>
  );
}

function BusinessCards({
  businesses,
  clicksByBusiness,
  viewsByBusiness,
  getComparison,
  navigate,
  deleteBusiness,
  cancelBusinessPlan,
}) {
  if (businesses.length === 0) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-500 mb-4">Todavía no cargaste ningún negocio</p>

        <button onClick={() => navigate("/planes")} className="bg-blue-600 text-white px-6 py-3 rounded-xl">
          Crear mi primer negocio
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {businesses.map((b) => {
        const comparison = getComparison(b);

        return (
          <div key={b.id} className="bg-white border rounded-3xl shadow hover:shadow-2xl transition overflow-hidden">
            {b.image && <img src={b.image} className="w-full h-52 object-cover" alt={b.negocio} />}

            <div className="p-5">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h2 className="text-xl font-bold">{b.negocio}</h2>
                  <p className="text-gray-500 text-sm">📍 {b.ciudad}</p>
                </div>

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

              <p className="text-sm mt-3 line-clamp-2 text-gray-600">{b.descripcion}</p>

              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-blue-50 p-3 rounded-2xl text-center">
                  <p className="text-xs text-gray-500">Vistas</p>
                  <p className="text-2xl font-bold text-blue-700">{viewsByBusiness[b.id] || 0}</p>
                </div>

                <div className="bg-green-50 p-3 rounded-2xl text-center">
                  <p className="text-xs text-gray-500">WhatsApp</p>
                  <p className="text-2xl font-bold text-green-700">{clicksByBusiness[b.id] || 0}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <p className="text-xs text-gray-500">Conversión</p>
                  <p className="text-2xl font-bold">
                    {viewsByBusiness[b.id]
                      ? Math.round(((clicksByBusiness[b.id] || 0) / viewsByBusiness[b.id]) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </div>

              {comparison && (
                <div className="mt-5 bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                  <h3 className="font-bold text-blue-800 mb-2">Comparativa de rendimiento</h3>

                  <p className="text-sm text-gray-700">
                    Negocios con planes superiores en tu rubro promedian:
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white p-3 rounded-xl border">
                      <p className="text-xs text-gray-500">Vistas promedio</p>
                      <p className="text-xl font-bold">{comparison.avgViews}</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border">
                      <p className="text-xs text-gray-500">Clicks promedio</p>
                      <p className="text-xl font-bold text-green-700">{comparison.avgClicks}</p>
                    </div>
                  </div>

                  {b.plan !== "premium" && (
                    <button onClick={() => navigate("/planes")} className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                      Mejorar mi plan 🚀
                    </button>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-5 flex-wrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/${b.slug}`);
                  }}
                  className="flex-1 bg-gray-200 py-3 rounded-xl text-sm hover:bg-gray-300"
                >
                  Ver
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/editar/${b.id}`);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm hover:bg-blue-700"
                >
                  Editar
                </button>

                {b.plan !== "free" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelBusinessPlan(b);
                    }}
                    className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-sm hover:bg-orange-600"
                  >
                    Cancelar plan
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBusiness(b.id);
                  }}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl text-sm hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminAnalytics({
  pageEvents,
  allBusinesses,
  viewsByBusiness,
  clicksByBusiness,
}) {
  function argentinaDateKey(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-CA", {
      timeZone: "America/Argentina/Cordoba",
    });
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Cordoba",
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function normalizeCity(city) {
    const clean = (city || "").toString().trim();
    return clean || "Sin localidad";
  }

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Cordoba",
  });

  const todayEvents = pageEvents.filter(
    (event) => argentinaDateKey(event.created_at) === today
  );

  const pageViewsToday = todayEvents.filter(
    (event) => event.event_type === "page_view"
  ).length;

  const searchesToday = todayEvents.filter(
    (event) => event.event_type === "search"
  ).length;

  const publishClicksToday = todayEvents.filter(
    (event) =>
      event.event_type === "click_publish_whatsapp" ||
      event.event_type === "click_quiero_aparecer"
  ).length;

  const dashboardClicksToday = todayEvents.filter(
    (event) => event.event_type === "click_dashboard_button"
  ).length;

  const totalPageViews = pageEvents.filter(
    (event) => event.event_type === "page_view"
  ).length;

  const totalSearches = pageEvents.filter(
    (event) => event.event_type === "search"
  ).length;

  const totalPublishClicks = pageEvents.filter(
    (event) =>
      event.event_type === "click_publish_whatsapp" ||
      event.event_type === "click_quiero_aparecer"
  ).length;

  const businessCityStats = Object.values(
    (allBusinesses || []).reduce((acc, business) => {
      const city = normalizeCity(business.ciudad);

      if (!acc[city]) {
        acc[city] = {
          city,
          businesses: 0,
          views: 0,
          clicks: 0,
        };
      }

      acc[city].businesses += 1;
      acc[city].views += viewsByBusiness[business.id] || 0;
      acc[city].clicks += clicksByBusiness[business.id] || 0;

      return acc;
    }, {})
  ).sort((a, b) => b.views - a.views || b.clicks - a.clicks);

  const searchCityStats = Object.values(
    pageEvents
      .filter((event) => event.event_type === "search")
      .reduce((acc, event) => {
        const city = normalizeCity(event.city || event.business_city);

        if (!acc[city]) {
          acc[city] = {
            city,
            searches: 0,
          };
        }

        acc[city].searches += 1;

        return acc;
      }, {})
  ).sort((a, b) => b.searches - a.searches);

  const generalCityEvents = Object.values(
    pageEvents.reduce((acc, event) => {
      const city = normalizeCity(event.business_city || event.city);

      if (!acc[city]) {
        acc[city] = {
          city,
          events: 0,
        };
      }

      acc[city].events += 1;

      return acc;
    }, {})
  ).sort((a, b) => b.events - a.events);

  const lastSearches = pageEvents
    .filter((event) => event.event_type === "search")
    .slice(0, 20);

  const mostVisitedPages = Object.entries(
    pageEvents
      .filter((event) => event.event_type === "page_view")
      .reduce((acc, event) => {
        const path = event.path || "/";
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  return (
    <div className="space-y-8">
      <StatsGrid
        items={[
          ["Visitas hoy", pageViewsToday, "bg-blue-50", "text-blue-700"],
          ["Búsquedas hoy", searchesToday, "bg-purple-50", "text-purple-700"],
          ["Interés publicar", publishClicksToday, "bg-green-50", "text-green-700"],
          ["Panel hoy", dashboardClicksToday, "bg-orange-50", "text-orange-700"],
        ]}
      />

      <StatsGrid
        items={[
          ["Visitas totales", totalPageViews, "bg-white", "text-slate-800"],
          ["Búsquedas", totalSearches, "bg-white", "text-slate-800"],
          ["Clicks publicar", totalPublishClicks, "bg-white", "text-slate-800"],
          ["Eventos", pageEvents.length, "bg-white", "text-slate-800"],
        ]}
      />

      <AdminTable title="📍 Rendimiento por localidad de comercios">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Localidad</th>
              <th className="p-3">Comercios</th>
              <th className="p-3">Vistas vidrieras</th>
              <th className="p-3">Clicks WhatsApp</th>
              <th className="p-3">Conversión</th>
            </tr>
          </thead>

          <tbody>
            {businessCityStats.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan="5">
                  Todavía no hay localidades con comercios cargados.
                </td>
              </tr>
            )}

            {businessCityStats.map((item) => {
              const conversion = item.views
                ? Math.round((item.clicks / item.views) * 100)
                : 0;

              return (
                <tr key={item.city} className="border-b">
                  <td className="p-3 font-bold">{item.city}</td>
                  <td className="p-3">{item.businesses}</td>
                  <td className="p-3">{item.views}</td>
                  <td className="p-3">{item.clicks}</td>
                  <td className="p-3">{conversion}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminTable>

      <div className="grid md:grid-cols-2 gap-6">
        <AdminTable title="🔎 Búsquedas por localidad">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Localidad buscada</th>
                <th className="p-3">Búsquedas</th>
              </tr>
            </thead>

            <tbody>
              {searchCityStats.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan="2">
                    Todavía no hay búsquedas por localidad.
                  </td>
                </tr>
              )}

              {searchCityStats.map((item) => (
                <tr key={item.city} className="border-b">
                  <td className="p-3 font-bold">{item.city}</td>
                  <td className="p-3">{item.searches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>

        <AdminTable title="📌 Eventos generales por localidad">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Localidad</th>
                <th className="p-3">Eventos</th>
              </tr>
            </thead>

            <tbody>
              {generalCityEvents.map((item) => (
                <tr key={item.city} className="border-b">
                  <td className="p-3 font-bold">{item.city}</td>
                  <td className="p-3">{item.events}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <AdminTable title="Páginas más visitadas">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Página</th>
                <th className="p-3">Visitas</th>
              </tr>
            </thead>

            <tbody>
              {mostVisitedPages.map(([path, count]) => (
                <tr key={path} className="border-b">
                  <td className="p-3 font-bold">{path}</td>
                  <td className="p-3">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>

        <AdminTable title="Últimas búsquedas">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Búsqueda</th>
                <th className="p-3">Ciudad</th>
                <th className="p-3">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {lastSearches.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan="3">
                    Todavía no hay búsquedas registradas.
                  </td>
                </tr>
              )}

              {lastSearches.map((event) => (
                <tr key={event.id} className="border-b">
                  <td className="p-3 font-bold">{event.search || "-"}</td>
                  <td className="p-3">{event.city || event.business_city || "-"}</td>
                  <td className="p-3">{formatDate(event.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>
      </div>

      <AdminTable title="Últimos eventos registrados">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Evento</th>
              <th className="p-3">Página</th>
              <th className="p-3">Búsqueda</th>
              <th className="p-3">Ciudad</th>
              <th className="p-3">Fecha</th>
            </tr>
          </thead>

          <tbody>
            {pageEvents.slice(0, 50).map((event) => (
              <tr key={event.id} className="border-b">
                <td className="p-3 font-bold">{event.event_type}</td>
                <td className="p-3">{event.path || "-"}</td>
                <td className="p-3">{event.search || "-"}</td>
                <td className="p-3">{event.city || event.business_city || "-"}</td>
                <td className="p-3">{formatDate(event.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTable>
    </div>
  );
}