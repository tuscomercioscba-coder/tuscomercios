import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  drawFramedMedia,
} from "./Engine2";

import {
  sceneTimeToSourceTime,
} from "./V8Cut";

import {
  getActiveSubtitle,
} from "./V9Timeline";

import {
  getCameraStyle,
  getTextAnimation,
} from "./cameraController";
import {
  getSceneTransition,
  applyTransitionToContext,
  drawTransitionFlash,
} from "./reelTransitions";
import {
  getReelDuration,
  getTimelineState,
} from "./reelTimeline";
import {
  getFontFamily,
  getReelStyle,
  REEL_FORMAT,
} from "./reelPresets";

const WIDTH = REEL_FORMAT.width;
const HEIGHT = REEL_FORMAT.height;

const ReelPlayer = forwardRef(function ReelPlayer({
  scenes = [],
  model = "cinematic",
  business = null,
  currentTime = 0,
  isPlaying = false,
  muted = true,
  onTimeUpdate,
  onEnded,
  previewWidth = 390,
  showControls = true,
}, ref) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const currentTimeRef = useRef(Number(currentTime) || 0);
  const lastParentUpdateRef = useRef(0);

  const imageCacheRef = useRef(new Map());
  const videoCacheRef = useRef(new Map());
  const assetReadyPromiseRef = useRef(Promise.resolve());
  const assetReadyResolveRef = useRef(null);

  const [displayTime, setDisplayTime] = useState(Number(currentTime) || 0);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetVersion, setAssetVersion] = useState(0);

  const totalDuration = useMemo(
    () => getReelDuration(scenes),
    [scenes]
  );

  useImperativeHandle(
    ref,
    () => ({
      getCanvas() {
        return canvasRef.current;
      },

      renderFrameAt(time = 0) {
        const safeTime = clampNumber(time, 0, totalDuration);
        currentTimeRef.current = safeTime;
        drawCurrentFrame(safeTime);
        return safeTime;
      },

      async renderFrameAtAsync(time = 0) {
        const safeTime = clampNumber(time, 0, totalDuration);

        await waitForAssetsReady();
        await prepareVideoFrameAt(safeTime);

        currentTimeRef.current = safeTime;
        drawCurrentFrame(safeTime);

        return safeTime;
      },

      async waitUntilReady() {
        await waitForAssetsReady();
        return true;
      },

      getDuration() {
        return totalDuration;
      },
    }),
    [totalDuration, scenes, model, business, assetVersion]
  );

  useEffect(() => {
    const safeTime = clampNumber(currentTime, 0, totalDuration);

    currentTimeRef.current = safeTime;
    setDisplayTime(safeTime);

    if (!isPlaying) {
      drawCurrentFrame(safeTime);
    }
  }, [currentTime, totalDuration, isPlaying]);

  useEffect(() => {
    prepareAssets();
  }, [scenes, business, muted]);

  useEffect(() => {
    drawCurrentFrame(currentTimeRef.current);
  }, [scenes, model, business, assetVersion]);

  useEffect(() => {
    if (!isPlaying) {
      stopAnimation();
      lastTimestampRef.current = null;
      pauseAllVideos();
      return;
    }

    startAnimation();

    return () => {
      stopAnimation();
      pauseAllVideos();
    };
  }, [isPlaying, totalDuration, scenes, model, business]);

  useEffect(() => {
    return () => {
      stopAnimation();
      pauseAllVideos();
    };
  }, []);

  async function prepareAssets() {
    setLoadingAssets(true);

    assetReadyPromiseRef.current = new Promise((resolve) => {
      assetReadyResolveRef.current = resolve;
    });

    const mediaList = scenes
      .map((scene) => ({
        src: scene?.media,
        type: scene?.mediaType || "image",
      }))
      .filter((item) => item.src);

    const logo =
      business?.logo ||
      business?.image ||
      "";

    if (logo) {
      mediaList.push({
        src: logo,
        type: "image",
      });
    }

    const uniqueAssets = [];
    const seen = new Set();

    mediaList.forEach((item) => {
      const key = `${item.type}:${item.src}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueAssets.push(item);
      }
    });

    await Promise.all(
      uniqueAssets.map((item) =>
        item.type === "video"
          ? loadVideo(item.src)
          : loadImage(item.src)
      )
    );

    setAssetVersion((version) => version + 1);
    setLoadingAssets(false);

    assetReadyResolveRef.current?.();
    assetReadyResolveRef.current = null;
  }

  async function waitForAssetsReady() {
    await Promise.race([
      assetReadyPromiseRef.current,
      new Promise((resolve) => setTimeout(resolve, 8000)),
    ]);
  }

  async function prepareVideoFrameAt(time) {
    const timelineState = getTimelineState(
      scenes,
      time
    );

    const scene = timelineState.currentScene;

    if (
      !scene ||
      scene.mediaType !== "video" ||
      !scene.media
    ) {
      return;
    }

    const video = videoCacheRef.current.get(
      scene.media
    );

    if (!video) return;

    await seekVideoToSceneTime(
      video,
      scene,
      timelineState.sceneProgress
    );
  }

  async function seekVideoToSceneTime(
    video,
    scene,
    progress
  ) {
    if (
      !video ||
      !Number.isFinite(video.duration) ||
      video.duration <= 0
    ) {
      return;
    }

    const targetTime = Math.min(
      Math.max(0, sceneTimeToSourceTime({ ...scene, sourceDuration: scene.sourceDuration || video.duration }, progress)),
      Math.max(0, video.duration - 0.04)
    );

    if (
      Math.abs(video.currentTime - targetTime) <
        0.035 &&
      video.readyState >= 2
    ) {
      return;
    }

    await new Promise((resolve) => {
      let finished = false;

      const done = () => {
        if (finished) return;
        finished = true;

        video.removeEventListener(
          "seeked",
          done
        );

        video.removeEventListener(
          "loadeddata",
          done
        );

        resolve();
      };

      video.addEventListener(
        "seeked",
        done,
        { once: true }
      );

      video.addEventListener(
        "loadeddata",
        done,
        { once: true }
      );

      try {
        video.currentTime = targetTime;
      } catch {
        done();
        return;
      }

      setTimeout(done, 350);
    });
  }

  function loadImage(src) {
    if (!src) return Promise.resolve(null);

    if (imageCacheRef.current.has(src)) {
      return Promise.resolve(imageCacheRef.current.get(src));
    }

    return new Promise((resolve) => {
      const image = new Image();

      image.crossOrigin = "anonymous";
      image.decoding = "async";

      image.onload = () => {
        imageCacheRef.current.set(src, image);
        resolve(image);
      };

      image.onerror = () => {
        imageCacheRef.current.set(src, null);
        resolve(null);
      };

      image.src = src;
    });
  }

  function loadVideo(src) {
    if (!src) return Promise.resolve(null);

    if (videoCacheRef.current.has(src)) {
      return Promise.resolve(
        videoCacheRef.current.get(src)
      );
    }

    return new Promise((resolve) => {
      const video =
        document.createElement("video");

      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;

        video.onloadeddata = null;
        video.oncanplay = null;
        video.onloadedmetadata = null;

        videoCacheRef.current.set(src, video);
        resolve(video);
      };

      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.loop = false;
      video.src = src;

      video.onloadedmetadata = finish;
      video.onloadeddata = finish;
      video.oncanplay = finish;

      video.onerror = () => {
        if (finished) return;
        finished = true;

        videoCacheRef.current.set(
          src,
          null
        );

        resolve(null);
      };

      video.load();

      setTimeout(finish, 5000);
    });
  }

  function startAnimation() {
    stopAnimation();
    lastTimestampRef.current = null;

    const animate = (timestamp) => {
      if (!isPlaying) return;

      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const rawDelta =
        (timestamp - lastTimestampRef.current) / 1000;

      const deltaSeconds = Math.min(
        0.25,
        Math.max(0, rawDelta)
      );

      lastTimestampRef.current = timestamp;

      let nextTime = currentTimeRef.current + deltaSeconds;

      if (nextTime >= totalDuration) {
        nextTime = totalDuration;
      }

      currentTimeRef.current = nextTime;

      drawCurrentFrame(nextTime);

      if (timestamp - lastParentUpdateRef.current >= 100) {
        lastParentUpdateRef.current = timestamp;
        setDisplayTime(nextTime);

        if (typeof onTimeUpdate === "function") {
          onTimeUpdate(nextTime);
        }
      }

      if (nextTime >= totalDuration) {
        setDisplayTime(totalDuration);

        if (typeof onTimeUpdate === "function") {
          onTimeUpdate(totalDuration);
        }

        if (typeof onEnded === "function") {
          onEnded();
        }

        stopAnimation();
        pauseAllVideos();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }

  function pauseAllVideos() {
    videoCacheRef.current.forEach((video) => {
      if (video && !video.paused) {
        video.pause();
      }
    });
  }

  function drawCurrentFrame(time) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });

    if (!context) return;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalAlpha = 1;
    context.filter = "none";
    context.clearRect(0, 0, WIDTH, HEIGHT);

    const timelineState = getTimelineState(
      scenes,
      time
    );

    if (!timelineState.currentScene) {
      drawEmptyState(context);
      return;
    }

    drawScene(
      context,
      timelineState.currentScene,
      timelineState.sceneProgress,
      timelineState.reelProgress
    );
  }

  function drawScene(
    context,
    scene,
    sceneProgress,
    reelProgress
  ) {
    const style = getReelStyle(model);

    drawCanvasBackground(context, style);

    const transitionState = getSceneTransition({
      transition:
        scene.transition ||
        style.defaultTransition,
      sceneProgress,
      transitionDuration:
        style.transitionDuration,
      sceneDuration: scene.duration,
    });

    context.save();

    applyTransitionToContext(
      context,
      transitionState,
      WIDTH,
      HEIGHT
    );

    drawSceneMediaAsset(
      context,
      scene,
      sceneProgress,
      style
    );

    context.restore();

    drawSceneOverlay(context, scene, style);
    drawDecorations(context, style, sceneProgress);
    drawSceneText(context, scene, style, sceneProgress);
    drawBranding(context, scene, style);
    drawProgressBar(context, reelProgress, style);

    drawTransitionFlash(
      context,
      transitionState,
      WIDTH,
      HEIGHT
    );
  }

  function drawCanvasBackground(context, style) {
    context.fillStyle =
      style.canvasBackground || "#020617";

    context.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function drawSceneMediaAsset(
    context,
    scene,
    progress,
    style
  ) {
    const media = scene?.media;

    if (!media) {
      drawFallbackBackground(context, style);
      return;
    }

    if (scene.mediaType === "video") {
      const video = videoCacheRef.current.get(media);

      if (!video) {
        drawFallbackBackground(context, style);
        return;
      }

      syncVideoTime(video, scene, progress);

      if (isPlaying && video.paused) {
        video.play().catch(() => {});
      } else if (!isPlaying && !video.paused) {
        video.pause();
      }

      drawMediaWithCamera(
        context,
        video,
        scene,
        progress,
        style
      );

      return;
    }

    const image = imageCacheRef.current.get(media);

    if (!image) {
      drawFallbackBackground(context, style);
      return;
    }

    drawMediaWithCamera(
      context,
      image,
      scene,
      progress,
      style
    );
  }

  function syncVideoTime(video, scene, progress) {
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }

    const sceneDuration = Number(scene.duration) || 3;
    const sceneTime = progress * sceneDuration;
    const targetTime = sceneTime % video.duration;

    if (Math.abs(video.currentTime - targetTime) > 0.18) {
      try {
        video.currentTime = targetTime;
      } catch {
        // Algunos navegadores bloquean el seek mientras termina de cargar.
      }
    }
  }

  function drawMediaWithCamera(
    context,
    media,
    scene,
    progress,
    style
  ) {
    const camera = getCameraStyle({
      movement:
        scene.camera ||
        scene.cameraMovement ||
        style.defaultCamera,
      progress,
      intensity:
        scene.cameraIntensity ?? 1,
      easing:
        scene.cameraEasing || "cinematic",
      seed:
        scene.cameraSeed ?? 0,
    });

    context.save();

    const brightness = style.imageBrightness ?? 1;
    const contrast = style.imageContrast ?? 1;
    const saturation = style.imageSaturation ?? 1;

    context.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;

    context.translate(
      WIDTH / 2 + camera.x,
      HEIGHT / 2 + camera.y
    );

    context.rotate(
      (camera.rotation * Math.PI) / 180
    );

    context.scale(
      camera.scale,
      camera.scale
    );

    context.translate(
      -WIDTH / 2,
      -HEIGHT / 2
    );

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
  }


  function drawFallbackBackground(context, style) {
    const gradient = context.createLinearGradient(
      0,
      0,
      WIDTH,
      HEIGHT
    );

    if (model === "commercial") {
      gradient.addColorStop(0, "#7f1d1d");
      gradient.addColorStop(0.5, "#dc2626");
      gradient.addColorStop(1, "#f97316");
    } else if (model === "minimal") {
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(0.5, "#334155");
      gradient.addColorStop(1, "#64748b");
    } else {
      gradient.addColorStop(0, "#020617");
      gradient.addColorStop(0.5, "#172554");
      gradient.addColorStop(1, "#312e81");
    }

    context.fillStyle = gradient;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.save();
    context.globalAlpha = 0.2;
    context.fillStyle = style.accentColor;

    context.beginPath();
    context.arc(
      WIDTH - 120,
      260,
      420,
      0,
      Math.PI * 2
    );
    context.fill();

    context.beginPath();
    context.arc(
      100,
      HEIGHT - 260,
      480,
      0,
      Math.PI * 2
    );
    context.fill();

    context.restore();
  }

  function drawSceneOverlay(context, scene, style) {
    const opacity =
      scene.overlayOpacity ??
      style.overlayOpacity ??
      0.5;

    const gradient = context.createLinearGradient(
      0,
      0,
      0,
      HEIGHT
    );

    gradient.addColorStop(
      0,
      `rgba(2,6,23,${opacity * 0.08})`
    );

    gradient.addColorStop(
      0.52,
      `rgba(2,6,23,${opacity * 0.28})`
    );

    gradient.addColorStop(
      1,
      `rgba(2,6,23,${opacity})`
    );

    context.fillStyle = gradient;
    context.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function drawDecorations(
    context,
    style,
    progress
  ) {
    if (model === "commercial") {
      drawCommercialDecorations(
        context,
        style,
        progress
      );
      return;
    }

    if (model === "minimal") {
      drawMinimalDecorations(context, style);
      return;
    }

    drawCinematicDecorations(
      context,
      style,
      progress
    );
  }

  function drawCinematicDecorations(
    context,
    style,
    progress
  ) {
    const lineWidth = 180 + 80 * progress;

    context.save();

    context.fillStyle = style.accentColor;
    context.globalAlpha = 0.95;

    drawRoundedRect(
      context,
      72,
      1270,
      lineWidth,
      10,
      5
    );

    context.fill();

    context.globalAlpha = 0.2;
    context.strokeStyle = style.accentColor;
    context.lineWidth = 2;

    drawRoundedRect(
      context,
      44,
      44,
      WIDTH - 88,
      HEIGHT - 88,
      38
    );

    context.stroke();
    context.restore();
  }

  function drawCommercialDecorations(
    context,
    style,
    progress
  ) {
    context.save();

    context.translate(WIDTH / 2, HEIGHT / 2);
    context.rotate((-10 * Math.PI) / 180);
    context.globalAlpha = 0.82 + progress * 0.1;
    context.fillStyle = style.accentColor;

    drawRoundedRect(
      context,
      -700,
      390,
      650,
      72,
      36
    );
    context.fill();

    context.fillStyle = "rgba(255,255,255,.24)";

    drawRoundedRect(
      context,
      150,
      -500,
      760,
      74,
      37
    );
    context.fill();

    context.restore();
  }

  function drawMinimalDecorations(context, style) {
    context.save();

    context.strokeStyle = "rgba(255,255,255,.32)";
    context.lineWidth = 2;

    drawRoundedRect(
      context,
      58,
      58,
      WIDTH - 116,
      HEIGHT - 116,
      46
    );
    context.stroke();

    context.fillStyle = style.accentColor;

    drawRoundedRect(
      context,
      WIDTH / 2 - 50,
      116,
      100,
      8,
      4
    );
    context.fill();

    context.restore();
  }

  function drawSceneText(
    context,
    scene,
    style,
    sceneProgress
  ) {
    const title = String(scene.title || "").trim();
    const timedSubtitle = getActiveSubtitle(scene, sceneProgress);
    const subtitle = String(timedSubtitle?.text || scene.subtitle || "").trim();

    if (!title && !subtitle) return;

    const titleAnimation = getTextAnimation({
      type: model === "commercial" ? "zoom" : "rise",
      progress: Math.min(sceneProgress * 2.6, 1),
      delay: 0.03,
    });

    const subtitleAnimation = getTextAnimation({
      type: model === "minimal" ? "fade" : "rise",
      progress: Math.min(sceneProgress * 2.2, 1),
      delay: 0.12,
    });

    const textBox = getTextBox(scene);

    context.save();

    context.translate(
      titleAnimation.x,
      titleAnimation.y
    );

    context.scale(
      titleAnimation.scale,
      titleAnimation.scale
    );

    context.globalAlpha = titleAnimation.opacity;
    context.textAlign = scene.textAlign || style.textAlign;
    context.textBaseline = "top";
    context.fillStyle = scene.titleColor || style.titleColor;
    context.shadowColor = "rgba(0,0,0,.55)";
    context.shadowBlur = model === "minimal" ? 16 : 28;

    const titleSize =
      Number(scene.titleSize) ||
      style.titleSize;

    context.font = `${
      style.titleWeight || 900
    } ${titleSize}px ${getFontFamily(
      scene.titleFont ||
      style.titleFont
    )}`;

    const titleLines = getWrappedLines(
      context,
      applyTextTransform(
        title,
        style.titleTransform
      ),
      textBox.maxWidth,
      model === "commercial" ? 3 : 4
    );

    titleLines.forEach((line, index) => {
      context.fillText(
        line,
        textBox.x,
        textBox.y +
          index *
            titleSize *
            (model === "commercial" ? 0.86 : 0.98)
      );
    });

    context.restore();

    if (!subtitle) return;

    const titleBlockHeight =
      titleLines.length *
      titleSize *
      (model === "commercial" ? 0.86 : 0.98);

    context.save();

    context.translate(
      subtitleAnimation.x,
      subtitleAnimation.y
    );

    context.scale(
      subtitleAnimation.scale,
      subtitleAnimation.scale
    );

    context.globalAlpha = subtitleAnimation.opacity;
    context.textAlign = scene.textAlign || style.textAlign;
    context.textBaseline = "top";
    context.fillStyle = scene.subtitleColor || style.subtitleColor;
    context.shadowColor = "rgba(0,0,0,.45)";
    context.shadowBlur = 18;

    const subtitleSize =
      Number(scene.subtitleSize) ||
      style.subtitleSize;

    context.font = `${
      style.subtitleWeight || 600
    } ${subtitleSize}px ${getFontFamily(
      scene.subtitleFont ||
      style.subtitleFont
    )}`;

    const subtitleY =
      textBox.y +
      titleBlockHeight +
      34;

    const subtitleText =
      scene.subtitleStyle === "word-reveal"
        ? getVisibleWords(subtitle, sceneProgress)
        : subtitle;

    const subtitleLines = getWrappedLines(
      context,
      subtitleText,
      textBox.maxWidth,
      4
    );

    subtitleLines.forEach((line, index) => {
      context.fillText(
        line,
        textBox.x,
        subtitleY +
          index *
            subtitleSize *
            1.2
      );
    });

    context.restore();
  }

  function getVisibleWords(text, progress) {
    const words = String(text || "")
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) return "";

    const visibleCount = Math.max(
      1,
      Math.ceil(words.length * Math.min(1, progress * 1.75))
    );

    return words.slice(0, visibleCount).join(" ");
  }

  function getTextBox(scene) {
    const align = scene.textAlign || "left";
    const position = scene.textPosition || "bottom";

    let x = 84;
    let y = 1260;
    let maxWidth = 900;

    if (position === "top") y = 230;
    if (position === "center") y = 720;
    if (position === "bottom") y = 1260;

    if (align === "center") {
      x = WIDTH / 2;
      maxWidth = 880;
    }

    if (align === "right") {
      x = WIDTH - 84;
      maxWidth = 870;
    }

    if (scene.isEndScene) {
      x = WIDTH / 2;
      y = 760;
      maxWidth = 860;
    }

    return {
      x,
      y,
      maxWidth,
    };
  }

  function drawBranding(context, scene, style) {
    const businessName = business?.negocio || "";
    const location = business?.ciudad || "";

    const logoSrc =
      business?.logo ||
      business?.image ||
      "";

    const logo = imageCacheRef.current.get(logoSrc);

    if (scene.isEndScene) {
      drawEndSceneBranding(
        context,
        logo,
        location,
        style
      );
      return;
    }

    context.save();

    const topY = 72;

    if (logo) {
      context.save();

      drawRoundedRect(
        context,
        72,
        topY,
        82,
        82,
        24
      );

      context.clip();

      drawCoverMedia(
        context,
        logo,
        72,
        topY,
        82,
        82
      );

      context.restore();
    }

    context.fillStyle = "#ffffff";
    context.textBaseline = "top";
    context.textAlign = "left";
    context.shadowColor = "rgba(0,0,0,.45)";
    context.shadowBlur = 14;
    context.font = "900 28px Inter, Arial, sans-serif";

    context.fillText(
      businessName ||
        "TusComercios Studio",
      logo ? 174 : 72,
      topY + 8
    );

    context.fillStyle = "rgba(255,255,255,.80)";
    context.font = "700 20px Inter, Arial, sans-serif";

    context.fillText(
      location ||
        "Contenido profesional",
      logo ? 174 : 72,
      topY + 49
    );

    context.restore();
  }

  function drawEndSceneBranding(
    context,
    logo,
    location,
    style
  ) {
    context.save();

    context.textAlign = "center";
    context.textBaseline = "top";

    if (logo) {
      context.save();

      drawRoundedRect(
        context,
        WIDTH / 2 - 110,
        470,
        220,
        220,
        56
      );

      context.clip();

      drawCoverMedia(
        context,
        logo,
        WIDTH / 2 - 110,
        470,
        220,
        220
      );

      context.restore();
    }

    context.fillStyle = style.accentColor;

    drawRoundedRect(
      context,
      WIDTH / 2 - 110,
      1280,
      220,
      10,
      5
    );
    context.fill();

    context.fillStyle = "#ffffff";
    context.font = "900 28px Inter, Arial, sans-serif";

    context.fillText(
      "TusComercios Studio",
      WIDTH / 2,
      1560
    );

    context.fillStyle = "rgba(255,255,255,.72)";
    context.font = "700 21px Inter, Arial, sans-serif";

    context.fillText(
      location || "Argentina",
      WIDTH / 2,
      1602
    );

    context.restore();
  }

  function drawProgressBar(context, progress, style) {
    const x = 72;
    const y = HEIGHT - 72;
    const width = WIDTH - 144;
    const height = 9;

    context.save();

    context.fillStyle = "rgba(255,255,255,.24)";

    drawRoundedRect(
      context,
      x,
      y,
      width,
      height,
      height / 2
    );
    context.fill();

    context.fillStyle = style.accentColor || "#ffffff";

    drawRoundedRect(
      context,
      x,
      y,
      width *
        Math.max(
          0.01,
          Math.min(1, progress)
        ),
      height,
      height / 2
    );
    context.fill();

    context.restore();
  }

  function drawEmptyState(context) {
    const gradient = context.createLinearGradient(
      0,
      0,
      WIDTH,
      HEIGHT
    );

    gradient.addColorStop(0, "#020617");
    gradient.addColorStop(0.5, "#1e3a8a");
    gradient.addColorStop(1, "#312e81");

    context.fillStyle = gradient;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "900 76px Inter, Arial, sans-serif";

    context.fillText(
      "TusComercios Studio",
      WIDTH / 2,
      HEIGHT / 2 - 80
    );

    context.fillStyle = "rgba(255,255,255,.72)";
    context.font = "700 34px Inter, Arial, sans-serif";

    context.fillText(
      "Agregá una escena para comenzar",
      WIDTH / 2,
      HEIGHT / 2 + 30
    );
  }

  function getWrappedLines(
    context,
    text,
    maxWidth,
    maxLines = 4
  ) {
    const words = String(text || "")
      .split(/\s+/)
      .filter(Boolean);

    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine =
        currentLine
          ? `${currentLine} ${word}`
          : word;

      const testWidth = context.measureText(testLine).width;

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.slice(0, maxLines);
  }

  function applyTextTransform(text, transform) {
    if (transform === "uppercase") {
      return String(text || "").toUpperCase();
    }

    if (transform === "lowercase") {
      return String(text || "").toLowerCase();
    }

    return String(text || "");
  }

  function drawRoundedRect(
    context,
    x,
    y,
    width,
    height,
    radius
  ) {
    const safeRadius = Math.min(
      radius,
      width / 2,
      height / 2
    );

    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.lineTo(x + width - safeRadius, y);

    context.quadraticCurveTo(
      x + width,
      y,
      x + width,
      y + safeRadius
    );

    context.lineTo(
      x + width,
      y + height - safeRadius
    );

    context.quadraticCurveTo(
      x + width,
      y + height,
      x + width - safeRadius,
      y + height
    );

    context.lineTo(
      x + safeRadius,
      y + height
    );

    context.quadraticCurveTo(
      x,
      y + height,
      x,
      y + height - safeRadius
    );

    context.lineTo(x, y + safeRadius);

    context.quadraticCurveTo(
      x,
      y,
      x + safeRadius,
      y
    );

    context.closePath();
  }

  function handleSeek(event) {
    const nextTime = clampNumber(
      Number(event.target.value) || 0,
      0,
      totalDuration
    );

    currentTimeRef.current = nextTime;
    setDisplayTime(nextTime);
    drawCurrentFrame(nextTime);

    if (typeof onTimeUpdate === "function") {
      onTimeUpdate(nextTime);
    }
  }

  return (
    <div className="w-full">
      <div
        className="mx-auto bg-black rounded-[2.2rem] p-2.5 sm:p-3 shadow-2xl"
        style={{
          width: "100%",
          maxWidth: previewWidth,
        }}
      >
        <div className="relative overflow-hidden bg-black rounded-[1.7rem] aspect-[9/16]">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="block w-full h-full object-cover"
          />

          {loadingAssets && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-white text-center px-6">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                <p className="font-black mt-4">
                  Preparando contenido...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showControls && (
        <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-3">
          <input
            type="range"
            min="0"
            max={Math.max(totalDuration, 0.01)}
            step="0.01"
            value={Math.min(displayTime, totalDuration)}
            onChange={handleSeek}
            className="w-full min-h-6"
          />

          <div className="flex items-center justify-between mt-2 text-xs sm:text-sm font-black text-slate-500">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default ReelPlayer;

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function formatTime(seconds = 0) {
  const safeSeconds = Math.max(
    0,
    Number(seconds) || 0
  );

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}
