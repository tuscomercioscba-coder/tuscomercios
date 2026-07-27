import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import { VIEW_MODES } from "./constants";
import { formatTime } from "./utils";
import VideoOverlay from "./VideoOverlay";
import {
  buildProjectTimeline,
  projectTimeToClip,
} from "./projectTimeline";
import {
  getMediaById,
} from "./mediaUtils";

import {
  getSceneTransitionStyle,
} from "./motionUtils";

const VideoStage = forwardRef(
  function VideoStage(
    {
      mediaItems = [],
      viewMode,
      currentTime,
      playing,
      clips = [],
      layers = [],
      selectedLayerId = "",
      onSelectLayer,
      onChangeLayer,
      onDeselectLayer,
      onChangeClipMedia,
      snapEnabled,
      showSafeArea,
      showRulers,
      safePreset,
      onTimeUpdate,
      onPlayChange,
      onActiveClipChange,
    },
    ref
  ) {
    const primaryVideoRef = useRef(null);
    const secondaryVideoRef = useRef(null);
    const narrationVideoRef = useRef(null);
    const frameRef = useRef(null);
    const clipStartedAtRef = useRef(0);
    const activeClipIdRef = useRef("");

    const timeline = useMemo(
      () => buildProjectTimeline(clips),
      [clips]
    );

    const totalDuration =
      timeline.length
        ? timeline[
            timeline.length - 1
          ].projectEnd
        : 0;

    const resolved =
      projectTimeToClip(
        clips,
        currentTime
      );

    const activeClip =
      resolved?.clip ||
      timeline[0] ||
      null;

    const primaryMedia =
      activeClip
        ? getMediaById(
            mediaItems,
            activeClip.mediaId
          )
        : null;

    const secondaryMedia =
      activeClip?.secondaryMediaId
        ? getMediaById(
            mediaItems,
            activeClip.secondaryMediaId
          )
        : null;

    const narrationMedia =
      activeClip?.narrationMediaId
        ? getMediaById(
            mediaItems,
            activeClip.narrationMediaId
          )
        : null;

    const isSplit =
      activeClip?.compositionMode ===
        "split-horizontal" ||
      activeClip?.compositionMode ===
        "split-vertical";

    function notifyActiveClip(
      clipId
    ) {
      if (
        !clipId ||
        activeClipIdRef.current ===
          clipId
      ) {
        return;
      }

      activeClipIdRef.current =
        clipId;

      onActiveClipChange?.(
        clipId
      );
    }

    function syncElementTime(
      element,
      time
    ) {
      if (
        !element ||
        element.readyState < 1
      ) {
        return;
      }

      if (
        Math.abs(
          element.currentTime -
            time
        ) > 0.18
      ) {
        try {
          element.currentTime =
            time;
        } catch {}
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        seekProjectTime(time) {
          const next =
            projectTimeToClip(
              clips,
              time
            );

          if (!next) return;

          notifyActiveClip(
            next.clip.id
          );

          onTimeUpdate(
            next.projectTime
          );
        },

        getCurrentProjectTime() {
          return currentTime || 0;
        },
      }),
      [
        clips,
        currentTime,
      ]
    );

    useEffect(() => {
      if (!activeClip) return;

      notifyActiveClip(
        activeClip.id
      );

      const local =
        Math.max(
          0,
          currentTime -
            activeClip.projectStart
        );

      if (
        primaryMedia?.type ===
        "video"
      ) {
        syncElementTime(
          primaryVideoRef.current,
          activeClip.sourceStart +
            local
        );
      }

      if (
        secondaryMedia?.type ===
        "video"
      ) {
        syncElementTime(
          secondaryVideoRef.current,
          local
        );
      }

      if (
        narrationMedia?.type ===
        "video"
      ) {
        syncElementTime(
          narrationVideoRef.current,
          Number(
            activeClip.narrationStart ||
              0
          ) + local
        );
      }
    }, [
      currentTime,
      activeClip?.id,
      primaryMedia?.id,
      secondaryMedia?.id,
      narrationMedia?.id,
    ]);

    useEffect(() => {
      cancelAnimationFrame(
        frameRef.current
      );

      const primaryVideo =
        primaryVideoRef.current;

      const secondaryVideo =
        secondaryVideoRef.current;

      const narrationVideo =
        narrationVideoRef.current;

      if (
        !playing ||
        !activeClip ||
        !primaryMedia
      ) {
        primaryVideo?.pause();
        secondaryVideo?.pause();
        narrationVideo?.pause();
        return;
      }

      notifyActiveClip(
        activeClip.id
      );

      const localStart =
        Math.max(
          0,
          currentTime -
            activeClip.projectStart
        );

      clipStartedAtRef.current =
        performance.now() -
        localStart * 1000;

      if (
        primaryMedia.type ===
          "video" &&
        primaryVideo
      ) {
        syncElementTime(
          primaryVideo,
          activeClip.sourceStart +
            localStart
        );

        primaryVideo.muted = true;

        primaryVideo
          .play()
          .catch(() => {});
      }

      if (
        isSplit &&
        secondaryMedia?.type ===
          "video" &&
        secondaryVideo
      ) {
        syncElementTime(
          secondaryVideo,
          localStart
        );

        secondaryVideo.muted =
          true;

        secondaryVideo
          .play()
          .catch(() => {});
      }

      if (
        narrationMedia?.type ===
          "video" &&
        narrationVideo
      ) {
        syncElementTime(
          narrationVideo,
          Number(
            activeClip.narrationStart ||
              0
          ) + localStart
        );

        narrationVideo.muted =
          false;

        narrationVideo.volume =
          Math.max(
            0,
            Math.min(
              1,
              Number(
                activeClip.narrationVolume ??
                  100
              ) / 100
            )
          );

        narrationVideo
          .play()
          .catch(() => {});
      }

      const sync = () => {
        const localTime =
          Math.max(
            0,
            (performance.now() -
              clipStartedAtRef.current) /
              1000
          );

        const projectNow =
          Math.min(
            activeClip.projectEnd,
            activeClip.projectStart +
              localTime
          );

        onTimeUpdate(
          projectNow
        );

        if (
          localTime >=
          activeClip.duration -
            0.02
        ) {
          primaryVideo?.pause();
          secondaryVideo?.pause();
          narrationVideo?.pause();

          const next =
            timeline[
              activeClip.index + 1
            ];

          if (!next) {
            onTimeUpdate(
              totalDuration
            );

            onPlayChange(false);
            return;
          }

          notifyActiveClip(
            next.id
          );

          onTimeUpdate(
            next.projectStart
          );

          return;
        }

        frameRef.current =
          requestAnimationFrame(
            sync
          );
      };

      frameRef.current =
        requestAnimationFrame(
          sync
        );

      return () => {
        cancelAnimationFrame(
          frameRef.current
        );
      };
    }, [
      playing,
      activeClip?.id,
      primaryMedia?.id,
      secondaryMedia?.id,
      narrationMedia?.id,
      isSplit,
      totalDuration,
    ]);

    if (
      !clips.length ||
      !primaryMedia
    ) {
      return (
        <div className="flex aspect-video w-full items-center justify-center rounded-[2rem] bg-slate-950 p-8 text-center text-white shadow-2xl">
          <div>
            <p className="text-2xl font-black">
              Agregá contenido
            </p>

            <p className="mt-2 font-semibold text-slate-400">
              Usá la Bandeja del Proyecto para agregar fotos, videos o grabaciones.
            </p>
          </div>
        </div>
      );
    }

    const localProgress =
      activeClip.duration > 0
        ? Math.max(
            0,
            Math.min(
              1,
              (currentTime -
                activeClip.projectStart) /
                activeClip.duration
            )
          )
        : 0;

    const containerClass =
      viewMode ===
      VIEW_MODES.VERTICAL
        ? "aspect-[9/16] max-h-[65vh]"
        : "aspect-video w-full";

    const transitionStyle =
      getSceneTransitionStyle(
        activeClip,
        localProgress
      );

    return (
      <div className="space-y-3">
        <div
          className={`relative mx-auto overflow-hidden rounded-[2rem] bg-black shadow-2xl ${containerClass}`}
        >
          <div
            className={`absolute inset-0 ${
              activeClip.compositionMode ===
              "split-horizontal"
                ? "grid grid-rows-2"
                : activeClip.compositionMode ===
                  "split-vertical"
                ? "grid grid-cols-2"
                : "h-full w-full"
            }`}
            style={{
              opacity:
                transitionStyle.opacity,
              transform: `translate(${transitionStyle.translateX}%, ${transitionStyle.translateY}%) scale(${transitionStyle.scale}) rotate(${transitionStyle.rotate}deg)`,
              filter: `blur(${transitionStyle.blur}px)`,
              clipPath:
                transitionStyle.clipRight > 0
                  ? `inset(0 ${transitionStyle.clipRight}% 0 0)`
                  : transitionStyle.clipBottom > 0
                  ? `inset(0 0 ${transitionStyle.clipBottom}% 0)`
                  : "inset(0 0 0 0)",
              transformOrigin:
                "center center",
              willChange:
                "transform, opacity, filter, clip-path",
            }}
          >
            <EditableMediaPane
              media={primaryMedia}
              clip={activeClip}
              progress={localProgress}
              videoRef={primaryVideoRef}
              editable={!isSplit}
              onChange={(changes) =>
                onChangeClipMedia?.(
                  activeClip.id,
                  changes
                )
              }
            />

            {isSplit && (
              <EditableMediaPane
                media={
                  secondaryMedia
                }
                clip={{
                  ...activeClip,
                  start: 0,
                  fit: "cover",
                }}
                progress={localProgress}
                videoRef={
                  secondaryVideoRef
                }
                editable={false}
                onChange={() => {}}
              />
            )}
          </div>

          {transitionStyle.darkOpacity > 0 && (
            <div
              className="pointer-events-none absolute inset-0 z-10 bg-black"
              style={{
                opacity:
                  transitionStyle.darkOpacity,
              }}
            />
          )}

          {transitionStyle.flashOpacity > 0 && (
            <div
              className="pointer-events-none absolute inset-0 z-10 bg-white"
              style={{
                opacity:
                  transitionStyle.flashOpacity,
              }}
            />
          )}

          {transitionStyle.blackFlashOpacity > 0 && (
            <div
              className="pointer-events-none absolute inset-0 z-10 bg-black"
              style={{
                opacity:
                  transitionStyle.blackFlashOpacity,
              }}
            />
          )}

          {narrationMedia?.type ===
            "video" && (
            <video
              ref={
                narrationVideoRef
              }
              src={
                narrationMedia.url
              }
              playsInline
              preload="auto"
              className="hidden"
            />
          )}

          <VideoOverlay
            layers={layers}
            currentTime={
              currentTime
            }
            selectedLayerId={
              selectedLayerId
            }
            onSelect={
              onSelectLayer
            }
            onChange={
              onChangeLayer
            }
            onDeselect={
              onDeselectLayer
            }
            snapEnabled={
              snapEnabled
            }
            showSafeArea={
              showSafeArea
            }
            showRulers={
              showRulers
            }
            safePreset={
              safePreset
            }
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-white">
          <span className="font-black">
            {formatTime(
              currentTime
            )}
          </span>

          <span className="text-sm font-bold text-slate-400">
            {activeClip.name} ·{" "}
            {formatTime(
              totalDuration
            )}
          </span>
        </div>
      </div>
    );
  }
);

