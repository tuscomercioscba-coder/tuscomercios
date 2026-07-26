import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { supabase } from "../supabase";

import BrandEditor from "../Studio/Brand/components/BrandEditor";
import BrandPreview from "../Studio/Brand/components/BrandPreview";

import {
  createBrandManager,
  createDefaultBrandKit,
  exportBrandKitFile,
  importBrandKitFile,
  sanitizeBrandKit,
  validateBrandKit,
} from "../Studio/Brand/BrandEngine";

import { loadStudioEntity } from "../Studio/studioEntity";

export default function BrandKit() {
  const { id, entityType = "business" } = useParams();
  const navigate = useNavigate();

  const brandManager = useMemo(
    () => createBrandManager({ supabase }),
    []
  );

  const [business, setBusiness] = useState(null);
  const [workspaceRaw, setWorkspaceRaw] = useState(null);
  const [isWorkspace, setIsWorkspace] = useState(false);
  const [userId, setUserId] = useState("");

  const [brandKit, setBrandKit] = useState(
    createDefaultBrandKit()
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPage();
  }, [id, entityType]);

  async function loadPage() {
    try {
      setLoading(true);
      setMessage("");

      const response = await supabase.auth.getUser();

      const user = response.data.user;

      if (!user) {
        navigate("/login");
        return;
      }

      setUserId(user.id);

      const result = await loadStudioEntity({
        id,
        entityType,
        user,
      });

      setBusiness(result.entity);
      setWorkspaceRaw(
        result.isWorkspace ? result.raw : null
      );
      setIsWorkspace(result.isWorkspace);

      let loaded;

      if (result.isWorkspace) {
        loaded = createDefaultBrandKit(
          result.raw?.settings?.brandKit || {}
        );
      } else {
        loaded = await brandManager.loadBrandKit(
          result.entity.id
        );
      }

      const merged = sanitizeBrandKit({
        ...loaded,

        identity: {
          ...loaded.identity,
          businessName:
            loaded.identity.businessName ||
            result.entity.negocio ||
            "",
          shortDescription:
            loaded.identity.shortDescription ||
            result.entity.descripcion ||
            "",
        },

        logos: {
          ...loaded.logos,
          primary:
            loaded.logos.primary ||
            result.entity.logo ||
            result.entity.image ||
            "",
        },

        contact: {
          ...loaded.contact,
          whatsapp:
            loaded.contact.whatsapp ||
            result.entity.whatsapp ||
            result.entity.telefono ||
            "",
        },

        metadata: {
          ...(loaded.metadata || {}),
          businessId: result.entity.id,
          entityType: result.entityType,
        },
      });

      setBrandKit(merged);
    } catch (error) {
      console.error(error);

      if (error?.code === "PLAN_REQUIRED") {
        navigate("/planes");
        return;
      }

      setMessage(
        error?.message ||
          "No se pudo cargar el Brand Kit."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveBrandKit() {
    if (!business || !userId || saving) return;

    const sanitized = sanitizeBrandKit(brandKit);
    const validation = validateBrandKit(sanitized);

    if (!validation.valid) {
      setMessage(
        validation.errors[0]?.message ||
          "Revisá los datos."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      if (isWorkspace) {
        const nextSettings = {
          ...(workspaceRaw?.settings || {}),
          brandKit: sanitized,
        };

        const { data, error } = await supabase
          .from("studio_workspaces")
          .update({
            settings: nextSettings,
          })
          .eq("id", business.id)
          .eq("owner_id", userId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setWorkspaceRaw(data);
        setBrandKit(sanitized);
      } else {
        const saved = await brandManager.saveBrandKit({
          businessId: business.id,
          userId,
          brandKit: sanitized,
        });

        setBrandKit(saved);
      }

      setMessage(
        "Brand Kit guardado correctamente."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error?.message ||
          "No se pudo guardar el Brand Kit."
      );
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo(type, file) {
    if (!business || uploadingLogo) return;

    try {
      setUploadingLogo(true);
      setMessage("");

      const result =
        await brandManager.uploadBrandAsset({
          businessId: business.id,
          file,
          assetType: type,
        });

      setBrandKit((current) => ({
        ...current,
        logos: {
          ...current.logos,
          [type]: result.publicUrl,
          [`${type}Path`]: result.path,
        },
      }));
    } catch (error) {
      console.error(error);

      setMessage(
        error?.message ||
          "No se pudo subir el logo."
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  function exportKit() {
    const safeName = String(
      business?.negocio || "brand-kit"
    )
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    exportBrandKitFile(
      brandKit,
      `${safeName || "brand-kit"}-brand-kit.json`
    );
  }

  async function importKit(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const imported =
        await importBrandKitFile(file);

      setBrandKit(imported);

      setMessage(
        "Brand Kit importado. Tocá Guardar para conservar los cambios."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "No se pudo importar el Brand Kit."
      );
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-5 text-xl font-black text-slate-900">
              Cargando Brand Kit...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!business) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-100 p-6">
          <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl">
            <h1 className="text-2xl font-black text-slate-950">
              No se encontró el espacio de trabajo
            </h1>

            <button
              onClick={() => navigate("/studio")}
              className="mt-5 rounded-2xl bg-blue-600 px-6 py-3 font-black text-white"
            >
              Volver a Studio
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_top,#eff6ff_0,#f8fafc_42%,#f1f5f9_100%)] pb-28 lg:pb-8">
        <div className="mx-auto max-w-[1500px] p-3 sm:p-4 md:p-6">
          <header className="relative mb-5 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#020617_0%,#172554_48%,#4c1d95_100%)] p-5 text-white shadow-2xl sm:p-6 md:p-8">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <button
                  onClick={() => navigate("/studio")}
                  className="mb-5 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-black"
                >
                  ← Volver a Studio
                </button>

                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">
                  {isWorkspace
                    ? "Identidad institucional"
                    : "Identidad visual centralizada"}
                </p>

                <h1 className="mt-2 text-3xl font-black md:text-5xl">
                  Brand Kit
                </h1>

                <p className="mt-3 max-w-3xl font-semibold text-blue-100">
                  Configurá una vez la identidad de{" "}
                  <strong>{business.negocio}</strong> y
                  aplicala automáticamente en todo Studio.
                </p>
              </div>

              <button
                onClick={saveBrandKit}
                disabled={saving || uploadingLogo}
                className="min-h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-7 py-4 text-lg font-black text-white shadow-xl disabled:opacity-50"
              >
                {saving
                  ? "Guardando..."
                  : "Guardar Brand Kit"}
              </button>
            </div>
          </header>

          {message && (
            <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 font-bold text-blue-800">
              {message}
            </div>
          )}

          <div className="grid items-start gap-6 lg:grid-cols-[520px_minmax(0,1fr)]">
            <BrandEditor
              brandKit={brandKit}
              disabled={saving || uploadingLogo}
              onChange={setBrandKit}
              onUploadLogo={uploadLogo}
            />

            <div className="lg:sticky lg:top-4">
              <BrandPreview
                brandKit={brandKit}
                business={business}
              />

              <section className="mt-5 rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow-xl">
                <h3 className="text-xl font-black text-slate-950">
                  Importar o exportar
                </h3>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Guardá una copia o importá una
                  configuración anterior.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={exportKit}
                    className="min-h-13 rounded-2xl bg-slate-950 px-3 font-black text-white"
                  >
                    Exportar
                  </button>

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={importKit}
                      className="hidden"
                    />

                    <span className="flex min-h-13 items-center justify-center rounded-2xl bg-blue-50 px-3 text-center font-black text-blue-700">
                      Importar
                    </span>
                  </label>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-12px_35px_rgba(15,23,42,.14)] backdrop-blur-xl lg:hidden">
          <button
            onClick={saveBrandKit}
            disabled={saving || uploadingLogo}
            className="mx-auto block min-h-14 w-full max-w-xl rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 font-black text-white shadow-xl disabled:opacity-50"
          >
            {saving
              ? "Guardando..."
              : "Guardar Brand Kit"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
