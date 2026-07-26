import { useEffect, useRef, useState } from "react";
import {
  canCaptureScreen,
  createCaptureFile,
  downloadCapture,
  formatCaptureTime,
  startScreenCapture,
} from "./screenCapture";

export default function CapturePanel({
  disabled = false,
  onAddCapture,
  defaultFileName = "captura-tuscomercios.webm",
}) {
  const captureControllerRef = useRef(null);
  const timerRef = useRef(null);
  const previewUrlRef = useRef("");

  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [captureBlob, setCaptureBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      clearTimer();

      if (captureControllerRef.current) {
        captureControllerRef.current.stop();
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  async function beginCapture() {
    if (disabled || recording) return;

    if (!canCaptureScreen()) {
      setError(
        "Este navegador no permite grabar la pantalla. Usá Chrome o Edge actualizado."
      );
      return;
    }

    clearPreviousCapture();
    setError("");
    setSeconds(0);

    try {
      const controller = await startScreenCapture({
        withAudio: false,
        frameRate: 30,
        onStop: handleCaptureStopped,
        onError: (captureError) => {
          setError(captureError.message);
        },
      });

      captureControllerRef.current = controller;
      setRecording(true);
      setPaused(false);
      startTimer();
    } catch (captureError) {
      setError(
        captureError?.message ||
          "No se pudo comenzar la grabación."
      );
    }
  }

  function stopCapture() {
    if (!captureControllerRef.current) return;

    captureControllerRef.current.stop();
  }

  function togglePause() {
    const controller = captureControllerRef.current;

    if (!controller) return;

    if (paused) {
      controller.resume();
      setPaused(false);
      startTimer();
    } else {
      controller.pause();
      setPaused(true);
      clearTimer();
    }
  }

  function handleCaptureStopped(blob) {
    clearTimer();

    captureControllerRef.current = null;
    setRecording(false);
    setPaused(false);
    setCaptureBlob(blob);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const url = URL.createObjectURL(blob);

    previewUrlRef.current = url;
    setPreviewUrl(url);
  }

  function addCaptureToReel() {
    if (!captureBlob) return;

    const file = createCaptureFile(
      captureBlob,
      defaultFileName
    );

    if (typeof onAddCapture === "function") {
      onAddCapture({
        file,
        blob: captureBlob,
        src: previewUrl,
        type: "video",
        fileName: file.name,
      });
    }
  }

  function clearPreviousCapture() {
    setCaptureBlob(null);
    setPreviewUrl("");

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
  }

  function startTimer() {
    clearTimer();

    timerRef.current = setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);
  }

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/60 to-blue-50/70 p-4 sm:p-5 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500">
            Studio Capture
          </p>

          <h3 className="mt-1 text-xl font-black text-slate-950">
            Grabar pantalla real
          </h3>

          <p className="mt-2 text-sm font-semibold text-slate-600">
            Tocá “Comenzar grabación”, elegí la pestaña de
            TusComercios y navegá normalmente. Al finalizar,
            la grabación se agrega al Reel.
          </p>
        </div>

        {recording && (
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-red-700">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
            <span className="text-xs font-black">
              {formatCaptureTime(seconds)}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {!recording && !captureBlob && (
        <button
          type="button"
          onClick={beginCapture}
          disabled={disabled}
          className="mt-5 min-h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 py-3 font-black text-white shadow-xl transition hover:from-violet-700 hover:via-indigo-700 hover:to-blue-700 disabled:opacity-50"
        >
          🎥 Comenzar grabación de pantalla
        </button>
      )}

      {recording && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={togglePause}
            className="min-h-13 rounded-2xl bg-white px-4 font-black text-indigo-700 shadow-md"
          >
            {paused ? "Continuar" : "Pausar"}
          </button>

          <button
            type="button"
            onClick={stopCapture}
            className="min-h-13 rounded-2xl bg-red-600 px-4 font-black text-white shadow-lg"
          >
            Finalizar
          </button>
        </div>
      )}

      {captureBlob && previewUrl && (
        <div className="mt-5">
          <video
            src={previewUrl}
            controls
            playsInline
            className="max-h-96 w-full rounded-2xl bg-black object-contain shadow-lg"
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={clearPreviousCapture}
              className="min-h-13 rounded-2xl bg-slate-100 px-3 font-black text-slate-800"
            >
              Repetir
            </button>

            <button
              type="button"
              onClick={addCaptureToReel}
              className="min-h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-3 font-black text-white shadow-lg"
            >
              Usar esta grabación
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              downloadCapture(
                captureBlob,
                defaultFileName
              )
            }
            className="mt-3 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 font-black text-slate-700"
          >
            Descargar grabación original
          </button>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-indigo-100 bg-white/80 p-4">
        <p className="font-black text-slate-900">
          Recomendación
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-600">
          1. Abrí TusComercios en otra pestaña.
          2. Tocá “Comenzar grabación”.
          3. Elegí esa pestaña.
          4. Navegá lentamente.
          5. Tocá “Finalizar” y después “Usar esta grabación”.
        </p>
      </div>
    </section>
  );
}
