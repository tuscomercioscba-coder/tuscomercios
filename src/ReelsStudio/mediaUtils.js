import { createId } from "./utils";
import { ensureClipTransition } from "./motionUtils";

export const MEDIA_TYPES = {
  VIDEO: "video",
  IMAGE: "image",
};

export async function createMediaItemFromFile(file) {
  const type = file.type.startsWith("image/")
    ? MEDIA_TYPES.IMAGE
    : MEDIA_TYPES.VIDEO;

  const url = URL.createObjectURL(file);

  if (type === MEDIA_TYPES.IMAGE) {
    const metadata = await readImageMetadata(url);

    return {
      id: createId("media"),
      type,
      name: file.name,
      url,
      duration: 4,
      width: metadata.width,
      height: metadata.height,
      thumbnail: url,
      origin: "upload",
      fileRef: {
        name: file.name,
        size: Number(file.size || 0),
        type: file.type || "image/*",
        lastModified: Number(
          file.lastModified || 0
        ),
      },
    };
  }

  const metadata = await readVideoMetadata(url);
  const thumbnail = await createVideoPoster(url, metadata.duration);

  return {
    id: createId("media"),
    type,
    name: file.name,
    url,
    duration: metadata.duration,
    width: metadata.width,
    height: metadata.height,
    thumbnail,
    origin: "upload",
    fileRef: {
      name: file.name,
      size: Number(file.size || 0),
      type: file.type || "video/*",
      lastModified: Number(
        file.lastModified || 0
      ),
    },
  };
}

export async function createMediaItemFromRecording(recording) {
  const metadata = await readVideoMetadata(recording.url);
  const thumbnail = await createVideoPoster(
    recording.url,
    metadata.duration
  );

  return {
    id: createId("media"),
    type: MEDIA_TYPES.VIDEO,
    name: recording.fileName || "Grabación de pantalla.webm",
    url: recording.url,
    duration: Math.max(
      Number(metadata.duration || 0),
      Number(recording.duration || 0),
      0.1
    ),
    width: metadata.width,
    height: metadata.height,
    thumbnail,
    origin: "recording",
    fileRef: {
      name:
        recording.fileName ||
        "Grabación de pantalla.webm",
      size: Number(
        recording.blob?.size || 0
      ),
      type:
        recording.blob?.type ||
        "video/webm",
      lastModified: 0,
    },
  };
}

export function createClipFromMedia(media, index = 0) {
  const duration =
    media.type === MEDIA_TYPES.IMAGE
      ? 4
      : Math.max(0.1, Number(media.duration || 1));

  return ensureClipTransition({
    id: createId("clip"),
    name: `Escena ${index + 1}`,
    mediaId: media.id,
    mediaType: media.type,
    mediaName: media.name,
    thumbnail: media.thumbnail || media.url,
    start: 0,
    end: duration,
    sourceDuration: Math.max(
      duration,
      Number(media.duration || duration)
    ),
    fit: "smart",
    mediaX: 50,
    mediaY: 50,
    mediaScale: 100,
    mediaRotation: 0,
    mediaOpacity: 100,
    mediaBorderRadius: 0,
    photoMotion:
      media.type === MEDIA_TYPES.IMAGE
        ? "zoom-in"
        : "none",
    muted: false,
    volume: 100,
    compositionMode: "single",
    secondaryMediaId: "",
    narrationMediaId:
      media.type === MEDIA_TYPES.VIDEO
        ? media.id
        : "",
    narrationVolume: 100,
    narrationStart: 0,
  });
}

export function replaceClipMedia(clip, media) {
  const defaultDuration =
    media.type === MEDIA_TYPES.IMAGE
      ? Math.max(1, clip.end - clip.start || 4)
      : Math.max(0.1, Number(media.duration || 1));

  return {
    ...clip,
    mediaId: media.id,
    mediaType: media.type,
    mediaName: media.name,
    thumbnail: media.thumbnail || media.url,
    start: 0,
    end: defaultDuration,
    sourceDuration: defaultDuration,
    fit: "smart",
    mediaX: 50,
    mediaY: 50,
    mediaScale: 100,
    mediaRotation: 0,
    photoMotion:
      media.type === MEDIA_TYPES.IMAGE
        ? clip.photoMotion || "zoom-in"
        : "none",
  };
}

export function getMediaById(mediaItems, id) {
  return mediaItems.find((item) => item.id === id) || null;
}

export function revokeMediaItems(mediaItems = []) {
  mediaItems.forEach((item) => {
    if (item.url?.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }

    if (
      item.thumbnail?.startsWith("blob:") &&
      item.thumbnail !== item.url
    ) {
      URL.revokeObjectURL(item.thumbnail);
    }
  });
}

function readImageMetadata(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () =>
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });

    image.onerror = () =>
      reject(
        new Error("No se pudo leer la imagen.")
      );

    image.src = url;
  });
}

function readVideoMetadata(url) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    let finished = false;

    const cleanup = () => {
      video.removeEventListener(
        "loadedmetadata",
        done
      );
      video.removeEventListener(
        "error",
        fail
      );
    };

    const done = () => {
      if (finished) return;
      finished = true;
      cleanup();

      resolve({
        duration:
          Number.isFinite(video.duration) &&
          video.duration > 0
            ? video.duration
            : 1,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      });

      video.removeAttribute("src");
      video.load();
    };

    const fail = () => {
      if (finished) return;
      finished = true;
      cleanup();
      reject(
        new Error("No se pudo leer el video.")
      );
    };

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    video.addEventListener(
      "loadedmetadata",
      done,
      { once: true }
    );

    video.addEventListener(
      "error",
      fail,
      { once: true }
    );

    video.load();
    window.setTimeout(fail, 10000);
  });
}

function createVideoPoster(url, duration) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = 320;
    canvas.height = 180;

    const finish = () => {
      try {
        const sw = video.videoWidth || 320;
        const sh = video.videoHeight || 180;
        const scale = Math.max(
          canvas.width / sw,
          canvas.height / sh
        );
        const dw = sw * scale;
        const dh = sh * scale;

        context.fillStyle = "#020617";
        context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        context.drawImage(
          video,
          (canvas.width - dw) / 2,
          (canvas.height - dh) / 2,
          dw,
          dh
        );

        resolve(
          canvas.toDataURL(
            "image/jpeg",
            0.75
          )
        );
      } catch {
        resolve("");
      }

      video.removeAttribute("src");
      video.load();
    };

    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(
        Math.max(0, duration * 0.12),
        Math.max(0, duration - 0.05)
      );
    };

    video.onseeked = finish;
    video.onerror = () => resolve("");
    video.load();

    window.setTimeout(
      () => resolve(""),
      5000
    );
  });
}
