export function getSupportedVideoMimeType() {
  if (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
  ) {
    return "video/webm;codecs=vp9";
  }

  if (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
  ) {
    return "video/webm;codecs=vp8";
  }

  if (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported("video/webm")
  ) {
    return "video/webm";
  }

  return "";
}

export function canRecordCanvas() {
  if (typeof window === "undefined") return false;
  if (typeof MediaRecorder === "undefined") return false;
  if (typeof HTMLCanvasElement === "undefined") return false;

  return typeof HTMLCanvasElement.prototype.captureStream === "function";
}

export function createCanvasRecorder(
  canvas,
  {
    fps = 30,
    videoBitsPerSecond = 14000000,
    audioStream = null,
    manualFrames = false,
  } = {}
) {
  if (!canvas) {
    throw new Error("No se encontró el canvas del reel.");
  }

  if (!canRecordCanvas()) {
    throw new Error(
      "Este navegador no permite exportar videos desde el editor."
    );
  }

  const captureRate = manualFrames ? 0 : fps;
  const canvasStream = canvas.captureStream(captureRate);
  const videoTrack = canvasStream.getVideoTracks()[0] || null;
  const combinedStream = new MediaStream();

  canvasStream.getVideoTracks().forEach((track) => {
    combinedStream.addTrack(track);
  });

  if (audioStream) {
    audioStream.getAudioTracks().forEach((track) => {
      combinedStream.addTrack(track);
    });
  }

  const mimeType = getSupportedVideoMimeType();
  const options = {
    videoBitsPerSecond,
  };

  if (mimeType) {
    options.mimeType = mimeType;
  }

  const recorder = new MediaRecorder(combinedStream, options);
  const chunks = [];

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  const waitForStop = () =>
    new Promise((resolve, reject) => {
      recorder.onerror = (event) => {
        reject(event?.error || new Error("Error al grabar el reel."));
      };

      recorder.onstop = () => {
        combinedStream.getTracks().forEach((track) => {
          track.stop();
        });

        const blob = new Blob(chunks, {
          type: recorder.mimeType || mimeType || "video/webm",
        });

        resolve(blob);
      };
    });

  const requestFrame = () => {
    if (
      manualFrames &&
      videoTrack &&
      typeof videoTrack.requestFrame === "function"
    ) {
      videoTrack.requestFrame();
    }
  };

  return {
    recorder,
    waitForStop,
    requestFrame,
    mimeType: recorder.mimeType || mimeType || "video/webm",
    stream: combinedStream,
    supportsManualFrames:
      manualFrames &&
      Boolean(videoTrack) &&
      typeof videoTrack.requestFrame === "function",
  };
}

export function startRecorder(recorder, timeslice = 1000) {
  if (!recorder) {
    throw new Error("El grabador no está preparado.");
  }

  if (recorder.state !== "inactive") return;

  recorder.start(timeslice);
}

export function stopRecorder(recorder) {
  if (!recorder) return;

  if (
    recorder.state === "recording" ||
    recorder.state === "paused"
  ) {
    try {
      recorder.requestData();
    } catch {
      // Algunos navegadores no permiten requestData justo antes de detener.
    }

    recorder.stop();
  }
}

export function downloadBlob(
  blob,
  fileName = "reel-tuscomercios-studio.webm"
) {
  if (!blob) {
    throw new Error("No existe un video para descargar.");
  }

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

  return url;
}

export function sanitizeVideoFileName(value = "comercio") {
  const clean = String(value || "comercio")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return clean || "comercio";
}

export function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
