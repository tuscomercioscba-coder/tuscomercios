import { useState } from "react";
import { requestMentorResponse } from "../Services/MentorApi";

export default function StudioMentorPanel({
  business,
  entityType = "business",
  entityId,
  studioContext,
  editorLabel = "Studio",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function analyze() {
    try {
      setOpen(true);
      setLoading(true);
      setError("");
      setResult("");

      const response = await requestMentorResponse({
        message:
          `Actuá como Director Creativo de TusComercios Studio. Analizá el proyecto abierto en ${editorLabel} usando únicamente el contexto técnico enviado. Indicá primero los 3 cambios más importantes, después una puntuación del 1 al 10 para impacto, legibilidad, marca y conversión. Cerrá con pasos concretos usando solo herramientas reales del editor.`,
        business,
        marketingProfile: {},
        history: [],
        entityType,
        entityId,
        studioContext,
        responseMode: "creative-review",
      });

      setResult(response.content || "");
    } catch (analysisError) {
      setError(
        analysisError?.message ||
          "Mentor IA no pudo analizar el proyecto en este momento."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || !entityId}
        onClick={analyze}
        className="min-h-12 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 font-black text-white shadow-lg disabled:opacity-40"
      >
        🧠 Analizar con Mentor IA
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <section className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
                  Director Creativo IA
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Análisis de {editorLabel}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 w-11 rounded-full bg-slate-100 text-xl font-black text-slate-700"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {loading && (
              <div className="mt-6 rounded-2xl bg-violet-50 p-5 text-center font-black text-violet-700">
                Analizando textos, capas, tamaños, tiempos y Brand Kit...
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 font-bold text-red-700">
                {error}
              </div>
            )}

            {result && (
              <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-5 font-semibold leading-7 text-slate-800">
                {result}
              </div>
            )}

            {!loading && (
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={analyze}
                  className="min-h-11 rounded-xl bg-slate-950 px-5 font-black text-white"
                >
                  Analizar nuevamente
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
