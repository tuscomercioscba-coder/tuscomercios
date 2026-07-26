import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Layout from "../components/Layout";
import { supabase } from "../supabase";
import { loadStudioEntity } from "../Studio/studioEntity";
import {
  createBrandManager,
  createDefaultBrandKit,
  sanitizeBrandKit,
} from "../Studio/Brand/BrandEngine";
import { ReelsStudioApp } from "../ReelsStudio";

export default function ReelGenerator() {
  const { id, entityType = "business" } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [brandKit, setBrandKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPage();
  }, [id, entityType]);

  async function loadPage() {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const resolvedType =
        window.location.pathname.includes("/workspace/")
          ? "workspace"
          : entityType;

      const result = await loadStudioEntity({
        id,
        entityType: resolvedType,
        user,
      });

      setBusiness(result.entity);

      let loadedBrandKit;

      if (result.isWorkspace) {
        loadedBrandKit = createDefaultBrandKit(
          result.raw?.settings?.brandKit || {}
        );
      } else {
        const brandManager = createBrandManager({ supabase });
        loadedBrandKit = await brandManager.loadBrandKit(
          result.entity.id
        );
      }

      const mergedBrandKit = sanitizeBrandKit({
        ...loadedBrandKit,
        identity: {
          ...loadedBrandKit.identity,
          businessName:
            loadedBrandKit.identity?.businessName ||
            result.entity.negocio ||
            result.entity.name ||
            "",
          shortDescription:
            loadedBrandKit.identity?.shortDescription ||
            result.entity.descripcion ||
            result.entity.description ||
            "",
        },
        logos: {
          ...loadedBrandKit.logos,
          primary:
            loadedBrandKit.logos?.primary ||
            result.entity.logo ||
            result.entity.image ||
            "",
        },
        metadata: {
          ...(loadedBrandKit.metadata || {}),
          businessId: result.entity.id,
          entityType: result.entityType,
        },
      });

      setBrandKit(mergedBrandKit);
    } catch (error) {
      console.error(error);

      if (error?.code === "PLAN_REQUIRED") {
        navigate("/planes");
        return;
      }

      setMessage(
        error?.message ||
          "No se pudo abrir Reels Studio."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-5 text-xl font-black text-slate-900">
              Abriendo Reels Studio 2.0...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!business) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
          <div className="max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl">
            <h1 className="text-2xl font-black text-slate-950">
              No se pudo abrir el editor
            </h1>
            <p className="mt-3 font-semibold text-slate-500">
              {message}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ReelsStudioApp
        business={business}
        brandKit={brandKit}
        entityType={
          window.location.pathname.includes("/workspace/")
            ? "workspace"
            : entityType
        }
        entityId={id}
      />
    </Layout>
  );
}
