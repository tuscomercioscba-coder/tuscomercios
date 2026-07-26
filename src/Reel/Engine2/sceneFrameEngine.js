export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

export function getMediaDimensions(media) {
  return {
    width:
      media?.videoWidth ||
      media?.naturalWidth ||
      media?.width ||
      0,
    height:
      media?.videoHeight ||
      media?.naturalHeight ||
      media?.height ||
      0,
  };
}

export function calculateCoverSource({
  mediaWidth,
  mediaHeight,
  frameWidth,
  frameHeight,
  focalX = 50,
  focalY = 50,
  zoom = 1,
}) {
  if (
    !mediaWidth ||
    !mediaHeight ||
    !frameWidth ||
    !frameHeight
  ) {
    return null;
  }

  const safeZoom = Math.max(0.5, Number(zoom || 1));

  const scale =
    Math.max(
      frameWidth / mediaWidth,
      frameHeight / mediaHeight
    ) * safeZoom;

  const sourceWidth = Math.min(
    mediaWidth,
    frameWidth / scale
  );

  const sourceHeight = Math.min(
    mediaHeight,
    frameHeight / scale
  );

  const maxSourceX = Math.max(
    0,
    mediaWidth - sourceWidth
  );

  const maxSourceY = Math.max(
    0,
    mediaHeight - sourceHeight
  );

  return {
    sx:
      maxSourceX *
      (clamp(focalX, 0, 100) / 100),
    sy:
      maxSourceY *
      (clamp(focalY, 0, 100) / 100),
    sw: sourceWidth,
    sh: sourceHeight,
  };
}

export function calculateContainDestination({
  mediaWidth,
  mediaHeight,
  frameWidth,
  frameHeight,
  zoom = 1,
}) {
  if (
    !mediaWidth ||
    !mediaHeight ||
    !frameWidth ||
    !frameHeight
  ) {
    return null;
  }

  const scale =
    Math.min(
      frameWidth / mediaWidth,
      frameHeight / mediaHeight
    ) * Math.max(0.5, Number(zoom || 1));

  const width = mediaWidth * scale;
  const height = mediaHeight * scale;

  return {
    x: (frameWidth - width) / 2,
    y: (frameHeight - height) / 2,
    width,
    height,
  };
}

export function drawFramedMedia({
  context,
  media,
  scene,
  x = 0,
  y = 0,
  width,
  height,
}) {
  const dimensions = getMediaDimensions(media);

  if (!dimensions.width || !dimensions.height) {
    return false;
  }

  const fit = scene?.mediaFit || "cover";
  const zoom = Math.max(
    0.5,
    Number(scene?.mediaZoom || 1)
  );

  if (fit === "contain") {
    context.save();

    context.filter = `blur(${Number(
      scene?.backgroundBlur ?? 24
    )}px) brightness(${Number(
      scene?.backgroundOpacity ?? 0.58
    )})`;

    const backgroundSource =
      calculateCoverSource({
        mediaWidth: dimensions.width,
        mediaHeight: dimensions.height,
        frameWidth: width + 120,
        frameHeight: height + 120,
        focalX: 50,
        focalY: 50,
        zoom: 1.08,
      });

    if (backgroundSource) {
      context.drawImage(
        media,
        backgroundSource.sx,
        backgroundSource.sy,
        backgroundSource.sw,
        backgroundSource.sh,
        x - 60,
        y - 60,
        width + 120,
        height + 120
      );
    }

    context.restore();

    const destination =
      calculateContainDestination({
        mediaWidth: dimensions.width,
        mediaHeight: dimensions.height,
        frameWidth: width,
        frameHeight: height,
        zoom,
      });

    if (destination) {
      context.drawImage(
        media,
        x + destination.x,
        y + destination.y,
        destination.width,
        destination.height
      );
    }

    return true;
  }

  const source = calculateCoverSource({
    mediaWidth: dimensions.width,
    mediaHeight: dimensions.height,
    frameWidth: width,
    frameHeight: height,
    focalX: scene?.mediaFocalX ?? 50,
    focalY: scene?.mediaFocalY ?? 50,
    zoom,
  });

  if (!source) return false;

  context.drawImage(
    media,
    source.sx,
    source.sy,
    source.sw,
    source.sh,
    x,
    y,
    width,
    height
  );

  return true;
}
