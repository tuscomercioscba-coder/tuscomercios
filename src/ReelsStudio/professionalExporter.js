import {
  drawExportFrame,
  EXPORT_WIDTH,
  EXPORT_HEIGHT,
} from "./exportFrameRenderer";
import { getAudioGain } from "./audioUtils";
import { getMediaById } from "./mediaUtils";
import {
  ensureMp4,
  getNativeRecorderFormat,
} from "./mp4Converter";


async function loadStickerImages(layers) {
  const urls = [
    ...new Set(
      layers
        .filter((layer) => layer.type === "sticker" && layer.stickerSrc)
        .map((layer) => layer.stickerSrc)
    ),
  ];

  const entries = await Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          const image = new Image();
          image.onload = () => resolve([url, image]);
          image.onerror = () => resolve([url, null]);
          image.src = url;
        })
    )
  );

  return Object.fromEntries(entries);
}

export async function exportReelProject({
  mediaItems,
  clips,
  layers,
  audioTrack = null,
  voiceTrack = null,
  fps = 30,
  onProgress,
  onStage,
  signal,
}) {
  if (!clips?.length) {
    throw new Error(
      "El proyecto no tiene escenas."
    );
  }

  if (
    document.fonts?.ready
  ) {
    await document.fonts.ready;
  }

  const canvas =
    document.createElement("canvas");

  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;

  const context =
    canvas.getContext("2d", {
      alpha: false,
    });

  const canvasStream =
    canvas.captureStream(fps);

  const outputStream =
    new MediaStream();

  canvasStream
    .getVideoTracks()
    .forEach((track) =>
      outputStream.addTrack(track)
    );

  const audioContext =
    new AudioContext();

  const audioDestination =
    audioContext.createMediaStreamDestination();

  function connectProjectAudio(
    track
  ) {
    if (!track?.url) {
      return {
        element: null,
        gain: null,
        source: null,
      };
    }

    const element =
      new Audio(track.url);

    element.preload =
      "auto";

    const source =
      audioContext.createMediaElementSource(
        element
      );

    const gain =
      audioContext.createGain();

    source.connect(gain);
    gain.connect(
      audioDestination
    );

    return {
      element,
      gain,
      source,
    };
  }

  const musicAudio =
    connectProjectAudio(
      audioTrack
    );

  const voiceAudio =
    connectProjectAudio(
      voiceTrack
    );

  audioDestination.stream
    .getAudioTracks()
    .forEach((track) =>
      outputStream.addTrack(track)
    );

  await audioContext.resume();

  const stickerImages = await loadStickerImages(layers);

  const hasAudio =
    outputStream
      .getAudioTracks()
      .length > 0;

  const recorderFormat =
    getNativeRecorderFormat(
      hasAudio
    );

  const mimeType =
    recorderFormat.mimeType;


  const recorder =
    new MediaRecorder(
      outputStream,
      {
        ...(mimeType
          ? { mimeType }
          : {}),
        videoBitsPerSecond:
          14_000_000,
      }
    );

  const chunks = [];

  recorder.ondataavailable =
    (event) => {
      if (event.data?.size) {
        chunks.push(event.data);
      }
    };

  const stopped =
    new Promise(
      (resolve, reject) => {
        recorder.onerror = () =>
          reject(
            new Error(
              "Falló la exportación."
            )
          );

        recorder.onstop = () =>
          window.setTimeout(
            () => {
              const blob =
                new Blob(chunks, {
                  type:
                    recorder.mimeType ||
                    mimeType ||
                    "video/webm",
                });

              if (!blob.size) {
                reject(
                  new Error(
                    "El navegador generó un video vacío."
                  )
                );
                return;
              }

              resolve(blob);
            },
            200
          );
      }
    );

  const totalDuration =
    clips.reduce(
      (sum, clip) =>
        sum +
        Math.max(
          0,
          Number(clip.end) -
            Number(clip.start)
        ),
      0
    );

  let projectTime = 0;

  onStage?.(
    "Renderizando escenas..."
  );

  recorder.start(500);

  for (const clip of clips) {
    if (signal?.aborted) {
      throw new DOMException(
        "Exportación cancelada.",
        "AbortError"
      );
    }

    const media =
      getMediaById(
        mediaItems,
        clip.mediaId
      );

    if (!media) continue;

    const duration =
      Math.max(
        0.1,
        Number(clip.end) -
          Number(clip.start)
      );

    const element =
      await loadMediaElement(
        media,
        clip.start
      );

    const secondaryMedia =
      clip.secondaryMediaId
        ? getMediaById(
            mediaItems,
            clip.secondaryMediaId
          )
        : null;

    const secondaryElement =
      secondaryMedia
        ? await loadMediaElement(
            secondaryMedia,
            0
          )
        : null;

    const narrationMedia =
      clip.narrationMediaId
        ? getMediaById(
            mediaItems,
            clip.narrationMediaId
          )
        : null;

    let narrationElement = null;
    let narrationSource = null;
    let narrationGain = null;

    if (
      narrationMedia?.type ===
      "video"
    ) {
      narrationElement =
        await loadMediaElement(
          narrationMedia,
          Number(
            clip.narrationStart ||
              0
          )
        );

      narrationSource =
        audioContext.createMediaElementSource(
          narrationElement
        );

      narrationGain =
        audioContext.createGain();

      narrationGain.gain.value =
        Math.max(
          0,
          Math.min(
            1,
            Number(
              clip.narrationVolume ??
                100
            ) / 100
          )
        );

      narrationSource.connect(
        narrationGain
      );

      narrationGain.connect(
        audioDestination
      );
    }

    const startedAt =
      performance.now();

    if (media.type === "video") {
      element.muted = true;

      await element
        .play()
        .catch(() => {});
    }

    if (
      secondaryMedia?.type ===
        "video" &&
      secondaryElement
    ) {
      secondaryElement.muted =
        true;

      await secondaryElement
        .play()
        .catch(() => {});
    }

    if (narrationElement) {
      narrationElement.muted =
        false;

      await narrationElement
        .play()
        .catch(() => {});
    }

    while (true) {
      if (signal?.aborted) {
        element.pause?.();

        throw new DOMException(
          "Exportación cancelada.",
          "AbortError"
        );
      }

      const elapsed =
        Math.min(
          duration,
          (performance.now() -
            startedAt) /
            1000
        );

      if (
        media.type === "video" &&
        Math.abs(
          element.currentTime -
            (clip.start +
              elapsed)
        ) > 0.25
      ) {
        try {
          element.currentTime =
            clip.start +
            elapsed;
        } catch {}
      }

      if (
        secondaryMedia?.type ===
          "video" &&
        secondaryElement &&
        Math.abs(
          secondaryElement.currentTime -
            elapsed
        ) > 0.25
      ) {
        try {
          secondaryElement.currentTime =
            elapsed;
        } catch {}
      }

      if (
        narrationElement &&
        Math.abs(
          narrationElement.currentTime -
            (Number(
              clip.narrationStart ||
                0
            ) +
              elapsed)
        ) > 0.25
      ) {
        try {
          narrationElement.currentTime =
            Number(
              clip.narrationStart ||
                0
            ) +
            elapsed;
        } catch {}
      }

      const absoluteTime =
        projectTime + elapsed;

      drawExportFrame({
        context,
        mediaElement: element,
        mediaType: media.type,
        secondaryElement,
        secondaryType:
          secondaryMedia?.type ||
          "video",
        clip,
        clipProgress:
          duration > 0
            ? elapsed / duration
            : 0,
        currentTime:
          absoluteTime,
        layers,
        stickerImages,
      });

      syncAudio(
        musicAudio.element,
        musicAudio.gain,
        audioTrack,
        absoluteTime
      );

      syncAudio(
        voiceAudio.element,
        voiceAudio.gain,
        voiceTrack,
        absoluteTime
      );

      onProgress?.(
        Math.min(
          80,
          totalDuration > 0
            ? (absoluteTime /
                totalDuration) *
                80
            : 0
        )
      );

      if (
        elapsed >=
        duration - 0.015
      ) {
        break;
      }

      await new Promise(
        requestAnimationFrame
      );
    }

    element.pause?.();

    secondaryElement?.pause?.();
    narrationElement?.pause?.();

    cleanupMediaElement(
      element,
      media.type
    );

    if (secondaryElement) {
      cleanupMediaElement(
        secondaryElement,
        secondaryMedia?.type
      );
    }

    if (narrationElement) {
      cleanupMediaElement(
        narrationElement,
        "video"
      );

      try {
        narrationSource?.disconnect();
        narrationGain?.disconnect();
      } catch {}
    }

    projectTime += duration;
  }

  onProgress?.(80);
  onStage?.(
    "Finalizando video..."
  );

  await new Promise((resolve) =>
    setTimeout(resolve, 250)
  );

  try {
    recorder.requestData();
  } catch {}

  await new Promise((resolve) =>
    setTimeout(resolve, 180)
  );

  recorder.stop();

  const blob = await stopped;

  outputStream
    .getTracks()
    .forEach((track) =>
      track.stop()
    );

  musicAudio.element?.pause();
  voiceAudio.element?.pause();

  try {
    musicAudio.source?.disconnect();
    musicAudio.gain?.disconnect();
    voiceAudio.source?.disconnect();
    voiceAudio.gain?.disconnect();
  } catch {}

  await audioContext
    .close()
    .catch(() => {});

  const mp4 =
    await ensureMp4({
      blob,
      nativeMp4:
        recorderFormat.nativeMp4,
      signal,
      duration:
        totalDuration,
      fps,
      onProgress: (
        progress,
        stage
      ) => {
        onProgress?.(
          progress
        );

        if (stage) {
          onStage?.(
            stage
          );
        }
      },
    });

  return {
    blob: mp4.blob,
    duration:
      totalDuration,
    extension:
      mp4.extension,
    mimeType:
      "video/mp4",
    converted:
      mp4.converted,
  };
}

