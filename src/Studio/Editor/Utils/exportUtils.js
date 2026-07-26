function dataUrlToBlob(dataUrl) {
  const [header, encoded] = String(dataUrl || "").split(",");

  if (!header || !encoded) {
    throw new Error("No se pudo preparar el archivo exportado.");
  }

  const mimeType =
    header.match(/data:(.*?);base64/)?.[1] ||
    "application/octet-stream";

  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], {
    type: mimeType,
  });
}

export async function exportStage({
  stage,
  project,
  fileName,
  mimeType = "image/png",
  pixelRatio = 1,
  quality = 1,
}) {
  if (!stage || !project) {
    throw new Error("No se encontró el lienzo.");
  }

  const previous = {
    width: stage.width(),
    height: stage.height(),
    scaleX: stage.scaleX(),
    scaleY: stage.scaleY(),
  };

  try {
    stage.width(project.width);
    stage.height(project.height);
    stage.scale({
      x: 1,
      y: 1,
    });
    stage.batchDraw();

    const dataUrl = stage.toDataURL({
      pixelRatio,
      mimeType,
      quality,
    });

    const blob = dataUrlToBlob(dataUrl);

    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    link.click();

    return {
      blob,
      dataUrl,
      fileName,
      mimeType,
    };
  } finally {
    stage.width(previous.width);
    stage.height(previous.height);
    stage.scale({
      x: previous.scaleX,
      y: previous.scaleY,
    });
    stage.batchDraw();
  }
}

export function downloadProjectFile(
  project,
  fileName = "proyecto-studio.json"
) {
  const blob = new Blob(
    [JSON.stringify(project, null, 2)],
    {
      type: "application/json",
    }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export function importProjectFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(
        new Error(
          "No se seleccionó ningún proyecto."
        )
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(
          reader.result
        );

        if (
          !parsed?.width ||
          !parsed?.height ||
          !Array.isArray(parsed?.elements)
        ) {
          throw new Error(
            "El archivo no es un proyecto válido."
          );
        }

        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(
        new Error(
          "No se pudo leer el proyecto."
        )
      );
    };

    reader.readAsText(file);
  });
}

export async function exportMultipleFormats({
  stage,
  project,
  baseName,
  formats = ["png"],
  pixelRatio = 1,
}) {
  const results = [];

  for (const format of formats) {
    const mimeType =
      format === "jpg"
        ? "image/jpeg"
        : format === "webp"
          ? "image/webp"
          : "image/png";

    const result = await exportStage({
      stage,
      project,
      fileName: `${baseName}.${format}`,
      mimeType,
      pixelRatio,
      quality: 0.95,
    });

    results.push(result);

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
  }

  return results;
}