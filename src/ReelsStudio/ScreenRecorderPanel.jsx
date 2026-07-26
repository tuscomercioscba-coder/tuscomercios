import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createScreenCaptureSession,
} from "./screenCapture";

export default function ScreenRecorderPanel({
  disabled,
  onUseRecording,
}) {
  const sessionRef = useRef(null);
  const previewRef = useRef(null);
  const timerRef = useRef(null);

  const [status, setStatus] =
    useState("idle");

  const [withMicrophone, setWithMicrophone] =
    useState(false);

  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] =
    useState("");

  const [recordingBlob, setRecordingBlob] =
    useState(null);

  const [previewReady, setPreviewReady] =
    useState(false);

  const [usingRecording, setUsingRecording] =
    useState(false);

  const [message, setMessage] = useState("");
  const stoppingTimeoutRef = useRef(null);

  function clearTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      clearTimer();

      if (stoppingTimeoutRef.current) {
        window.clearTimeout(
          stoppingTimeoutRef.current
        );
      }

      sessionRef.current?.cleanup?.();

      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function startRecording() {
    if (disabled || status !== "idle") {
      return;
    }

    try {
      setMessage("");
      clearPreview();

      const session =
        await createScreenCaptureSession({
          withMicrophone,
        });

      sessionRef.current = session;

      session.start();

      setStatus("recording");
      setElapsed(0);

      const startedAt = performance.now();

      timerRef.current = window.setInterval(
        () => {
          setElapsed(
            (performance.now() - startedAt) /
              1000
          );
        },
        100
      );

      session.stopped
        .then(({ blob, duration }) => {
          clearTimer();

          if (stoppingTimeoutRef.current) {
            window.clearTimeout(
              stoppingTimeoutRef.current
            );

            stoppingTimeoutRef.current = null;
          }

          const url =
            URL.createObjectURL(blob);

          if (!blob?.size) {
            throw new Error(
              "La grabación quedó vacía."
            );
          }

          setRecordingBlob(blob);
          setPreviewUrl(url);
          setPreviewReady(false);
          setElapsed(duration);
          setMessage("");
          setStatus("ready");

          session.cleanup();
          sessionRef.current = null;
        })
        .catch((error) => {
          clearTimer();

          if (stoppingTimeoutRef.current) {
            window.clearTimeout(
              stoppingTimeoutRef.current
            );

            stoppingTimeoutRef.current = null;
          }

          setMessage(
            error?.message ||
              "No se pudo completar la grabación."
          );

          setStatus("idle");

          session.cleanup();
          sessionRef.current = null;
        });
    } catch (error) {
      console.error(error);

      setMessage(
        error?.message ||
          "No se pudo iniciar la grabación."
      );

      setStatus("idle");
    }
  }

  function pauseRecording() {
    sessionRef.current?.pause?.();
    setStatus("paused");
  }

  function resumeRecording() {
    sessionRef.current?.resume?.();
    setStatus("recording");
  }

  function stopRecording() {
    if (
      status !== "recording" &&
      status !== "paused"
    ) {
      return;
    }

    clearTimer();
    setStatus("stopping");
    setMessage("Finalizando grabación...");

    sessionRef.current?.stop?.();

    stoppingTimeoutRef.current =
      window.setTimeout(() => {
        setMessage(
          "La grabación tardó más de lo esperado. Estamos intentando recuperarla."
        );

        sessionRef.current?.cleanup?.();
      }, 3500);
  }

  function clearPreview() {
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");
    setRecordingBlob(null);
    setPreviewReady(false);
    setElapsed(0);
  }

  function discardRecording() {
    clearPreview();
    setStatus("idle");
    setMessage("");
  }

  async function useRecording() {
    if (
      !recordingBlob ||
      !previewUrl ||
      !previewReady ||
      usingRecording
    ) {
      return;
    }

    try {
      setUsingRecording(true);
      setMessage("Cargando la grabación en el editor...");

      /*
       * Pausamos la vista previa antes de entregar el mismo Blob
       * al reproductor principal. Esto evita que Chrome intente
       * decodificar dos veces el mismo archivo pesado y congele la pestaña.
       */
      previewRef.current?.pause?.();

      const handoffUrl =
        URL.createObjectURL(recordingBlob);

      await onUseRecording({
        blob: recordingBlob,
        url: handoffUrl,
        fileName: `grabacion-${Date.now()}.webm`,
        duration: elapsed,
      });

      clearPreview();
      setStatus("idle");
      setMessage("");
    } catch (error) {
      console.error(error);

      setMessage(
        error?.message ||
          "No se pudo cargar la grabación en el editor."
      );
    } finally {
      setUsingRecording(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-red-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
        Grabación integrada
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Grabar pantalla
      </h3>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        Elegí la pestaña, ventana o pantalla. Al finalizar, la grabación entra directamente al timeline.
      </p>

      <label className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-3">
        <span>
          <strong className="block text-sm font-black text-slate-800">
            Incluir micrófono
          </strong>

          <span className="text-xs font-semibold text-slate-500">
            Para grabar tu explicación mientras navegás.
          </span>
        </span>

        <input
          type="checkbox"
          checked={withMicrophone}
          disabled={
            disabled ||
            status !== "idle"
          }
          onChange={(event) =>
            setWithMicrophone(
              event.target.checked
            )
          }
        />
      </label>

      {message && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">
          {message}
        </p>
      )}

      {status === "idle" && (
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled}
          className="mt-4 min-h-14 w-full rounded-2xl bg-red-600 px-4 font-black text-white shadow-lg disabled:opacity-40"
        >
          ● Comenzar grabación
        </button>
      )}

      {(status === "recording" ||
        status === "paused" ||
        status === "stopping") && (
        <div className="mt-4">
          <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-4 text-white">
            <span className="flex items-center gap-2 font-black">
              <span
                className={`h-3 w-3 rounded-full ${
                  status === "recording"
                    ? "animate-pulse bg-red-500"
                    : "bg-amber-400"
                }`}
              />

              {status === "recording"
                ? "Grabando"
                : status === "paused"
                ? "Pausada"
                : "Finalizando"}
            </span>

            <span className="font-black">
              {formatDuration(elapsed)}
            </span>
          </div>

          {status !== "stopping" && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {status === "recording" ? (
              <button
                type="button"
                onClick={pauseRecording}
                className="min-h-12 rounded-xl bg-amber-100 font-black text-amber-800"
              >
                Pausar
              </button>
            ) : (
              <button
                type="button"
                onClick={resumeRecording}
                className="min-h-12 rounded-xl bg-emerald-100 font-black text-emerald-800"
              >
                Continuar
              </button>
            )}

            <button
              type="button"
              onClick={stopRecording}
              className="min-h-12 rounded-xl bg-slate-950 font-black text-white"
            >
              Finalizar
            </button>
          </div>
          )}
        </div>
      )}

      {status === "ready" &&
        previewUrl && (
          <div className="mt-4">
            <video
              ref={previewRef}
              src={previewUrl}
              controls
              playsInline
              onLoadedMetadata={() => {
                setPreviewReady(true);
                setMessage("");
              }}
              onCanPlay={() => {
                setPreviewReady(true);
                setMessage("");
              }}
              onError={() => {
                setPreviewReady(false);
                setMessage(
                  "Firefox no pudo reproducir esta grabación. Probá grabar con Chrome o Edge."
                );
              }}
              className="aspect-video w-full rounded-2xl bg-black object-contain"
            />

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={discardRecording}
                className="min-h-12 rounded-xl bg-red-50 font-black text-red-600"
              >
                Descartar
              </button>

              <button
                type="button"
                disabled={!previewReady || usingRecording}
                onClick={useRecording}
                className="min-h-12 rounded-xl bg-emerald-500 font-black text-slate-950 disabled:opacity-40"
              >
                {usingRecording
                  ? "Cargando..."
                  : "Usar en el editor"}
              </button>
            </div>
          </div>
        )}

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-black text-blue-900">
          Cómo funciona
        </p>

        <ol className="mt-2 space-y-1 text-xs font-semibold text-blue-800">
          <li>1. Abrí TusComercios en otra pestaña.</li>
          <li>2. Tocá “Comenzar grabación”.</li>
          <li>3. Elegí esa pestaña.</li>
          <li>4. Navegá normalmente.</li>
          <li>5. Finalizá y usá la grabación en el editor.</li>
        </ol>
      </div>
    </section>
  );
}

function formatDuration(seconds = 0) {
  const safe = Math.max(
    0,
    Number(seconds) || 0
  );

  const minutes =
    Math.floor(safe / 60);

  const secs =
    Math.floor(safe % 60);

  const tenths =
    Math.floor((safe % 1) * 10);

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(
    2,
    "0"
  )}.${tenths}`;
}
