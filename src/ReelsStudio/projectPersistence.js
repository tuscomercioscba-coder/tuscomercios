const PROJECT_FORMAT =
  "tuscomercios-reels-project";

const PROJECT_VERSION = 2;

function withoutRuntimeUrl(
  value
) {
  if (!value) return null;

  const {
    url,
    thumbnail,
    ...rest
  } = value;

  return {
    ...rest,
    url: "",
    thumbnail:
      typeof thumbnail ===
        "string" &&
      !thumbnail.startsWith(
        "blob:"
      )
        ? thumbnail
        : "",
  };
}

function getAudioReference(
  track,
  role
) {
  if (!track) return null;

  return {
    role,
    id: track.id,
    name:
      track.fileRef?.name ||
      track.name ||
      (role === "music"
        ? "Música"
        : "Narración"),
    size: Number(
      track.fileRef?.size || 0
    ),
    type:
      track.fileRef?.type ||
      "audio/*",
    lastModified: Number(
      track.fileRef
        ?.lastModified || 0
    ),
  };
}

export function createProjectManifest({
  project,
  mediaItems,
  layers,
  audioTrack,
  voiceTrack,
  editorSettings,
}) {
  return {
    format: PROJECT_FORMAT,
    version: PROJECT_VERSION,
    createdAt:
      new Date().toISOString(),

    project: {
      ...project,
      sourceUrl: "",
    },

    layers: layers.map(
      (layer) => ({
        ...layer,
      })
    ),

    media: mediaItems.map(
      (item) => ({
        ...withoutRuntimeUrl(
          item
        ),
        fileRef: {
          name:
            item.fileRef?.name ||
            item.name,
          size: Number(
            item.fileRef?.size ||
              0
          ),
          type:
            item.fileRef?.type ||
            (item.type ===
            "image"
              ? "image/*"
              : "video/*"),
          lastModified:
            Number(
              item.fileRef
                ?.lastModified ||
                0
            ),
        },
      })
    ),

    audio: {
      music:
        withoutRuntimeUrl(
          audioTrack
        ),
      voice:
        withoutRuntimeUrl(
          voiceTrack
        ),
    },

    references: {
      media:
        mediaItems.map(
          (item) => ({
            id: item.id,
            name:
              item.fileRef?.name ||
              item.name,
            size: Number(
              item.fileRef?.size ||
                0
            ),
            type:
              item.fileRef?.type ||
              (item.type ===
              "image"
                ? "image/*"
                : "video/*"),
            lastModified:
              Number(
                item.fileRef
                  ?.lastModified ||
                  0
              ),
            origin:
              item.origin ||
              "upload",
          })
        ),

      audio: [
        getAudioReference(
          audioTrack,
          "music"
        ),
        getAudioReference(
          voiceTrack,
          "voice"
        ),
      ].filter(Boolean),
    },

    editorSettings: {
      snapEnabled:
        Boolean(
          editorSettings
            ?.snapEnabled
        ),
      showSafeArea:
        Boolean(
          editorSettings
            ?.showSafeArea
        ),
      showRulers:
        Boolean(
          editorSettings
            ?.showRulers
        ),
      safePreset:
        editorSettings
          ?.safePreset ||
        "instagram",
    },
  };
}

export function validateProjectManifest(
  manifest
) {
  if (
    !manifest ||
    typeof manifest !==
      "object"
  ) {
    throw new Error(
      "El archivo de proyecto está vacío."
    );
  }

  if (
    manifest.format !==
      PROJECT_FORMAT
  ) {
    if (
      Array.isArray(
        manifest.clips
      )
    ) {
      throw new Error(
        "Este es un proyecto antiguo. Volvé a guardarlo con la versión nueva de Reels Studio."
      );
    }

    throw new Error(
      "El archivo no pertenece a Reels Studio."
    );
  }

  if (
    !Array.isArray(
      manifest.project?.clips
    )
  ) {
    throw new Error(
      "El proyecto no contiene escenas válidas."
    );
  }

  return manifest;
}

export function downloadProjectManifest(
  manifest,
  fileName
) {
  const blob =
    new Blob(
      [
        JSON.stringify(
          manifest,
          null,
          2
        ),
      ],
      {
        type:
          "application/json",
      }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download =
    fileName.endsWith(
      ".tcproject"
    )
      ? fileName
      : `${fileName}.tcproject`;

  document.body.appendChild(
    link
  );

  link.click();
  link.remove();

  window.setTimeout(
    () =>
      URL.revokeObjectURL(
        url
      ),
    1000
  );
}

function normalizeName(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase();
}

function fileMatchesReference(
  file,
  reference
) {
  if (
    normalizeName(
      file.name
    ) !==
    normalizeName(
      reference.name
    )
  ) {
    return false;
  }

  const expectedSize =
    Number(
      reference.size || 0
    );

  if (
    expectedSize > 0 &&
    Number(file.size || 0) !==
      expectedSize
  ) {
    return false;
  }

  return true;
}

export function matchProjectFiles({
  files,
  manifest,
}) {
  const available = [
    ...files,
  ];

  const takeMatch = (
    reference
  ) => {
    let index =
      available.findIndex(
        (file) =>
          fileMatchesReference(
            file,
            reference
          )
      );

    if (index < 0) {
      index =
        available.findIndex(
          (file) =>
            normalizeName(
              file.name
            ) ===
            normalizeName(
              reference.name
            )
        );
    }

    if (index < 0) {
      return null;
    }

    const [file] =
      available.splice(
        index,
        1
      );

    return file;
  };

  const mediaMatches =
    manifest.references.media.map(
      (reference) => ({
        reference,
        file:
          takeMatch(
            reference
          ),
      })
    );

  const audioMatches =
    manifest.references.audio.map(
      (reference) => ({
        reference,
        file:
          takeMatch(
            reference
          ),
      })
    );

  return {
    mediaMatches,
    audioMatches,
    missing: [
      ...mediaMatches,
      ...audioMatches,
    ]
      .filter(
        (item) =>
          !item.file
      )
      .map(
        (item) =>
          item.reference
      ),
  };
}
