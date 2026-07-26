import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  drawFramedMedia,
} from "../Engine2";

const WIDTH = 540;
const HEIGHT = 960;

export default function SceneCanvasEditor({
  scene,
  disabled,
  onChange,
}) {
  const canvasRef = useRef(null);
  const mediaRef = useRef(null);
  const animationRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    loadMedia();

    return () => {
      cancelAnimationFrame(animationRef.current);

      if (
        mediaRef.current instanceof HTMLVideoElement
      ) {
        mediaRef.current.pause();
      }
    };
  }, [scene?.media, scene?.mediaType]);

  useEffect(() => {
    draw();
  }, [
    scene?.id,
    scene?.media,
    scene?.mediaFit,
    scene?.mediaZoom,
    scene?.mediaFocalX,
    scene?.mediaFocalY,
    scene?.mediaRotation,
    scene?.title,
    scene?.subtitle,
    scene?.textPosition,
  ]);

  function loadMedia() {
    cancelAnimationFrame(animationRef.current);

    if (!scene?.media) {
      mediaRef.current = null;
      draw();
      return;
    }

    if (scene.mediaType === "video") {
      const video = document.createElement("video");

      video.src = scene.media;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";

      video.onloadeddata = () => {
        mediaRef.current = video;
        video.play().catch(() => {});
        animate();
      };

      video.load();
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      mediaRef.current = image;
      draw();
    };

    image.src = scene.media;
  }

  function animate() {
    draw();
    animationRef.current =
      requestAnimationFrame(animate);
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", {
      alpha: false,
    });

    context.fillStyle = "#020617";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    const media = mediaRef.current;

    if (media) {
      context.save();

      context.translate(WIDTH / 2, HEIGHT / 2);
      context.rotate(
        (Number(scene?.mediaRotation || 0) *
          Math.PI) /
          180
      );
      context.translate(-WIDTH / 2, -HEIGHT / 2);

      drawFramedMedia({
        context,
        media,
        scene,
        x: 0,
        y: 0,
        width: WIDTH,
        height: HEIGHT,
      });

      context.restore();
    } else {
      context.fillStyle = "#64748b";
      context.font = "700 36px Arial";
      context.textAlign = "center";
      context.fillText(
        "Subí una foto o un video",
        WIDTH / 2,
        HEIGHT / 2
      );
    }

    drawOverlays(context);
  }

  function drawOverlays(context) {
    const topGradient =
      context.createLinearGradient(
        0,
        0,
        0,
        260
      );

    topGradient.addColorStop(
      0,
      "rgba(0,0,0,.62)"
    );

    topGradient.addColorStop(
      1,
      "rgba(0,0,0,0)"
    );

    context.fillStyle = topGradient;
    context.fillRect(0, 0, WIDTH, 270);

    const bottomGradient =
      context.createLinearGradient(
        0,
        HEIGHT - 360,
        0,
        HEIGHT
      );

    bottomGradient.addColorStop(
      0,
      "rgba(0,0,0,0)"
    );

    bottomGradient.addColorStop(
      1,
      "rgba(0,0,0,.78)"
    );

    context.fillStyle = bottomGradient;
    context.fillRect(
      0,
      HEIGHT - 380,
      WIDTH,
      380
    );

    const position =
      scene?.textPosition === "top"
        ? 180
        : scene?.textPosition === "center"
        ? HEIGHT / 2
        : HEIGHT - 220;

    context.textAlign = "center";
    context.fillStyle = "#ffffff";
    context.shadowColor =
      "rgba(0,0,0,.85)";
    context.shadowBlur = 14;
    context.font =
      "900 48px Arial";

    wrapText(
      context,
      scene?.title || "Título de la escena",
      WIDTH / 2,
      position,
      WIDTH - 90,
      56
    );

    if (scene?.subtitle) {
      context.font =
        "700 27px Arial";

      wrapText(
        context,
        scene.subtitle,
        WIDTH / 2,
        position + 118,
        WIDTH - 110,
        36
      );
    }

    context.shadowBlur = 0;

    context.strokeStyle =
      "rgba(251,191,36,.9)";
    context.lineWidth = 2;
    context.setLineDash([12, 9]);

    context.strokeRect(
      32,
      32,
      WIDTH - 64,
      HEIGHT - 64
    );

    context.setLineDash([]);

    const focalX =
      (Number(scene?.mediaFocalX ?? 50) /
        100) *
      WIDTH;

    const focalY =
      (Number(scene?.mediaFocalY ?? 50) /
        100) *
      HEIGHT;

    context.fillStyle = "#2563eb";
    context.strokeStyle = "#ffffff";
    context.lineWidth = 5;

    context.beginPath();
    context.arc(
      focalX,
      focalY,
      19,
      0,
      Math.PI * 2
    );

    context.fill();
    context.stroke();
  }

  function pointerPosition(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: Math.max(
        0,
        Math.min(
          100,
          ((event.clientX - rect.left) /
            rect.width) *
            100
        )
      ),
      y: Math.max(
        0,
        Math.min(
          100,
          ((event.clientY - rect.top) /
            rect.height) *
            100
        )
      ),
    };
  }

  function updateFocal(event) {
    if (disabled) return;

    const point = pointerPosition(event);

    onChange({
      mediaFocalX: point.x,
      mediaFocalY: point.y,
    });
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className={`mx-auto block aspect-[9/16] w-full max-w-[270px] rounded-[1.7rem] bg-slate-950 shadow-2xl ring-1 ring-black/10 ${
          dragging
            ? "cursor-grabbing"
            : "cursor-grab"
        }`}
        style={{
          touchAction: "none",
        }}
        onPointerDown={(event) => {
          if (disabled || !scene?.media) return;

          setDragging(true);
          event.currentTarget.setPointerCapture?.(
            event.pointerId
          );
          updateFocal(event);
        }}
        onPointerMove={(event) => {
          if (dragging) {
            updateFocal(event);
          }
        }}
        onPointerUp={(event) => {
          setDragging(false);
          event.currentTarget.releasePointerCapture?.(
            event.pointerId
          );
        }}
        onPointerCancel={() =>
          setDragging(false)
        }
      />

      <p className="mt-3 text-center text-xs font-bold text-slate-500">
        Este lienzo usa el mismo motor que la vista previa y la descarga.
      </p>
    </div>
  );
}

function wrapText(
  context,
  text,
  x,
  y,
  maxWidth,
  lineHeight
) {
  const words = String(text || "")
    .split(/\s+/)
    .filter(Boolean);

  const lines = [];
  let current = "";

  words.forEach((word) => {
    const test = current
      ? `${current} ${word}`
      : word;

    if (
      context.measureText(test).width >
        maxWidth &&
      current
    ) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });

  if (current) lines.push(current);

  lines.slice(0, 4).forEach(
    (line, index) => {
      context.fillText(
        line,
        x,
        y + index * lineHeight
      );
    }
  );
}
