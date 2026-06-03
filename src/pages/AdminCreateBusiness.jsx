import { useState } from "react";
import { supabase } from "../supabase";
import Layout from "../components/Layout";

export default function AdminCreateBusiness() {
  const [form, setForm] = useState({
    nombre: "",
    negocio: "",
    ciudad: "",
    provincia: "",
    descripcion: "",
    whatsapp: "",
    plan: "free",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from("businesses").insert([
        {
          ...form,
          // 👑 SIN USER → es admin
        },
      ]);

      if (error) throw error;

      alert("Negocio creado como ADMIN 🚀");
    } catch (err) {
      console.log(err);
      alert("Error");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 max-w-xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Crear Negocio (Admin)
        </h1>

        <div className="space-y-4">

          <input name="nombre" placeholder="Tu nombre" onChange={handleChange} className="w-full border p-2 rounded"/>
          <input name="negocio" placeholder="Nombre del negocio" onChange={handleChange} className="w-full border p-2 rounded"/>
          <input name="ciudad" placeholder="Ciudad" onChange={handleChange} className="w-full border p-2 rounded"/>
          <input name="provincia" placeholder="Provincia" onChange={handleChange} className="w-full border p-2 rounded"/>

          <textarea name="descripcion" placeholder="Descripción" onChange={handleChange} className="w-full border p-2 rounded"/>

          <input name="whatsapp" placeholder="WhatsApp" onChange={handleChange} className="w-full border p-2 rounded"/>

          <select
            name="plan"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="free">Gratis</option>
            <option value="standard">Estándar</option>
            <option value="premium">Premium</option>
          </select>

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white p-3 rounded w-full"
          >
            Crear negocio
          </button>

        </div>

      </div>
    </Layout>
  );
}