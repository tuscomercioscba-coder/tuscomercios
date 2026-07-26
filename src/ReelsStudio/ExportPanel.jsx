import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import { uploadStudioFile } from "../Studio/StudioLibraryService";
import {
  claimStudioUsage,
  releaseStudioUsage,
} from "../Studio/studioUsage";
import { exportReelProject } from "./professionalExporter";

export default function ExportPanel({
  project,
  business,
  mediaItems,
  layers,
  audioTrack,
  voiceTrack,
  disabled,
}) {
  const controllerRef = useRef(null);
  const urlRef = useRef("");

  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState("");

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();

      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  async function startExport() {
    if (disabled || exporting) return;

    let usageClaim = null;

    try {
      setExporting(true);
      setProgress(0);
      setMessage("");
      setStage("Preparando proyecto...");

      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }

      setDownloadUrl("");

      const controller = new AbortController();
      controllerRef.current = controller;

      const result = await exportReelProject({
        mediaItems,
        clips: project.clips,
        layers,
        audioTrack,
        voiceTrack,
        fps: 30,
        onProgress: setProgress,
        onStage: setStage,
        signal: controller.signal,
      });

      const url = URL.createObjectURL(result.blob);

      urlRef.current = url;
      setDownloadUrl(url);
      setStage("Guardando en Biblioteca...");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("La sesión venció. Volvé a iniciar sesión.");
      }

      const pathParts = window.location.pathname
        .split("/")
        .filter(Boolean);

      const entityType = pathParts.includes("workspace")
        ? "workspace"
        : "business";

      const entityId =
        business?.id ||
        pathParts[pathParts.length - 1];

      if (entityType === "business") {
        usageClaim = await claimStudioUsage({
          businessId: entityId,
          contentType: "reel",
        });
      }

      const businessName =
        business?.negocio ||
        business?.name ||
        "TusComercios";

      const safeName = String(businessName)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");

      const fileName = `${safeName || "tuscomercios"
        }-reel-${Date.now()}.mp4`;

      await uploadStudioFile({
        userId: user.id,
        businessId: entityId,
        entityType,
        contentType: "reel",
        title: `Reel de ${businessName} - ${new Date().toLocaleDateString(
          "es-AR"
        )}`,
        blob: result.blob,
        fileName,
      });

      setProgress(100);
      setStage("Reel guardado en Biblioteca");

      setMessage(
        `Video MP4 listo y guardado en la Biblioteca. Duración: ${result.duration.toFixed(
          1
        )} segundos.`
      );
    } catch (error) {
      console.error(error);

      if (usageClaim?.usage_id) {
        await releaseStudioUsage(usageClaim.usage_id);
      }

      setMessage(
        error?.name === "AbortError"
          ? "Exportación cancelada."
          : error?.message ||
          "No se pudo exportar o guardar el reel."
      );
    } finally {
      controllerRef.current = null;
      setExporting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
        Exportador
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Crear video final
      </h3>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        Vertical Full HD con textos, stickers, música y narración.
      </p>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-500">
        1080 × 1920 · 30 FPS · MP4 compatible
      </div>

      {exporting ? (
        <div className="mt-4">
          <div className="h-4 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="mt-2 text-center text-sm font-black text-emerald-700">
            {Math.round(progress)}%
          </p>

          <p className="mt-1 text-center text-xs font-bold text-slate-500">
            {stage}
          </p>

          <button
            type="button"
            onClick={() =>
              controllerRef.current?.abort()
            }
            className="mt-3 min-h-12 w-full rounded-xl bg-red-50 font-black text-red-600"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={
            disabled ||
            !project?.clips?.length ||
            !mediaItems?.length
          }
          onClick={startExport}
          className="mt-4 min-h-14 w-full rounded-2xl bg-emerald-500 font-black text-slate-950 disabled:opacity-40"
        >
          Exportar Reel
        </button>
      )}

      {message && (
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
          {message}
        </p>
      )}

      {downloadUrl && (
        <div className="mt-4">
          <video
            src={downloadUrl}
            controls
            playsInline
            className="aspect-[9/16] max-h-[420px] w-full rounded-2xl bg-black object-contain"
          />

          <a
            href={downloadUrl}
            download="reel-tuscomercios.mp4"
            className="mt-3 flex min-h-14 items-center justify-center rounded-2xl bg-slate-950 font-black text-white"
          >
            Descargar MP4
          </a>
        </div>
      )}

      <p className="mt-4 text-xs font-semibold text-slate-500">
        No cierres ni minimices la pestaña durante la exportación.
      </p>
    </section>
  );
}
