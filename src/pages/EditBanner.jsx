import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";
import Layout from "../components/Layout";

export default function EditBanner() {
  const { id } = useParams();

  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    loadBanner();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

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

  async function uploadImage(file) {
    const optimizedFile = await optimizeImage(file);

    const cleanName = optimizedFile.name
      .replace(/\s+/g, "-")
      .replace(/[^\w.-]/g, "")
      .toLowerCase();

    const fileName = `banner-${Date.now()}-${cleanName}`;

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
    const ok = window.confirm("¿Dar de baja este banner?");

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
        <div className="max-w-4xl mx-auto">Cargando banner...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-3xl shadow">
          <h1 className="text-3xl font-black mb-6">Editar Banner</h1>

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
              <p className="font-semibold mb-2">Imagen</p>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />

              <p className="text-xs text-gray-500 mt-1">
                La imagen se optimiza automáticamente antes de subir.
              </p>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={Boolean(banner.active)}
                onChange={(e) =>
                  setBanner({
                    ...banner,
                    active: e.target.checked,
                  })
                }
              />

              Banner activo
            </label>

            <div className="rounded-3xl overflow-hidden shadow-xl bg-slate-100">
              <img
                src={previewUrl || banner.image}
                className="w-full h-80 object-cover"
                alt={banner.title || "Banner"}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveBanner}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Guardar cambios"}
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