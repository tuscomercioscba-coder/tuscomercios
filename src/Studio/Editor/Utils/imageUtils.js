export function calculateImageLayout({
  image,
  frameWidth,
  frameHeight,
  fit = "contain",
  imageScale = 1,
  cropOffsetX = 0,
  cropOffsetY = 0,
}) {
  if (!image) return null;

  const imageWidth =
    image.naturalWidth ||
    image.width ||
    1;

  const imageHeight =
    image.naturalHeight ||
    image.height ||
    1;

  if (fit === "fill") {
    return {
      x: 0,
      y: 0,
      width: frameWidth,
      height: frameHeight,
    };
  }

  const baseScale =
    fit === "cover"
      ? Math.max(
          frameWidth / imageWidth,
          frameHeight / imageHeight
        )
      : Math.min(
          frameWidth / imageWidth,
          frameHeight / imageHeight
        );

  const scale =
    baseScale *
    Math.max(
      0.1,
      Number(imageScale || 1)
    );

  const width =
    imageWidth * scale;

  const height =
    imageHeight * scale;

  return {
    x:
      (frameWidth - width) / 2 +
      Number(cropOffsetX || 0),

    y:
      (frameHeight - height) / 2 +
      Number(cropOffsetY || 0),

    width,
    height,
  };
}

export function readImageFile(
  file,
  maxSize = 15 * 1024 * 1024
) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(
        new Error(
          "No se seleccionó ningún archivo."
        )
      );
      return;
    }

    if (!file.type?.startsWith("image/")) {
      reject(
        new Error(
          "Seleccioná un archivo de imagen."
        )
      );
      return;
    }

    if (file.size > maxSize) {
      reject(
        new Error(
          "La imagen no puede superar los 15 MB."
        )
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () =>
      resolve(reader.result);

    reader.onerror = () =>
      reject(
        new Error(
          "No se pudo leer la imagen."
        )
      );

    reader.readAsDataURL(file);
  });
}