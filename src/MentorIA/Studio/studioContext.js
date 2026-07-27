function cleanText(value, max = 240) {
  return String(value || "").trim().slice(0, max);
}

function compactBrandKit(brandKit = {}) {
  return {
    identity: {
      businessName: cleanText(brandKit?.identity?.businessName, 120),
      slogan: cleanText(brandKit?.identity?.slogan, 180),
      shortDescription: cleanText(brandKit?.identity?.shortDescription, 300),
    },
    logos: {
      primary: Boolean(brandKit?.logos?.primary),
      white: Boolean(brandKit?.logos?.white),
      dark: Boolean(brandKit?.logos?.dark),
      symbol: Boolean(brandKit?.logos?.symbol),
    },
    colors: brandKit?.colors || {},
    typography: brandKit?.typography || {},
    style: brandKit?.style || {},
    button: brandKit?.button || {},
    watermark: brandKit?.watermark || {},
    content: brandKit?.content || {},
  };
}

function compactBusiness(business = {}) {
  return {
    id: business?.id || "",
    name: cleanText(business?.negocio || business?.name, 120),
    category: cleanText(business?.rubro || business?.category, 120),
    city: cleanText(business?.ciudad || business?.city, 120),
    description: cleanText(business?.descripcion || business?.description, 320),
    plan: cleanText(business?.plan, 40),
  };
}

export function buildImageStudioContext({ business, brandKit, project, format }) {
  const elements = Array.isArray(project?.elements) ? project.elements : [];

  return {
    source: "image-editor",
    editor: "Editor de Imágenes",
    format: format || `${project?.width || 0}x${project?.height || 0}`,
    canvas: {
      width: Number(project?.width || 0),
      height: Number(project?.height || 0),
      background: project?.background || null,
    },
    business: compactBusiness(business),
    brandKit: compactBrandKit(brandKit),
    summary: {
      totalElements: elements.length,
      texts: elements.filter((item) => item?.type === "text").length,
      images: elements.filter((item) => item?.type === "image").length,
      logos: elements.filter((item) => item?.type === "logo").length,
      shapes: elements.filter((item) => item?.type === "shape").length,
      stickers: elements.filter((item) => item?.type === "sticker").length,
    },
    elements: elements.slice(0, 40).map((item) => ({
      id: item?.id,
      type: item?.type,
      name: cleanText(item?.name, 80),
      text: cleanText(item?.text, 240),
      x: Math.round(Number(item?.x || 0)),
      y: Math.round(Number(item?.y || 0)),
      width: Math.round(Number(item?.width || 0)),
      height: Math.round(Number(item?.height || 0)),
      fontSize: Number(item?.fontSize || 0),
      fontFamily: cleanText(item?.fontFamily, 80),
      fill: item?.fill || "",
      opacity: Number(item?.opacity ?? 1),
      rotation: Number(item?.rotation || 0),
      visible: item?.visible !== false,
      locked: Boolean(item?.locked),
      hasImage: Boolean(item?.src),
    })),
  };
}

export function buildReelStudioContext({
  business,
  brandKit,
  project,
  layers,
  audioTrack,
  voiceTrack,
  finalDuration,
}) {
  const clips = Array.isArray(project?.clips) ? project.clips : [];
  const safeLayers = Array.isArray(layers) ? layers : [];

  return {
    source: "reels-studio",
    editor: "Reels Studio 2.0",
    business: compactBusiness(business),
    brandKit: compactBrandKit(brandKit),
    reel: {
      name: cleanText(project?.name, 120),
      duration: Number(finalDuration || 0),
      viewMode: project?.viewMode || "",
      clipsCount: clips.length,
      layersCount: safeLayers.length,
      hasMusic: Boolean(audioTrack),
      hasVoice: Boolean(voiceTrack),
    },
    clips: clips.slice(0, 30).map((clip, index) => ({
      scene: index + 1,
      id: clip?.id,
      duration: Math.max(0, Number(clip?.end || 0) - Number(clip?.start || 0)),
      sourceStart: Number(clip?.start || 0),
      sourceEnd: Number(clip?.end || 0),
      transition: clip?.transition || null,
      mediaType: clip?.mediaType || clip?.type || "",
      muted: Boolean(clip?.muted),
      volume: Number(clip?.volume ?? 1),
    })),
    layers: safeLayers.slice(0, 50).map((layer) => ({
      id: layer?.id,
      type: layer?.type,
      text: cleanText(layer?.text, 240),
      start: Number(layer?.start || 0),
      end: Number(layer?.end || 0),
      x: Math.round(Number(layer?.x || 0)),
      y: Math.round(Number(layer?.y || 0)),
      width: Math.round(Number(layer?.width || 0)),
      height: Math.round(Number(layer?.height || 0)),
      fontSize: Number(layer?.fontSize || 0),
      fontFamily: cleanText(layer?.fontFamily, 80),
      color: layer?.color || layer?.fill || "",
      animation: layer?.animation || layer?.motion || null,
      visible: layer?.visible !== false,
    })),
  };
}

export function buildCarouselStudioContext({
  business,
  brandKit,
  pages,
  format,
  objective,
  styleId,
  selectedIndex,
}) {
  const safePages = Array.isArray(pages) ? pages : [];

  return {
    source: "carousel-studio",
    editor: "Editor de Carruseles",
    business: compactBusiness(business),
    brandKit: compactBrandKit(brandKit),
    carousel: {
      format: cleanText(format, 40),
      objective: cleanText(objective, 60),
      visualStyle: cleanText(styleId, 60),
      pagesCount: safePages.length,
      selectedPage: Number(selectedIndex || 0) + 1,
    },
    pages: safePages.slice(0, 10).map((page, index) => ({
      page: index + 1,
      eyebrow: cleanText(page?.eyebrow, 100),
      title: cleanText(page?.title, 240),
      body: cleanText(page?.body, 360),
      callToAction: cleanText(page?.cta, 120),
      images: Array.isArray(page?.images)
        ? page.images.slice(0, 8).map((image) => ({
            x: Math.round(Number(image?.x || 0)),
            y: Math.round(Number(image?.y || 0)),
            width: Math.round(Number(image?.width || 0)),
            height: Math.round(Number(image?.height || 0)),
            rotation: Math.round(Number(image?.rotation || 0)),
            opacity: Number(image?.opacity ?? 1),
            background: Boolean(image?.isBackground),
            filter: cleanText(image?.filter, 120),
          }))
        : [],
      font: cleanText(page?.font, 80),
      background: page?.background || "",
      accent: page?.accent || "",
      textColor: page?.textColor || "",
      emoji: cleanText(page?.emoji, 20),
    })),
  };
}
