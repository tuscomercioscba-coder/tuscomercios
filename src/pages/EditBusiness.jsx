import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Layout from "../components/Layout";

const DIAS_ORDEN = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

export default function EditBusiness() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBusiness();
  }, []);

  // 🔥 TRAER + CONVERTIR HORARIOS
  const getBusiness = async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert("Error cargando negocio");
      return;
    }

    let horariosFix = {};

    if (data.horarios) {
      DIAS_ORDEN.forEach((dia) => {
        const value = data.horarios[dia];

        if (typeof value === "string" && value.includes("-")) {
          const [open, close] = value.split("-");
          horariosFix[dia] = { open, close };
        } else {
          horariosFix[dia] = { open: "", close: "" };
        }
      });
    }

    setForm({
      ...data,
      horarios: horariosFix,
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📸 SUBIR IMÁGENES
  const uploadImages = async () => {
    let urls = [];
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    }

    for (let file of images) {
      const safeName = String(file.name || "imagen")
        .replace(/\s+/g, "-")
        .replace(/[^\w.-]/g, "")
        .toLowerCase();
      const fileName = `${user.id}/${Date.now()}-${safeName}`;

      const { error } = await supabase.storage
        .from("business-images")
        .upload(fileName, file);

      if (error) {
        console.error(error);
        continue;
      }

      const { data } = supabase.storage
        .from("business-images")
        .getPublicUrl(fileName);

      urls.push(data.publicUrl);
    }

    return urls;
  };

  // 💾 GUARDAR
  const handleSave = async () => {
    try {
      setLoading(true);

      let newImages = [];

      if (images.length > 0) {
        newImages = await uploadImages();
      }

      const updatedImages = [
        ...(form.images || []),
        ...newImages,
      ];

      // 🔥 VOLVER A STRING PARA GUARDAR
      let horariosFix = {};

      if (form.horarios) {
        DIAS_ORDEN.forEach((dia) => {
          const h = form.horarios[dia];

          if (h?.open && h?.close) {
            horariosFix[dia] = `${h.open}-${h.close}`;
          } else {
            horariosFix[dia] = "Cerrado";
          }
        });
      }

      const { plan, id: _, user_id, ...safeForm } = form;

      const { error } = await supabase
        .from("businesses")
        .update({
          ...safeForm,
          horarios: horariosFix,
          images: updatedImages,
          image:
            updatedImages.length > 0
              ? updatedImages[0]
              : form.image || "",
        })
        .eq("id", id);

      if (error) throw error;

      alert("Negocio actualizado 🚀");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Error guardando");
    } finally {
      setLoading(false);
    }
  };

  if (!form)
    return (
      <Layout>
        <p className="text-center mt-10">Cargando...</p>
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">

        <h1 className="text-3xl font-bold mb-6">
          Editar negocio
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow space-y-4">

          {/* 🖼️ PREVIEW */}
          {form.image && (
            <img
              src={form.image}
              onError={(e) => (e.target.style.display = "none")}
              className="w-full h-48 object-cover rounded-xl border"
            />
          )}

          <input name="negocio" value={form.negocio || ""} onChange={handleChange} className="input"/>
          <input name="ciudad" value={form.ciudad || ""} onChange={handleChange} className="input"/>
          <input name="provincia" value={form.provincia || ""} onChange={handleChange} className="input"/>

          <textarea name="descripcion" value={form.descripcion || ""} onChange={handleChange} className="input"/>

          <input name="whatsapp" value={form.whatsapp || ""} onChange={handleChange} className="input"/>

          {/* 📸 SUBIR */}
          <div>
            <p className="font-semibold">Agregar imágenes</p>
            <input
              type="file"
              multiple
              onChange={(e) =>
                setImages(Array.from(e.target.files))
              }
            />
          </div>

          {/* 🖼️ GALERÍA */}
          {form.images?.length > 0 && (
            <div>
              <p className="font-semibold">Imágenes actuales</p>

              <div className="flex gap-2 overflow-x-auto">
                {form.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 🔥 HORARIOS ORDENADOS CORRECTOS */}
          {form.horarios && (
            <div>
              <p className="font-semibold mb-2">Horarios</p>

              {DIAS_ORDEN.map((dia) => {
                const h = form.horarios[dia];

                return (
                  <div key={dia} className="flex justify-between text-sm border-b py-1">
                    <span className="capitalize">{dia}</span>
                    <span>
                      {h?.open && h?.close
                        ? `${h.open} - ${h.close}`
                        : "Cerrado"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>

        </div>
      </div>
    </Layout>
  );
}
