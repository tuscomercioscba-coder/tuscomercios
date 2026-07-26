export function getSupportedRecordingMimeType() {
  const candidates = [
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9,opus",
    "video/webm",
  ];

  return (
    candidates.find((type) =>
      window.MediaRecorder?.isTypeSupported?.(type)
    ) || ""
  );
}

export async function createScreenCaptureSession({
  withMicrophone = false,
  videoBitsPerSecond = 8_000_000,
} = {}) {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error(
      "Este navegador no permite grabar la pantalla."
    );
  }

  const displayStream =
    await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: {
          ideal: 30,
          max: 30,
        },
      },
      audio: true,
    });

  let microphoneStream = null;

  if (withMicrophone) {
    try {
      microphoneStream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
    } catch {
      displayStream
        .getTracks()
        .forEach((track) => track.stop());

      throw new Error(
        "No se pudo acceder al micrófono."
      );
    }
  }

  const combinedStream = new MediaStream();

  displayStream
    .getVideoTracks()
    .forEach((track) =>
      combinedStream.addTrack(track)
    );

  [
    ...displayStream.getAudioTracks(),
    ...(microphoneStream?.getAudioTracks() || []),
  ].forEach((track) =>
    combinedStream.addTrack(track)
  );

  const mimeType =
    getSupportedRecordingMimeType();

  const options = {
    videoBitsPerSecond,
  };

  if (mimeType) {
    options.mimeType = mimeType;
  }

  if (
    combinedStream.getAudioTracks().length > 0
  ) {
    options.audioBitsPerSecond = 160_000;
  }

  const recorder =
    new MediaRecorder(
      combinedStream,
      options
    );

  const chunks = [];

  let startedAt = 0;
  let stopRequested = false;
  let settled = false;
  let resolveStopped;
  let rejectStopped;
  let stopTimeout = null;

  const stopped = new Promise(
    (resolve, reject) => {
      resolveStopped = resolve;
      rejectStopped = reject;
    }
  );

  function stopAllTracks() {
    displayStream
      .getTracks()
      .forEach((track) => track.stop());

    microphoneStream
      ?.getTracks()
      .forEach((track) => track.stop());

    combinedStream
      .getTracks()
      .forEach((track) => track.stop());
  }

  function fail(message) {
    if (settled) return;
    settled = true;

    if (stopTimeout) {
      window.clearTimeout(stopTimeout);
      stopTimeout = null;
    }

    stopAllTracks();

    rejectStopped(
      new Error(message)
    );
  }

  function complete() {
    if (settled) return;

    const validChunks =
      chunks.filter(
        (chunk) => chunk?.size > 0
      );

    if (!validChunks.length) {
      fail(
        "El navegador no generó un archivo de video válido. Probá grabar nuevamente usando Chrome o Edge."
      );
      return;
    }

    const blob = new Blob(
      validChunks,
      {
        type:
          recorder.mimeType ||
          mimeType ||
          "video/webm",
      }
    );

    if (!blob.size) {
      fail(
        "La grabación quedó vacía. Probá nuevamente."
      );
      return;
    }

    settled = true;

    if (stopTimeout) {
      window.clearTimeout(stopTimeout);
      stopTimeout = null;
    }

    stopAllTracks();

    resolveStopped({
      blob,
      duration: Math.max(
        0.1,
        (performance.now() - startedAt) /
          1000
      ),
      mimeType:
        blob.type ||
        "video/webm",
    });
  }

  recorder.ondataavailable =
    (event) => {
      if (event.data?.size > 0) {
        chunks.push(event.data);
      }
    };

  recorder.onerror = () => {
    fail(
      "Ocurrió un error durante la grabación."
    );
  };

  recorder.onstop = () => {
    /*
     * Esperamos un instante para que Firefox entregue
     * el último dataavailable antes de construir el Blob.
     */
    window.setTimeout(
      complete,
      250
    );
  };

  function finish() {
    if (
      stopRequested ||
      settled
    ) {
      return;
    }

    stopRequested = true;

    if (recorder.state === "paused") {
      try {
        recorder.resume();
      } catch {}
    }

    try {
      if (
        recorder.state === "recording"
      ) {
        recorder.requestData();
      }
    } catch {}

    window.setTimeout(() => {
      try {
        if (
          recorder.state === "recording" ||
          recorder.state === "paused"
        ) {
          recorder.stop();
        }
      } catch {
        fail(
          "No se pudo finalizar la grabación."
        );
      }
    }, 120);

    /*
     * Este timeout ya no crea un archivo vacío:
     * solo informa el error si el navegador nunca finaliza.
     */
    stopTimeout =
      window.setTimeout(() => {
        fail(
          "El navegador no pudo finalizar la grabación. Probá con Chrome o Edge actualizado."
        );
      }, 8000);
  }

  displayStream
    .getVideoTracks()[0]
    ?.addEventListener(
      "ended",
      finish,
      { once: true }
    );

  return {
    stream: combinedStream,
    recorder,
    stopped,

    start() {
      if (
        recorder.state !== "inactive"
      ) {
        return;
      }

      startedAt =
        performance.now();

      recorder.start(500);
    },

    pause() {
      if (
        recorder.state === "recording"
      ) {
        recorder.pause();
      }
    },

    resume() {
      if (
        recorder.state === "paused"
      ) {
        recorder.resume();
      }
    },

    stop() {
      finish();
    },

    cleanup() {
      stopAllTracks();
    },
  };
}
