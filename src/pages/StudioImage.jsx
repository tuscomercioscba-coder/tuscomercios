import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import Layout from "../components/Layout";

export default function StudioImage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [type, setType] = useState("promo");
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    loadBusiness();
  }, [id]);

  async function loadBusiness() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    setUserId(user.id);

    const { data } = await supabase
      .from("businesses")
      .select("id, negocio, plan, image, rubro, ciudad, user_id")
      .eq("id", id)
      .single();

    if (!data || data.user_id !== user.id) {
      navigate("/studio");
      return;
    }

    if (data.plan !== "standard" && data.plan !== "premium") {
      navigate("/planes");
      return;
    }

    setBusiness(data);
    setLoading(false);
  }

  async function handleGenerateImage() {
    if (!prompt.trim()) {
      alert("Escribí qué imagen querés crear.");
      return;
    }

    try {
      setGenerating(true);

      const { error } = await supabase.from("studio_usage").insert([
        {
          user_id: userId,
          business_id: business.id,
          content_type: "image",
          plan: business.plan || "standard",
        },
      ]);

      if (error) {
        console.error(error);
        alert("No se pudo registrar el uso.");
        return;
      }

      setGenerated(true);
      alert("Imagen registrada correctamente. Próximo paso: conectar IA.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-8 text-center">Cargando creador de imágenes...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/studio")}
            className="mb-5 bg-white px-4 py-2 rounded-xl font-bold shadow"
          >
            ← Volver al Studio
          </button>

          <div className="bg-gradient-to-r from-slate-950 to-purple-900 rounded-3xl p-8 text-white shadow-xl mb-6">
            <h1 className="text-4xl font-black mb-2">
              🖼️ Crear imagen con IA
            </h1>

            <p className="text-purple-100">
              Creá imágenes profesionales para redes sociales, promociones,
              historias y publicaciones.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl shadow p-6">
              <h2 className="text-2xl font-black mb-4">{business.negocio}</h2>

              <div className="grid gap-3 mb-5">
                {[
                  ["promo", "🔥 Promoción"],
                  ["producto", "📦 Producto o servicio"],
                  ["flyer", "📢 Flyer"],
                  ["historia", "📱 Historia 9:16"],
                  ["post", "⬜ Post cuadrado"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setType(value)}
                    className={`text-left px-4 py-3 rounded-2xl font-bold border ${
                      type === value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ejemplo: Crear una imagen promocional para vender combos de Netflix, Disney y HBO, moderna, llamativa, con estilo profesional..."
                className="w-full h-40 border rounded-2xl p-4 outline-none"
              />

              <button
                onClick={handleGenerateImage}
                disabled={generating || !prompt.trim()}
                className="mt-4 w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition disabled:opacity-50"
              >
                {generating ? "Registrando..." : "Generar imagen"}
              </button>

              {generated && (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl font-bold">
                  ✅ Imagen registrada. El contador del Studio ya debería sumar 1.
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow p-6">
              <h2 className="text-2xl font-black mb-4">Vista previa</h2>

              <div className="aspect-[9/16] bg-gradient-to-br from-slate-900 to-blue-700 rounded-3xl p-6 text-white flex flex-col justify-between">
                <div>
                  <p className="text-sm bg-white/20 inline-block px-3 py-1 rounded-full font-bold">
                    TusComercios Studio
                  </p>

                  <h3 className="text-4xl font-black mt-6">
                    {business.negocio}
                  </h3>

                  <p className="text-blue-100 mt-2">
                    {business.rubro} · {business.ciudad}
                  </p>
                </div>

                <div className="bg-white/15 rounded-2xl p-4">
                  <p className="font-bold">Tipo: {type}</p>

                  <p className="text-sm text-blue-100 mt-2">
                    {prompt ||
                      "Tu idea aparecerá acá como base para generar la imagen."}
                  </p>
                </div>

                <p className="text-sm text-blue-100">
                  www.tuscomercios.com.ar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}