function EditableMediaPane({
  media,
  clip,
  progress,
  videoRef,
  editable,
  onChange,
}) {
  const containerRef = useRef(null);

  if (!media) {
    return (
      <div className="flex min-h-0 items-center justify-center bg-slate-900 p-4 text-center text-sm font-black text-slate-400">
        Elegí el segundo contenido
      </div>
    );
  }

  const mediaStyle = {
    position: "absolute",
    left: `${Number(
      clip.mediaX ?? 50
    )}%`,
    top: `${Number(
      clip.mediaY ?? 50
    )}%`,
    width: "100%",
    height: "100%",
    opacity:
      Number(
        clip.mediaOpacity ?? 100
      ) / 100,
    borderRadius: `${Number(
      clip.mediaBorderRadius || 0
    )}px`,
    transform: `translate(-50%, -50%) scale(${Number(
      clip.mediaScale ?? 100
    ) / 100}) rotate(${Number(
      clip.mediaRotation || 0
    )}deg)`,
    transformOrigin:
      "center center",
    overflow: "hidden",
  };

  function startMove(event) {
    if (!editable) return;

    event.preventDefault();
    event.stopPropagation();

    const container =
      containerRef.current;

    if (!container) return;

    const rect =
      container.getBoundingClientRect();

    const startX =
      event.clientX;

    const startY =
      event.clientY;

    const originalX =
      Number(
        clip.mediaX ?? 50
      );

    const originalY =
      Number(
        clip.mediaY ?? 50
      );

    document.body.style.userSelect =
      "none";

    document.body.style.cursor =
      "grabbing";

    const move = (moveEvent) => {
      const deltaX =
        ((moveEvent.clientX -
          startX) /
          rect.width) *
        100;

      const deltaY =
        ((moveEvent.clientY -
          startY) /
          rect.height) *
        100;

      onChange({
        mediaX: Math.max(
          0,
          Math.min(
            100,
            originalX +
              deltaX
          )
        ),
        mediaY: Math.max(
          0,
          Math.min(
            100,
            originalY +
              deltaY
          )
        ),
      });
    };

    const stop = () => {
      document.body.style.userSelect =
        "";

      document.body.style.cursor =
        "";

      window.removeEventListener(
        "pointermove",
        move
      );

      window.removeEventListener(
        "pointerup",
        stop
      );
    };

    window.addEventListener(
      "pointermove",
      move
    );

    window.addEventListener(
      "pointerup",
      stop,
      { once: true }
    );
  }

  function startScale(event) {
    if (!editable) return;

    event.preventDefault();
    event.stopPropagation();

    const startX =
      event.clientX;

    const originalScale =
      Number(
        clip.mediaScale ?? 100
      );

    document.body.style.userSelect =
      "none";

    document.body.style.cursor =
      "nwse-resize";

    const move = (moveEvent) => {
      onChange({
        mediaScale: Math.max(
          20,
          Math.min(
            300,
            originalScale +
              (moveEvent.clientX -
                startX)
          )
        ),
      });
    };

    const stop = () => {
      document.body.style.userSelect =
        "";

      document.body.style.cursor =
        "";

      window.removeEventListener(
        "pointermove",
        move
      );

      window.removeEventListener(
        "pointerup",
        stop
      );
    };

    window.addEventListener(
      "pointermove",
      move
    );

    window.addEventListener(
      "pointerup",
      stop,
      { once: true }
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-0 w-full overflow-hidden bg-black"
    >
      <div
        onPointerDown={
          startMove
        }
        className={
          editable
            ? "cursor-grab active:cursor-grabbing"
            : ""
        }
        style={mediaStyle}
      >
        {clip.fit === "smart" && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden bg-slate-950">
            <img
              src={media.type === "video" ? media.thumbnail || media.url : media.url}
              alt=""
              className="h-full w-full scale-125 object-cover opacity-70 blur-3xl"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}

        {media.type === "video" ? (
          <video
            key={media.id}
            ref={videoRef}
            src={media.url}
            muted
            playsInline
            preload="auto"
            className={`h-full w-full ${
              clip.fit === "contain" || clip.fit === "smart"
                ? "object-contain"
                : "object-cover"
            }`}
          />
        ) : (
          <img
            src={media.url}
            alt=""
            className={`h-full w-full ${
              clip.fit === "contain" || clip.fit === "smart"
                ? "object-contain"
                : "object-cover"
            }`}
            style={{
              transform:
                getPhotoTransform(
                  clip.photoMotion,
                  progress
                ),
            }}
          />
        )}

        {editable && (
          <>
            <span className="pointer-events-none absolute inset-0 border border-dashed border-emerald-400" />

            <button
              type="button"
              aria-label="Cambiar escala"
              onPointerDown={
                startScale
              }
              className="absolute bottom-2 right-2 z-20 h-7 w-7 cursor-nwse-resize rounded-full border-2 border-white bg-emerald-500 shadow"
            />
          </>
        )}
      </div>
    </div>
  );
}

function getPhotoTransform(
  motion,
  progress
) {
  switch (motion) {
    case "zoom-in":
      return `scale(${
        1 + progress * 0.12
      })`;

    case "zoom-out":
      return `scale(${
        1.12 -
        progress * 0.12
      })`;

    case "pan-left":
      return `scale(1.12) translateX(${
        5 - progress * 10
      }%)`;

    case "pan-right":
      return `scale(1.12) translateX(${
        -5 + progress * 10
      }%)`;

    default:
      return "scale(1)";
  }
}

export default VideoStage;
