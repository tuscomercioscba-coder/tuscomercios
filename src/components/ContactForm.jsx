import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    nombre: "",
    negocio: "",
    ciudad: "",
    whatsapp: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();

    const numeroDestino = "5493544573187"; // ⚠️ CAMBIÁ ESTE POR TU WHATSAPP REAL

    const texto = `Hola, quiero publicar mi negocio en Tus Comercios.%0A%0A` +
      `Nombre: ${form.nombre}%0A` +
      `Negocio: ${form.negocio}%0A` +
      `Ciudad: ${form.ciudad}%0A` +
      `WhatsApp: ${form.whatsapp}`;

    const url = `https://wa.me/${5493544573187}?text=${texto}`;
    window.open(url, "_blank");
  };

  return (
    <section id="contacto" className="py-14 md:py-20 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-10 text-white shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-bold">
              ¿Querés sumar tu negocio?
            </h2>
            <p className="mt-4 text-sm md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Completá tus datos y te abrimos WhatsApp automáticamente para recibir tu consulta.
            </p>
          </div>

          <form onSubmit={handleWhatsApp} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="nombre"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
              required
            />

            <input
              type="text"
              name="negocio"
              placeholder="Nombre del negocio"
              value={form.negocio}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
              required
            />

            <input
              type="text"
              name="ciudad"
              placeholder="Ciudad / zona"
              value={form.ciudad}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
              required
            />

            <input
              type="text"
              name="whatsapp"
              placeholder="Tu WhatsApp"
              value={form.whatsapp}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
              required
            />

            <button
              type="submit"
              className="md:col-span-2 mt-2 inline-flex items-center justify-center rounded-2xl bg-green-600 px-6 py-4 text-sm md:text-base font-bold text-white hover:bg-green-700 transition"
            >
              Enviar por WhatsApp
            </button>
          </form>

          <p className="mt-5 text-center text-xs md:text-sm text-slate-400">
            ⚠️ Recordá cambiar el número de WhatsApp dentro del archivo <strong>ContactForm.jsx</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}