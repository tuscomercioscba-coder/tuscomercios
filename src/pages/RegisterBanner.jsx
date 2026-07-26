import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Layout from "../components/Layout";
import { trackMetaStandardEvent } from "../services/analytics/metaPixel";

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

  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

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

    let query = supabase
      .from("businesses")
      .select("id, negocio, ciudad, provincia, plan, user_id");

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
  }

  async function optimizeImage(file) {
    if (!file?.type?.startsWith("image/")) {
      return file;
    }

    try {
      const imageUrl = URL.createObjectURL(file);

      const img = await new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = imageUrl;
      });

      const maxWidth = 1600;
      const maxHeight = 900;

      let width = img.width;
      let height = img.height;

      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(imageUrl);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.78);
      });

      if (!blob) return file;

      const originalName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      return new File([blob], `${originalName || "banner"}-optimizado.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    } catch (error) {
      console.log("No se pudo optimizar el banner:", error);
      return file;
    }
  }

  async function uploadImage(file, userId) {
    const optimizedFile = await optimizeImage(file);

    const cleanName = optimizedFile.name
      .replace(/\s+/g, "-")
      .replace(/[^\w.-]/g, "")
      .toLowerCase();

    const fileName = `${userId}/banner-${Date.now()}-${cleanName}`;

    const { error } = await supabase.storage
      .from("business-images")
      .upload(fileName, optimizedFile, {
        cacheControl: "31536000",
        upsert: true,
        contentType: optimizedFile.type || "image/jpeg",
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("business-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function createMercadoPagoBannerSubscription({ bannerId }) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    }

    const response = await fetch("/api/create-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        type: "banner",
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

    trackMetaStandardEvent("InitiateCheckout", {
      content_name: "banner_regional",
      content_category: "suscripcion",
      value: 50000,
      currency: "ARS",
    });

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

      const imageUrl = await uploadImage(imageFile, user.id);

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
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input"
              />

              <input
                placeholder="Subtítulo del banner"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="input"
              />

              <div>
                <p className="font-bold mb-2">Imagen del banner</p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImage(e.target.files?.[0])}
                />

                <p className="text-xs text-gray-500 mt-1">
                  La imagen se optimiza automáticamente antes de subir.
                </p>
              </div>

              {preview && (
                <div className="rounded-3xl overflow-hidden shadow-xl relative bg-slate-100">
                  <img
                    src={preview}
                    className="w-full h-72 object-cover"
                    alt="Vista previa del banner"
                    loading="lazy"
                    decoding="async"
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
