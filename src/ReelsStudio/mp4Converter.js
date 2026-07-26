const FFMPEG_VERSION = "0.12.15";
const UTIL_VERSION = "0.12.2";
const CORE_VERSION = "0.12.10";

let ffmpegInstance = null;
let ffmpegLoading = null;
let activeProgressHandler = null;

export function getNativeRecorderFormat(hasAudio) {
  const candidates = hasAudio
    ? [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ]
    : [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];

  const mimeType =
    candidates.find((type) =>
      MediaRecorder.isTypeSupported(type)
    ) || "";

  return {
    mimeType,
    extension: "webm",
    nativeMp4: false,
  };
}

async function loadFFmpeg(onProgress, signal) {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  if (ffmpegLoading) {
    return ffmpegLoading;
  }

  ffmpegLoading = (async () => {
    if (signal?.aborted) {
      throw new DOMException(
        "Conversión cancelada.",
        "AbortError"
      );
    }

    onProgress?.(
      81,
      "Preparando conversor MP4..."
    );

    const ffmpegModuleUrl =
      `https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@${FFMPEG_VERSION}/dist/esm/index.js`;

    const utilModuleUrl =
      `https://cdn.jsdelivr.net/npm/@ffmpeg/util@${UTIL_VERSION}/dist/esm/index.js`;

    const { FFmpeg } = await import(
      /* @vite-ignore */
      ffmpegModuleUrl
    );

    const { toBlobURL } = await import(
      /* @vite-ignore */
      utilModuleUrl
    );

    const ffmpeg = new FFmpeg();

    ffmpeg.on("progress", ({ progress }) => {
      const cleanProgress = Math.max(
        0,
        Math.min(1, Number(progress || 0))
      );

      activeProgressHandler?.(cleanProgress);
    });

    const coreBase =
      `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

    const classWorkerURL = new URL(
      "/ffmpeg/worker.js",
      window.location.origin
    ).href;

    onProgress?.(
      82,
      "Cargando conversor MP4..."
    );

    await ffmpeg.load({
      classWorkerURL,
      coreURL: await toBlobURL(
        `${coreBase}/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await toBlobURL(
        `${coreBase}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    onProgress?.(
      83,
      "Conversor MP4 preparado"
    );

    ffmpegInstance = ffmpeg;

    return ffmpeg;
  })();

  try {
    return await ffmpegLoading;
  } finally {
    ffmpegLoading = null;
  }
}

export async function ensureMp4({
  blob,
  nativeMp4,
  onProgress,
  signal,
  duration,
  fps = 30,
}) {
  const ffmpeg = await loadFFmpeg(
    onProgress,
    signal
  );

  if (signal?.aborted) {
    throw new DOMException(
      "Conversión cancelada.",
      "AbortError"
    );
  }

  const inputName =
    `reel-input-${Date.now()}.webm`;

  const outputName =
    `reel-output-${Date.now()}.mp4`;

  const inputData = new Uint8Array(
    await blob.arrayBuffer()
  );

  onProgress?.(
    84,
    "Preparando archivo de video..."
  );

  await ffmpeg.writeFile(
    inputName,
    inputData
  );

  let displayedProgress = 84;

  const updateProgress = (
    nextProgress,
    message = "Convirtiendo a MP4..."
  ) => {
    displayedProgress = Math.max(
      displayedProgress,
      Math.min(99, nextProgress)
    );

    onProgress?.(
      displayedProgress,
      message
    );
  };

  activeProgressHandler = (
    conversionProgress
  ) => {
    updateProgress(
      84 + conversionProgress * 15
    );
  };

  const visualProgressTimer = window.setInterval(
    () => {
      if (displayedProgress >= 98.5) {
        return;
      }

      const remaining =
        98.5 - displayedProgress;

      const step = Math.max(
        0.12,
        Math.min(0.65, remaining * 0.08)
      );

      updateProgress(
        displayedProgress + step
      );
    },
    700
  );

  const command = [
    "-fflags",
    "+genpts",
    "-i",
    inputName,
    "-map",
    "0:v:0",
    "-map",
    "0:a?",
    "-r",
    String(fps),
    "-vsync",
    "cfr",
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-crf",
    "22",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-af",
    "aresample=async=1:first_pts=0",
    "-avoid_negative_ts",
    "make_zero",
    "-video_track_timescale",
    "90000",
  ];

  if (Number(duration) > 0) {
    command.push(
      "-t",
      Number(duration).toFixed(3)
    );
  }

  command.push(
    "-movflags",
    "+faststart",
    outputName
  );

  try {
    updateProgress(
      84,
      "Convirtiendo a MP4..."
    );

    await ffmpeg.exec(command);

    if (signal?.aborted) {
      throw new DOMException(
        "Conversión cancelada.",
        "AbortError"
      );
    }

    updateProgress(
      99,
      "Finalizando archivo MP4..."
    );

    const output =
      await ffmpeg.readFile(
        outputName
      );

    const mp4Blob = new Blob(
      [output.buffer],
      {
        type: "video/mp4",
      }
    );

    if (!mp4Blob.size) {
      throw new Error(
        "La conversión MP4 generó un archivo vacío."
      );
    }

    onProgress?.(
      100,
      "MP4 listo"
    );

    return {
      blob: mp4Blob,
      extension: "mp4",
      converted: true,
    };
  } finally {
    window.clearInterval(
      visualProgressTimer
    );

    activeProgressHandler = null;

    try {
      await ffmpeg.deleteFile(
        inputName
      );
    } catch {}

    try {
      await ffmpeg.deleteFile(
        outputName
      );
    } catch {}
  }
}