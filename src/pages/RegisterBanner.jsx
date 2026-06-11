import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Layout from "../components/Layout";

export default function RegisterBanner() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [form, setForm] = useState({ title: "", subtitle: "" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const admin = profile?.role === "admin";
    setIsAdmin(admin);

    let query = supabase.from("businesses").select("*");

    if (!admin) {
      query = query.eq("user_id", user.id);
    }

    const { data } = await query;

    const allowed = admin
      ? data || []
      : (data || []).filter(
          (b) => b.plan === "standard" || b.plan === "premium"
        );

    setBusinesses(allowed);
  }

  function handleImage(file) {
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function uploadImage(file) {
    const cleanName = file.name.replace(/\s+/g, "-");
    const fileName = `banner-${Date.now()}-${cleanName}`;

    const { error } = await supabase.storage
      .from("business-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("business-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function createMercadoPagoBannerSubscription({ user, bannerId }) {
    const response = await fetch("/./api/create-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "banner",
        user_id: user.id,
        email: user.email,
        banner_id: bannerId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("MP BANNER ERROR:", result);
      throw new Error(result?.error || "Error creando pago del banner");
    }

    if (!result.init_point) {
      throw new Error("Mercado Pago no devolvió link de pago");
    }

    window.location.href = result.init_point;
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Iniciá sesión");
        return;
      }

      const business = businesses.find((b) => b.id === selectedBusiness);

      if (!business) {
        alert("Elegí un negocio");
        return;
      }

      if (!isAdmin && business.plan === "free") {
        alert("Los banners están disponibles solo para planes Estándar y Premium.");
        return;
      }

      if (!form.title || !form.subtitle) {
        alert("Completá título y subtítulo");
        return;
      }

      if (!imageFile) {
        alert("Subí una imagen para el banner");
        return;
      }

      const { data: existingBanner } = await supabase
        .from("banners")
        .select("id")
        .eq("business_id", business.id)
        .eq("active", true)
        .maybeSingle();

      if (existingBanner && !isAdmin) {
        alert("Este negocio ya tiene un banner activo. Podés editarlo desde tu panel.");
        return;
      }

      const imageUrl = await uploadImage(imageFile);

      const payload = {
        business_id: business.id,
        user_id: user.id,
        title: form.title,
        subtitle: form.subtitle,
        image: imageUrl,
        city: business.ciudad || "",
        province: business.provincia || "",
        price: 50000,
        amount: 50000,
        payment_status: isAdmin ? "admin_free" : "pending",
        active: isAdmin ? true : false,
        starts_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      const { data: insertedBanner, error } = await supabase
        .from("banners")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error(error);
        alert(JSON.stringify(error));
        return;
      }

      if (isAdmin) {
        alert("Banner creado y activado correctamente 🚀");
        window.location.href = "/dashboard";
        return;
      }

      await createMercadoPagoBannerSubscription({
        user,
        bannerId: insertedBanner.id,
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Error creando banner");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow p-6">
          <h1 className="text-3xl font-black mb-2">
            {isAdmin ? "Crear banner regional" : "Contratar banner regional"}
          </h1>

          <p className="text-gray-500 mb-6">
            El banner se asocia a una vidriera y al hacer click lleva directo al negocio.
          </p>

          {!isAdmin && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl mb-6">
              Disponible para planes Estándar y Premium. Precio:{" "}
              <b>$50.000 / mes</b>.
            </div>
          )}

          {businesses.length === 0 ? (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 p-5 rounded-2xl">
              No tenés negocios Estándar o Premium disponibles para contratar banners.
            </div>
          ) : (
            <div className="space-y-4">
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="input"
              >
                <option value="">Elegí el negocio</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.negocio} - {b.ciudad} - {b.plan}
                  </option>
                ))}
              </select>

              <input
                placeholder="Título del banner"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                className="input"
              />

              <input
                placeholder="Subtítulo del banner"
                value={form.subtitle}
                onChange={(e) =>
                  setForm({ ...form, subtitle: e.target.value })
                }
                className="input"
              />

              <div>
                <p className="font-bold mb-2">Imagen del banner</p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImage(e.target.files[0])}
                />
              </div>

              {preview && (
                <div className="rounded-3xl overflow-hidden shadow-xl relative">
                  <img
                    src={preview}
                    className="w-full h-72 object-cover"
                  />

                  <div className="absolute inset-0 bg-black/50"></div>

                  <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                    <h2 className="text-3xl font-black">
                      {form.title || "Título del banner"}
                    </h2>

                    <p className="text-lg mt-2">
                      {form.subtitle || "Subtítulo del banner"}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-black hover:bg-green-700 transition disabled:opacity-60"
              >
                {loading
                  ? "Procesando..."
                  : isAdmin
                  ? "Crear banner gratis"
                  : "Pagar banner con Mercado Pago"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}