function loadMediaElement(
  media,
  start
) {
  if (media.type === "image") {
    return new Promise(
      (resolve, reject) => {
        const image =
          new Image();

        image.onload = () =>
          resolve(image);

        image.onerror = () =>
          reject(
            new Error(
              `No se pudo leer ${media.name}.`
            )
          );

        image.src = media.url;
      }
    );
  }

  return new Promise(
    (resolve, reject) => {
      const video =
        document.createElement(
          "video"
        );

      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.src = media.url;

      const done = () => {
        try {
          video.currentTime =
            Number(start || 0);
        } catch {}

        window.setTimeout(
          () => resolve(video),
          80
        );
      };

      video.onloadeddata = done;
      video.onerror = () =>
        reject(
          new Error(
            `No se pudo leer ${media.name}.`
          )
        );

      video.load();
    }
  );
}

function cleanupMediaElement(
  element,
  type
) {
  if (type !== "video") return;

  element.pause();
  element.removeAttribute("src");
  element.load();
}

function syncAudio(
  audio,
  gainNode,
  track,
  projectTime
) {
  if (
    !audio ||
    !gainNode ||
    !track
  ) {
    return;
  }

  const active =
    projectTime >= track.start &&
    projectTime <= track.end;

  if (!active) {
    gainNode.gain.value = 0;
    audio.pause();
    return;
  }

  const target =
    Math.max(
      0,
      Number(track.sourceStart || 0) +
        (projectTime -
          track.start)
    );

  if (
    Math.abs(
      audio.currentTime -
        target
    ) > 0.3
  ) {
    try {
      audio.currentTime =
        target;
    } catch {}
  }

  gainNode.gain.value =
    getAudioGain(
      track,
      projectTime
    );

  if (audio.paused) {
    audio
      .play()
      .catch(() => {});
  }
}
