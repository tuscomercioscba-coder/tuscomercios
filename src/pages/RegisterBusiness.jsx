import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const DIAS_ORDEN = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const PLAN_LIMITS = {
  free: {
    maxImages: 2,
    maxDescription: 280,
    social: false,
    web: false,
    video: false,
    services: false,
  },
  standard: {
    maxImages: 6,
    maxDescription: 700,
    social: true,
    web: false,
    video: false,
    services: false,
  },
  premium: {
    maxImages: 10,
    maxDescription: 1500,
    social: true,
    web: true,
    video: true,
    services: true,
  },
};

const PROVINCIAS_LOCALIDADES = {
  Córdoba: [
    "Villa Dolores",
    "Córdoba Capital",
    "Mina Clavero",
    "Villa Cura Brochero",
    "San Pedro",
    "San Javier",
    "Yacanto",
    "Nono",
    "Las Rabonas",
    "Los Hornillos",
    "La Paz",
    "Luyaba",
    "Villa Sarmiento",
    "Las Tapias",
    "San José",
    "Villa de las Rosas",
    "Los Cerrillos",
    "Salsacate",
    "Carlos Paz",
    "Alta Gracia",
    "Río Cuarto",
    "Villa María",
    "San Francisco",
    "Río Tercero",
    "Bell Ville",
    "Jesús María",
    "Cosquín",
    "La Falda",
    "Cruz del Eje",
    "Deán Funes",
    "Marcos Juárez",
    "Laboulaye",
  ],
  "San Luis": [
    "San Luis Capital",
    "Villa de Merlo",
    "Villa Mercedes",
    "La Punta",
    "Juana Koslay",
    "Santa Rosa del Conlara",
    "Concarán",
    "Naschel",
    "Tilisarao",
    "Justo Daract",
    "Quines",
    "Candelaria",
    "Buena Esperanza",
    "La Toma",
    "Carpintería",
    "Los Molles",
    "Cortaderas",
    "Papagayos",
    "Lafinur",
  ],
};


function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyHorarios = () =>
  DIAS_ORDEN.reduce((acc, dia) => {
    acc[dia] = {
      open: "",
      close: "",
      open2: "",
      close2: "",
    };
    return acc;
  }, {});

function calculateCompletion(data, horariosData) {
  let score = 0;

  if (data.negocio && data.rubro && data.whatsapp) score += 15;
  if (data.image || (Array.isArray(data.images) && data.images.length > 0)) score += 25;
  if ((data.descripcion || "").trim().length >= 40) score += 20;
  if (data.ciudad && data.provincia && data.direccion) score += 20;

  const hasHorario = DIAS_ORDEN.some((dia) => {
    const h = horariosData?.[dia];
    if (!h) return false;
    return (h.open && h.close) || (h.open2 && h.close2);
  });

  if (hasHorario) score += 20;

  return Math.min(score, 100);
}


function LockedPlanField({ title, requiredPlan, description, onUpgrade }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-slate-800">🔒 {title}</p>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
          <p className="text-xs text-blue-700 font-bold mt-2">
            Disponible en plan {requiredPlan}
          </p>
        </div>

        <button
          type="button"
          onClick={onUpgrade}
          className="bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-black hover:bg-blue-700 transition"
        >
          Ver planes
        </button>
      </div>
    </div>
  );
}

