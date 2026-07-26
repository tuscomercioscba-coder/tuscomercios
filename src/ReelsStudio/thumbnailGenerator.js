export async function generateVideoThumbnails({
  sourceUrl,
  duration,
  count = 18,
  width = 180,
  height = 100,
}) {
  if (!sourceUrl || !duration) return [];

  const video = document.createElement("video");
  video.src = sourceUrl;
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;

  await waitForEvent(video, "loadedmetadata", 8000);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  const thumbnails = [];

  for (let index = 0; index < count; index += 1) {
    const time =
      count === 1
        ? 0
        : (duration * index) / (count - 1);

    await seekVideo(video, Math.min(time, Math.max(0, duration - 0.05)));

    context.fillStyle = "#020617";
    context.fillRect(0, 0, width, height);

    const videoWidth = video.videoWidth || width;
    const videoHeight = video.videoHeight || height;
    const scale = Math.max(width / videoWidth, height / videoHeight);
    const drawWidth = videoWidth * scale;
    const drawHeight = videoHeight * scale;

    context.drawImage(
      video,
      (width - drawWidth) / 2,
      (height - drawHeight) / 2,
      drawWidth,
      drawHeight
    );

    thumbnails.push({
      time,
      src: canvas.toDataURL("image/jpeg", 0.72),
    });
  }

  video.removeAttribute("src");
  video.load();

  return thumbnails;
}

function waitForEvent(target, name, timeout) {
  return new Promise((resolve, reject) => {
    let finished = false;

    const done = () => {
      if (finished) return;
      finished = true;
      target.removeEventListener(name, done);
      resolve();
    };

    target.addEventListener(name, done, { once: true });

    setTimeout(() => {
      if (finished) return;
      finished = true;
      target.removeEventListener(name, done);
      reject(new Error("No se pudo leer el video."));
    }, timeout);
  });
}

function seekVideo(video, time) {
  return new Promise((resolve) => {
    let finished = false;

    const done = () => {
      if (finished) return;
      finished = true;
      video.removeEventListener("seeked", done);
      resolve();
    };

    video.addEventListener("seeked", done, { once: true });

    try {
      video.currentTime = time;
    } catch {
      done();
    }

    setTimeout(done, 600);
  });
}
