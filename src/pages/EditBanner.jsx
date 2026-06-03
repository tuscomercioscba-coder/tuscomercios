import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";
import Layout from "../components/Layout";

export default function EditBanner() {
  const { id } = useParams();

  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    loadBanner();
  }, []);

  async function loadBanner() {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setBanner(data);
  }

  async function uploadImage(file) {
    const cleanName = file.name.replace(/\s+/g, "-");

    const fileName =
      `banner-${Date.now()}-${cleanName}`;

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

  async function saveBanner() {
    try {
      setLoading(true);

      let imageUrl = banner.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from("banners")
        .update({
          title: banner.title,
          subtitle: banner.subtitle,
          image: imageUrl,
          active: banner.active,
        })
        .eq("id", id);

      if (error) {
        console.error(error);
        alert("Error guardando banner");
        return;
      }

      alert("Banner actualizado correctamente 🚀");
    } catch (err) {
      console.error(err);
      alert("Error actualizando banner");
    } finally {
      setLoading(false);
    }
  }

  async function deactivateBanner() {
    const ok = window.confirm(
      "¿Dar de baja este banner?"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("banners")
      .update({
        active: false,
        payment_status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Error dando de baja");
      return;
    }

    alert("Banner dado de baja correctamente");

    window.location.href = "/dashboard";
  }

  if (!banner) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          Cargando banner...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">

        <div className="bg-white p-6 rounded-3xl shadow">

          <h1 className="text-3xl font-black mb-6">
            Editar Banner
          </h1>

          <div className="space-y-4">

            <input
              value={banner.title || ""}
              onChange={(e) =>
                setBanner({
                  ...banner,
                  title: e.target.value,
                })
              }
              placeholder="Título"
              className="input"
            />

            <input
              value={banner.subtitle || ""}
              onChange={(e) =>
                setBanner({
                  ...banner,
                  subtitle: e.target.value,
                })
              }
              placeholder="Subtítulo"
              className="input"
            />

            <div>
              <p className="font-semibold mb-2">
                Imagen
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(
                    e.target.files?.[0] || null
                  )
                }
              />
            </div>

            <label className="flex items-center gap-3">

              <input
                type="checkbox"
                checked={banner.active}
                onChange={(e) =>
                  setBanner({
                    ...banner,
                    active: e.target.checked,
                  })
                }
              />

              Banner activo

            </label>

            <div className="rounded-3xl overflow-hidden shadow-xl">

              <img
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : banner.image
                }
                className="w-full h-80 object-cover"
              />

            </div>

            <div className="flex gap-3">

              <button
                onClick={saveBanner}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black"
              >
                {loading
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>

              <button
                onClick={deactivateBanner}
                className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black"
              >
                Dar de baja banner
              </button>

            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
}