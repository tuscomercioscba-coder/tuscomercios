export function canCaptureScreen() {
  return Boolean(
    typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === "function" &&
      typeof MediaRecorder !== "undefined"
  );
}

export function getCaptureMimeType() {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];

  return (
    candidates.find((type) =>
      MediaRecorder.isTypeSupported(type)
    ) || ""
  );
}

export async function startScreenCapture({
  withAudio = false,
  frameRate = 30,
  videoBitsPerSecond = 12000000,
  onStop,
  onError,
} = {}) {
  if (!canCaptureScreen()) {
    throw new Error(
      "Este navegador no permite grabar la pantalla."
    );
  }

  let stream = null;

  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: {
          ideal: frameRate,
          max: 60,
        },
        width: {
          ideal: 1080,
        },
        height: {
          ideal: 1920,
        },
      },
      audio: withAudio,
      selfBrowserSurface: "include",
      surfaceSwitching: "include",
      systemAudio: withAudio ? "include" : "exclude",
    });

    const mimeType = getCaptureMimeType();

    const options = {
      videoBitsPerSecond,
    };

    if (mimeType) {
      options.mimeType = mimeType;
    }

    const recorder = new MediaRecorder(stream, options);
    const chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onerror = (event) => {
      if (typeof onError === "function") {
        onError(
          event?.error ||
            new Error("Ocurrió un error durante la grabación.")
        );
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, {
        type:
          recorder.mimeType ||
          mimeType ||
          "video/webm",
      });

      stopMediaStream(stream);

      if (typeof onStop === "function") {
        onStop(blob);
      }
    };

    const videoTrack = stream.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.addEventListener(
        "ended",
        () => {
          if (recorder.state !== "inactive") {
            recorder.stop();
          }
        },
        { once: true }
      );
    }

    recorder.start(500);

    return {
      recorder,
      stream,
      stop() {
        if (
          recorder.state === "recording" ||
          recorder.state === "paused"
        ) {
          recorder.stop();
        }
      },
      pause() {
        if (recorder.state === "recording") {
          recorder.pause();
        }
      },
      resume() {
        if (recorder.state === "paused") {
          recorder.resume();
        }
      },
    };
  } catch (error) {
    if (stream) {
      stopMediaStream(stream);
    }

    throw normalizeCaptureError(error);
  }
}

export function stopMediaStream(stream) {
  if (!stream) return;

  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

export function createCaptureFile(
  blob,
  fileName = "captura-tuscomercios.webm"
) {
  if (!blob) {
    throw new Error("No existe una grabación.");
  }

  return new File([blob], fileName, {
    type: blob.type || "video/webm",
    lastModified: Date.now(),
  });
}

export function downloadCapture(
  blob,
  fileName = "captura-tuscomercios.webm"
) {
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 3000);
}

export function formatCaptureTime(seconds = 0) {
  const safeSeconds = Math.max(
    0,
    Math.floor(Number(seconds) || 0)
  );

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function normalizeCaptureError(error) {
  if (error?.name === "NotAllowedError") {
    return new Error(
      "La grabación fue cancelada o no se concedió permiso."
    );
  }

  if (error?.name === "NotFoundError") {
    return new Error(
      "No se encontró una pantalla, ventana o pestaña para grabar."
    );
  }

  if (error?.name === "NotReadableError") {
    return new Error(
      "El navegador no pudo acceder a la pantalla seleccionada."
    );
  }

  return new Error(
    error?.message ||
      "No se pudo iniciar la grabación de pantalla."
  );
}
