export function getSupportedVideoMimeType() {
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
    return "video/webm;codecs=vp9";
  }

  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
    return "video/webm;codecs=vp8";
  }

  return "video/webm";
}

export function createCanvasRecorder(canvas, fps = 30) {
  const stream = canvas.captureStream(fps);
  const mimeType = getSupportedVideoMimeType();

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 9000000,
  });

  const chunks = [];

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  const waitForStop = () =>
    new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: recorder.mimeType || mimeType,
        });

        resolve(blob);
      };
    });

  return {
    recorder,
    waitForStop,
    mimeType,
  };
}

export function downloadBlob(blob, fileName = "reel-tus-comercios.webm") {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);
}