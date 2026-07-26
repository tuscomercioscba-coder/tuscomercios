import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function VoiceAudioPanel({
  track,
  projectDuration,
  disabled,
  onUpload,
  onUseRecording,
  onChange,
  onRemove,
}) {
  const inputRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const [recording, setRecording] =
    useState(false);

  const [seconds, setSeconds] =
    useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      window.clearInterval(
        timerRef.current
      );

      streamRef.current
        ?.getTracks()
        .forEach((item) =>
          item.stop()
        );
    };
  }, []);

  async function startRecording() {
    if (disabled || recording) {
      return;
    }

    if (
      !navigator.mediaDevices
        ?.getUserMedia
    ) {
      alert(
        "El navegador no permite grabar audio."
      );
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      streamRef.current =
        stream;

      const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ];

      const mimeType =
        candidates.find((type) =>
          MediaRecorder.isTypeSupported(
            type
          )
        ) || "";

      const recorder =
        new MediaRecorder(
          stream,
          mimeType
            ? { mimeType }
            : undefined
        );

      recorderRef.current =
        recorder;

      chunksRef.current = [];

      recorder.ondataavailable =
        (event) => {
          if (event.data?.size) {
            chunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onstop = () => {
        const blob =
          new Blob(
            chunksRef.current,
            {
              type:
                recorder.mimeType ||
                "audio/webm",
            }
          );

        if (blob.size) {
          onUseRecording?.(
            blob,
            `narracion-${Date.now()}.webm`
          );
        }

        stream
          .getTracks()
          .forEach((item) =>
            item.stop()
          );

        streamRef.current =
          null;
      };

      recorder.start(250);
      setSeconds(0);
      setRecording(true);

      timerRef.current =
        window.setInterval(
          () =>
            setSeconds(
              (value) =>
                value + 1
            ),
          1000
        );
    } catch (error) {
      console.error(error);

      alert(
        "No se pudo acceder al micrófono."
      );
    }
  }

  function stopRecording() {
    window.clearInterval(
      timerRef.current
    );

    if (
      recorderRef.current?.state ===
      "recording"
    ) {
      recorderRef.current.stop();
    }

    setRecording(false);
  }

  return (
    <section className="rounded-[2rem] border border-cyan-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
        Audio Pro
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Voz y narración
      </h3>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        Grabá tu voz o subí un audio. Puede sonar junto con la música del Reel.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
        onChange={onUpload}
        className="hidden"
      />

      {!track ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={
              disabled || recording
            }
            onClick={() =>
              inputRef.current?.click()
            }
            className="min-h-14 rounded-2xl bg-cyan-50 px-3 font-black text-cyan-800 disabled:opacity-40"
          >
            Subir voz
          </button>

          {!recording ? (
            <button
              type="button"
              disabled={disabled}
              onClick={startRecording}
              className="min-h-14 rounded-2xl bg-red-600 px-3 font-black text-white disabled:opacity-40"
            >
              🎙 Grabar voz
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="min-h-14 rounded-2xl bg-slate-950 px-3 font-black text-white"
            >
              ■ Finalizar {seconds}s
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <audio
            src={track.url}
            controls
            className="w-full"
          />

          <p className="truncate text-xs font-black text-slate-500">
            {track.name}
          </p>

          <Range
            label="Volumen"
            min={0}
            max={100}
            step={1}
            value={track.volume}
            suffix="%"
            onChange={(value) =>
              onChange({
                volume: value,
              })
            }
          />

          <Range
            label="Comienza en el Reel"
            min={0}
            max={Math.max(
              0,
              projectDuration - 0.1
            )}
            step={0.1}
            value={track.start}
            suffix="s"
            onChange={(value) =>
              onChange({
                start: Math.min(
                  value,
                  track.end - 0.1
                ),
              })
            }
          />

          <Range
            label="Termina en el Reel"
            min={track.start + 0.1}
            max={projectDuration}
            step={0.1}
            value={track.end}
            suffix="s"
            onChange={(value) =>
              onChange({
                end: Math.max(
                  value,
                  track.start + 0.1
                ),
              })
            }
          />

          <Range
            label="Comenzar desde el audio"
            min={0}
            max={Math.max(
              0,
              Number(
                track.sourceDuration ||
                  0
              ) - 0.1
            )}
            step={0.1}
            value={Number(
              track.sourceStart || 0
            )}
            suffix="s"
            onChange={(value) =>
              onChange({
                sourceStart: value,
              })
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <Range
              label="Entrada"
              min={0}
              max={5}
              step={0.1}
              value={track.fadeIn}
              suffix="s"
              onChange={(value) =>
                onChange({
                  fadeIn: value,
                })
              }
            />

            <Range
              label="Salida"
              min={0}
              max={5}
              step={0.1}
              value={track.fadeOut}
              suffix="s"
              onChange={(value) =>
                onChange({
                  fadeOut: value,
                })
              }
            />
          </div>

          <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
            <span className="font-black text-slate-700">
              Silenciar voz
            </span>

            <input
              type="checkbox"
              checked={Boolean(
                track.muted
              )}
              onChange={(event) =>
                onChange({
                  muted:
                    event.target.checked,
                })
              }
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
              className="min-h-12 rounded-xl bg-cyan-50 font-black text-cyan-800"
            >
              Reemplazar
            </button>

            <button
              type="button"
              onClick={onRemove}
              className="min-h-12 rounded-xl bg-red-50 font-black text-red-600"
            >
              Quitar voz
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Range({
  label,
  min,
  max,
  step,
  value,
  suffix,
  onChange,
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-700">
          {label}
        </span>

        <span className="text-xs font-black text-cyan-700">
          {Number(value).toFixed(
            step < 1 ? 1 : 0
          )}
          {suffix}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={Math.max(min, max)}
        step={step}
        value={Math.min(
          Math.max(value, min),
          Math.max(min, max)
        )}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="mt-3 w-full accent-cyan-600"
      />
    </label>
  );
}