export default function RegisterBusiness() {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();

  const planParam = searchParams.get("plan");
  const continueMode = searchParams.get("continue") === "true";
  const selectedPlanParam =
    planParam || localStorage.getItem("selectedPlan") || "free";
  const isAdmin = searchParams.get("admin") === "true";

  const [userPlan, setUserPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [quickLoading, setQuickLoading] = useState(false);

  const [form, setForm] = useState({
    negocio: "",
    rubro: "",
    ciudad: "",
    provincia: "",
    direccion: "",
    descripcion: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    email: "",
    web: "",
    servicios: "",
    image: "",
    images: [],
    video: "",
    lat: null,
    lng: null,
    plan: selectedPlanParam || "free",
    status: "draft",
    completion: 0,
  });

  const activePlan = isAdmin
    ? form.plan || "free"
    : userPlan || selectedPlanParam || form.plan || "free";

  const limits = PLAN_LIMITS[activePlan] || PLAN_LIMITS.free;

  const [horarios, setHorarios] = useState(emptyHorarios());

  const [images, setImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [id]);

  useEffect(() => {
    if (!id && continueMode) {
      restorePendingBusiness();
    }
  }, []);

  function restorePendingBusiness() {
    try {
      const pendingBusiness = JSON.parse(
        localStorage.getItem("pendingBusiness") || "{}"
      );

      const selectedPlan =
        localStorage.getItem("selectedPlan") || selectedPlanParam || "free";

      setForm((prev) => ({
        ...prev,
        negocio: pendingBusiness.negocio || prev.negocio,
        rubro: pendingBusiness.rubro || prev.rubro,
        whatsapp: pendingBusiness.whatsapp || prev.whatsapp,
        ciudad: pendingBusiness.ciudad || prev.ciudad,
        provincia: pendingBusiness.provincia || prev.provincia,
        plan: selectedPlan,
      }));
    } catch (error) {
      console.log(error);
    }
  }

  function savePendingBusiness() {
    localStorage.setItem(
      "pendingBusiness",
      JSON.stringify({
        negocio: form.negocio,
        rubro: form.rubro,
        whatsapp: form.whatsapp,
        ciudad: form.ciudad,
        provincia: form.provincia,
      })
    );
  }

  async function loadInitialData() {
    setLoadingPlan(true);

    const realPlan = await loadUserPlan();

    if (id) {
      await loadBusiness(realPlan);
    }

    setLoadingPlan(false);
  }

  async function loadUserPlan() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserPlan(null);
      return null;
    }

    if (isAdmin) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profile?.plan) {
      setUserPlan(profile.plan);

      setForm((prev) => ({
        ...prev,
        plan: continueMode ? selectedPlanParam : profile.plan,
      }));

      return continueMode ? selectedPlanParam : profile.plan;
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subscription?.plan) {
      setUserPlan(subscription.plan);

      setForm((prev) => ({
        ...prev,
        plan: continueMode ? selectedPlanParam : subscription.plan,
      }));

      return continueMode ? selectedPlanParam : subscription.plan;
    }

    setUserPlan(null);
    return null;
  }

  async function loadBusiness(realPlan) {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      const finalPlan = isAdmin
        ? data.plan || planParam || "free"
        : realPlan || planParam || data.plan || "free";

      setForm({
        ...data,
        rubro: data.rubro || "",
        direccion: data.direccion || "",
        video: data.video || "",
        servicios: data.servicios || "",
        lat: data.lat || null,
        lng: data.lng || null,
        status: data.status || "draft",
        completion: data.completion || 0,
        plan: finalPlan,
      });

      const finalLimits = PLAN_LIMITS[finalPlan] || PLAN_LIMITS.free;

      let horariosFix = {};

      DIAS_ORDEN.forEach((dia) => {
        const value = data.horarios?.[dia];

        if (value && value !== "Cerrado") {
          const partes = value.split("/").map((p) => p.trim());

          const [open, close] =
            partes[0]?.split("-").map((p) => p.trim()) || ["", ""];

          const [open2, close2] =
            partes[1]?.split("-").map((p) => p.trim()) || ["", ""];

          horariosFix[dia] = {
            open: open || "",
            close: close || "",
            open2: open2 || "",
            close2: close2 || "",
          };
        } else {
          horariosFix[dia] = {
            open: "",
            close: "",
            open2: "",
            close2: "",
          };
        }
      });

      setHorarios(horariosFix);

      if (Array.isArray(data.images) && data.images.length > 0) {
        setPreviewImages(data.images.slice(0, finalLimits.maxImages));
      } else if (data.image) {
        setPreviewImages([data.image]);
      }
    }
  }

  function goToPlans() {
    navigate("/planes");
  }

  function handleProvinceChange(e) {
    const provincia = e.target.value;
    const localidades = PROVINCIAS_LOCALIDADES[provincia] || [];

    setForm((prev) => ({
      ...prev,
      provincia,
      ciudad: localidades.includes(prev.ciudad) ? prev.ciudad : "",
    }));
  }

  function handleCityChange(e) {
    setForm((prev) => ({
      ...prev,
      ciudad: e.target.value,
    }));
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "descripcion" && value.length > limits.maxDescription) {
      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  }

  const handleHorarioChange = (day, field, value) => {
    setHorarios((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  function applyMondayToWeekdays() {
    const monday = horarios.lunes;

    if (!monday?.open && !monday?.close && !monday?.open2 && !monday?.close2) {
      alert("Primero cargá el horario del lunes.");
      return;
    }

    setHorarios((prev) => {
      const updated = { ...prev };

      ["martes", "miercoles", "jueves", "viernes"].forEach((day) => {
        updated[day] = { ...monday };
      });

      return updated;
    });
  }

  const handleImages = (files) => {
    const arr = Array.from(files);

    if (arr.length > limits.maxImages) {
      alert(`Tu plan ${activePlan} permite hasta ${limits.maxImages} fotos.`);
      return;
    }

    setImages(arr);

    const previews = arr.map((file) => URL.createObjectURL(file));

    setPreviewImages(previews);

    if (previews.length > 0) {
      setForm((prev) => ({
        ...prev,
        image: previews[0],
      }));
    }
  };

  const handleVideo = (files) => {
    const file = files?.[0];

    if (!limits.video) {
      alert("El video está disponible solo en el plan Premium.");
      return;
    }

    if (!file) return;

    setVideoFile(file);
  };

  async function getLocation() {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta ubicación");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));

        alert("Ubicación guardada correctamente 📍");
      },
      (error) => {
        console.error(error);
        alert("No pudimos obtener tu ubicación");
      }
    );
  }

  const uploadFile = async (file, folder = "business-images") => {
    const cleanName = file.name.replace(/\s+/g, "-");
    const fileName = `${Date.now()}-${cleanName}`;

    const { error } = await supabase.storage
      .from(folder)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error(error);
      throw error;
    }

    const { data: publicData } = supabase.storage
      .from(folder)
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  };

  async function handleQuickSubmit() {
    try {
      setQuickLoading(true);

      if (!form.negocio || !form.rubro || !form.whatsapp) {
        alert("Completá nombre del negocio, rubro y WhatsApp.");
        return;
      }

      savePendingBusiness();
      localStorage.setItem("selectedPlan", activePlan || "free");

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      const payload = {
        negocio: form.negocio,
        rubro: form.rubro,
        whatsapp: form.whatsapp,
        ciudad: form.ciudad || "",
        provincia: form.provincia || "",
        direccion: "",
        descripcion: "",
        image: "",
        images: [],
        horarios: {},
        slug: slugify(`${form.negocio}-${Date.now()}`),
        plan: activePlan,
        user_id: userData.user.id,
        status: "draft",
        completion: 15,
      };

      const { data, error } = await supabase
        .from("businesses")
        .insert([payload])
        .select("id")
        .single();

      if (error) {
        console.error(error);
        alert(JSON.stringify(error));
        return;
      }

      localStorage.removeItem("pendingBusiness");

      alert("Tu lugar quedó reservado 🙌 Ahora completá la vidriera para publicarla.");

      window.location.href = `/editar/${data.id}`;
    } catch (error) {
      console.error(error);
      alert("Error al reservar el lugar");
    } finally {
      setQuickLoading(false);
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {

      localStorage.setItem(
      "pendingBusiness",
      JSON.stringify({
        ...form,
       horarios,
    })
  );

  localStorage.setItem(
    "selectedPlan",
    activePlan
  );

  navigate("/planes");

  return;
}

      if (form.descripcion.length > limits.maxDescription) {
        alert(
          `La descripción supera el límite de ${limits.maxDescription} caracteres.`
        );
        return;
      }

      const currentImagesCount =
        images.length > 0 ? images.length : form.images?.length || 0;

      if (currentImagesCount > limits.maxImages) {
        alert(`Tu plan ${activePlan} permite hasta ${limits.maxImages} fotos.`);
        return;
      }

      let imagesUrls = [];

      for (let file of images) {
        const url = await uploadFile(file, "business-images");
        imagesUrls.push(url);
      }

      let videoUrl = form.video || "";

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, "business-images");
      }

      let horariosFinal = {};

      DIAS_ORDEN.forEach((dia) => {
        const h = horarios[dia];
        const turnos = [];

        if (h?.open && h?.close) {
          turnos.push(`${h.open}-${h.close}`);
        }

        if (h?.open2 && h?.close2) {
          turnos.push(`${h.open2}-${h.close2}`);
        }

        horariosFinal[dia] = turnos.length > 0 ? turnos.join(" / ") : "Cerrado";
      });

      let principalImage = "";

      if (form.image?.startsWith("blob:")) {
        const selectedIndex = previewImages.indexOf(form.image);

        principalImage = imagesUrls[selectedIndex] || imagesUrls[0] || "";
      } else {
        principalImage = form.image || imagesUrls[0] || "";
      }

      const finalImages =
        imagesUrls.length > 0
          ? imagesUrls.slice(0, limits.maxImages)
          : (form.images || []).slice(0, limits.maxImages);

      const dataForCompletion = {
        ...form,
        image: principalImage,
        images: finalImages,
      };

      const completion = calculateCompletion(dataForCompletion, horarios);

      const payload = {
        ...form,

        slug: form.slug || slugify(`${form.negocio}-${form.ciudad || Date.now()}`),

        plan: activePlan,

        user_id: id ? form.user_id || userData.user.id : userData.user.id,

        image: principalImage,

        images: finalImages,

        video: limits.video ? videoUrl : "",

        facebook: limits.social ? form.facebook : "",
        instagram: limits.social ? form.instagram : "",
        tiktok: limits.social ? form.tiktok : "",
        email: limits.social ? form.email : "",

        web: limits.web ? form.web : "",

        servicios: limits.services ? form.servicios : "",

        horarios: horariosFinal,

        lat: form.lat,
        lng: form.lng,

        completion,

        status: completion >= 70 ? "published" : "draft",
      };

      let response;

      if (id) {
        response = await supabase
          .from("businesses")
          .update(payload)
          .eq("id", id);
      } else {
        response = await supabase.from("businesses").insert([payload]);
      }

      if (response.error) {
        console.error(response.error);
        alert(JSON.stringify(response.error));
        return;
      }

      localStorage.removeItem("pendingBusiness");
      localStorage.removeItem("selectedPlan");

      if (completion >= 70) {
        alert("Guardado correctamente 🚀 Tu vidriera ya está publicada.");
      } else {
        alert(`Guardado como borrador. Completá la vidriera para publicarla. Progreso: ${completion}%`);
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("ERROR GENERAL:", err);
      alert("Error general");
    } finally {
      setLoading(false);
    }
  };

  const remainingChars = limits.maxDescription - form.descripcion.length;
  const currentCompletion = calculateCompletion(
    {
      ...form,
      image: form.image || previewImages[0],
      images: form.images,
    },
    horarios
  );

  if (loadingPlan) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow">
          Cargando plan...
        </div>
      </div>
    );
  }

  const missingItems = [
    {
      label: "Foto principal",
      done: Boolean(form.image || previewImages[0]),
    },
    {
      label: "Descripción de al menos 40 caracteres",
      done: (form.descripcion || "").trim().length >= 40,
    },
    {
      label: "Ciudad, provincia y dirección",
      done: Boolean(form.ciudad && form.provincia && form.direccion),
    },
    {
      label: "Horarios",
      done: DIAS_ORDEN.some((dia) => {
        const h = horarios[dia];
        return (h?.open && h?.close) || (h?.open2 && h?.close2);
      }),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h1 className="text-2xl font-bold">
            {id ? "Editar negocio" : "Crear negocio"}
          </h1>

          <div className={`border p-4 rounded-xl text-sm ${
            currentCompletion >= 70
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          }`}>
            <div className="flex justify-between gap-3 mb-2">
              <b>
                {currentCompletion >= 70
                  ? "Vidriera lista para publicar"
                  : "Vidriera en borrador"}
              </b>
              <b>{currentCompletion}%</b>
            </div>

            <div className="w-full h-3 bg-white/80 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full ${currentCompletion >= 70 ? "bg-green-600" : "bg-yellow-500"}`}
                style={{ width: `${currentCompletion}%` }}
              />
            </div>

            {currentCompletion < 70 && (
              <div className="space-y-1">
                {missingItems.map((item) => (
                  <p key={item.label}>
                    {item.done ? "✅" : "⬜"} {item.label}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm">
            Plan actual: <b>{activePlan}</b> · Hasta{" "}
            <b>{limits.maxImages}</b> fotos · Descripción hasta{" "}
            <b>{limits.maxDescription}</b> caracteres
            {limits.video && <> · 1 video</>}
          </div>

          {isAdmin && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
              <label className="block text-sm font-bold text-yellow-800 mb-2">
                Seleccionar plan del negocio
              </label>

              <select
                name="plan"
                value={form.plan || "free"}
                onChange={handleChange}
                className="input"
              >
                <option value="free">Gratis</option>
                <option value="standard">Estándar</option>
                <option value="premium">Premium</option>
              </select>

              <p className="text-xs text-yellow-700 mt-2">
                Como administrador podés cargar negocios gratuitos, estándar o premium.
              </p>
            </div>
          )}

          <input
            name="negocio"
            placeholder="Negocio"
            onChange={handleChange}
            value={form.negocio}
            className="input"
          />

          <input
            name="rubro"
            placeholder="Rubro (Ej: Plomero, Restaurante, Electricista)"
            onChange={handleChange}
            value={form.rubro || ""}
            className="input"
          />

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Provincia
              </label>

              <select
                name="provincia"
                value={form.provincia || ""}
                onChange={handleProvinceChange}
                className="input"
              >
                <option value="">Seleccionar provincia</option>

                {Object.keys(PROVINCIAS_LOCALIDADES).map((provincia) => (
                  <option key={provincia} value={provincia}>
                    {provincia}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Localidad
              </label>

              <select
                name="ciudad"
                value={form.ciudad || ""}
                onChange={handleCityChange}
                className="input"
                disabled={!form.provincia}
              >
                <option value="">
                  {form.provincia ? "Seleccionar localidad" : "Primero elegí provincia"}
                </option>

                {(PROVINCIAS_LOCALIDADES[form.provincia] || []).map((localidad) => (
                  <option key={localidad} value={localidad}>
                    {localidad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <input
            name="direccion"
            placeholder="Dirección"
            onChange={handleChange}
            value={form.direccion}
            className="input"
          />

          <button
            type="button"
            onClick={getLocation}
            className="bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold"
          >
            📍 Usar mi ubicación actual
          </button>

          {form.lat && form.lng && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-sm">
              ✅ Ubicación guardada correctamente
            </div>
          )}

          <div>
            <textarea
              name="descripcion"
              placeholder="Descripción"
              onChange={handleChange}
              value={form.descripcion}
              maxLength={limits.maxDescription}
              className="input"
            />

            <p
              className={`text-xs mt-1 ${
                remainingChars < 30 ? "text-red-500" : "text-gray-500"
              }`}
            >
              Te quedan {remainingChars} caracteres disponibles
            </p>
          </div>

          <div>
            <input
              name="whatsapp"
              placeholder="WhatsApp"
              onChange={handleChange}
              value={form.whatsapp}
              className="input"
            />

            <p className="text-xs text-gray-500 mt-1">
              Ingresá solo el número. El sistema agrega automáticamente el código de Argentina.
            </p>
          </div>

          {limits.social ? (
            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
              <h3 className="font-bold">Redes sociales</h3>

              <input
                name="facebook"
                placeholder="Facebook"
                onChange={handleChange}
                value={form.facebook || ""}
                className="input"
              />

              <input
                name="instagram"
                placeholder="Instagram"
                onChange={handleChange}
                value={form.instagram || ""}
                className="input"
              />

              <input
                name="tiktok"
                placeholder="TikTok"
                onChange={handleChange}
                value={form.tiktok || ""}
                className="input"
              />

              <input
                name="email"
                placeholder="Email"
                onChange={handleChange}
                value={form.email || ""}
                className="input"
              />
            </div>
          ) : (
            <LockedPlanField
              title="Redes sociales y email"
              requiredPlan="Estándar"
              description="Agregá Facebook, Instagram, TikTok y email para que te contacten por más canales."
              onUpgrade={goToPlans}
            />
          )}

          {limits.web ? (
            <input
              name="web"
              placeholder="Sitio web"
              onChange={handleChange}
              value={form.web || ""}
              className="input"
            />
          ) : (
            <LockedPlanField
              title="Sitio web"
              requiredPlan="Premium"
              description="Mostrá tu web oficial dentro de la vidriera y sumá más confianza."
              onUpgrade={goToPlans}
            />
          )}

          {limits.services ? (
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
              <h3 className="font-bold text-purple-900 mb-2">
                Servicios destacados Premium
              </h3>

              <textarea
                name="servicios"
                placeholder={"Ejemplo:\nPanificación artesanal\nTortas personalizadas\nCatering para eventos"}
                onChange={handleChange}
                value={form.servicios || ""}
                className="input min-h-32"
              />

              <p className="text-xs text-purple-700 mt-1">
                Escribí un servicio por línea. Se mostrarán como destacados en tu vidriera.
              </p>
            </div>
          ) : (
            <LockedPlanField
              title="Servicios destacados"
              requiredPlan="Premium"
              description="Mostrá tus productos o servicios principales con una sección especial en la vidriera."
              onUpgrade={goToPlans}
            />
          )}

          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3 className="font-bold">Horarios</h3>

              <button
                type="button"
                onClick={applyMondayToWeekdays}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold"
              >
                Mismo horario lunes a viernes
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Podés cargar horario corrido o horario cortado. Ejemplo: 08:00-12:30 / 16:30-21:00.
            </p>

            {DIAS_ORDEN.map((day) => (
              <div key={day} className="mb-4 border-b pb-3">
                <p className="capitalize text-sm font-bold mb-2">
                  {day}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Abre mañana</p>
                    <input
                      type="time"
                      value={horarios[day]?.open || ""}
                      onChange={(e) =>
                        handleHorarioChange(day, "open", e.target.value)
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cierra mañana</p>
                    <input
                      type="time"
                      value={horarios[day]?.close || ""}
                      onChange={(e) =>
                        handleHorarioChange(day, "close", e.target.value)
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Abre tarde</p>
                    <input
                      type="time"
                      value={horarios[day]?.open2 || ""}
                      onChange={(e) =>
                        handleHorarioChange(day, "open2", e.target.value)
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cierra tarde</p>
                    <input
                      type="time"
                      value={horarios[day]?.close2 || ""}
                      onChange={(e) =>
                        handleHorarioChange(day, "close2", e.target.value)
                      }
                      className="input"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="font-semibold mb-2">
              Imágenes ({previewImages.length}/{limits.maxImages})
            </p>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImages(e.target.files)}
            />

            <p className="text-xs text-gray-500 mt-1">
              Tu plan permite hasta {limits.maxImages} fotos.
            </p>

            <div className="flex gap-3 mt-4 flex-wrap">
              {previewImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      image: img,
                    }))
                  }
                  className={`relative border-4 rounded-xl overflow-hidden cursor-pointer transition ${
                    form.image === img
                      ? "border-blue-600"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    className="w-28 h-28 object-contain bg-gray-100"
                  />

                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1">
                    {form.image === img ? "⭐ Principal" : "Elegir"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {limits.video ? (
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
              <p className="font-semibold mb-2">Video Premium (máximo 1)</p>

              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleVideo(e.target.files)}
              />

              {videoFile && (
                <p className="text-sm text-purple-700 mt-2">
                  ✅ Video seleccionado: {videoFile.name}
                </p>
              )}

              {form.video && !videoFile && (
                <p className="text-sm text-purple-700 mt-2">
                  ✅ Ya tenés un video guardado
                </p>
              )}
            </div>
          ) : (
            <LockedPlanField
              title="Video del negocio"
              requiredPlan="Premium"
              description="Sumá un video para mostrar productos, local, trabajos o presentación profesional."
              onUpgrade={goToPlans}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
          >
            {loading ? "Guardando..." : currentCompletion >= 70 ? "Guardar y publicar" : "Guardar borrador"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Vista previa</h2>

          <div className="border rounded-xl overflow-hidden">
            <img
              src={
                form.image ||
                previewImages[0] ||
                "https://placehold.co/600x400?text=Sin+imagen"
              }
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/600x400?text=Error+imagen";
              }}
              className="w-full h-56 object-contain bg-gray-100"
            />

            <div className="p-4">
              <h3 className="text-xl font-bold">
                {form.negocio || "Nombre del negocio"}
              </h3>

              <p className="text-gray-500 text-sm">
                📍 {form.ciudad || "Ciudad"}
              </p>

              <p className="text-sm mt-2 whitespace-pre-line">
                {form.descripcion}
              </p>

              {limits.services && form.servicios && (
                <div className="mt-4 bg-purple-50 border border-purple-100 p-3 rounded-xl">
                  <p className="font-black text-purple-900 mb-2">
                    Servicios destacados
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {form.servicios
                      .split("\n")
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .slice(0, 6)
                      .map((item) => (
                        <span
                          key={item}
                          className="bg-white border border-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold"
                        >
                          {item}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
