export function adaptProjectToSize(project, width, height) {
  if (!project) return project;

  const scaleX = width / project.width;
  const scaleY = height / project.height;

  return {
    ...project,
    width,
    height,
    elements: project.elements.map((element) => ({
      ...element,
      x: element.x * scaleX,
      y: element.y * scaleY,
      width: Math.max(20, element.width * scaleX),
      height: Math.max(20, element.height * scaleY),
      fontSize:
        element.fontSize != null
          ? Math.max(10, element.fontSize * Math.min(scaleX, scaleY))
          : element.fontSize,
      shadowBlur:
        element.shadowBlur != null
          ? element.shadowBlur * Math.min(scaleX, scaleY)
          : element.shadowBlur,
      cornerRadius:
        element.cornerRadius != null
          ? element.cornerRadius * Math.min(scaleX, scaleY)
          : element.cornerRadius,
    })),
  };
}

export function applyDesignCategory(project, category) {
  if (!project || !category) return project;

  let hasSticker = false;

  const elements = project.elements.map((element) => {
    if (element.id === "title") {
      return {
        ...element,
        text: category.title,
        fill: category.titleColor,
      };
    }

    if (element.id === "subtitle") {
      return {
        ...element,
        text: category.subtitle,
        fill: category.subtitleColor,
      };
    }

    if (element.type === "sticker" && !hasSticker) {
      hasSticker = true;
      return {
        ...element,
        text: category.badge,
        fill: category.accentColor,
        color: category.id === "clean" ? "#ffffff" : "#0f172a",
      };
    }

    return element;
  });

  return {
    ...project,
    background: category.background,
    elements,
  };
}

export function alignElement(element, project, position) {
  if (!element || !project) return null;

  const margin = 60;

  const positions = {
    "top-left": {
      x: margin,
      y: margin,
    },
    "top-center": {
      x: (project.width - element.width) / 2,
      y: margin,
    },
    "top-right": {
      x: project.width - element.width - margin,
      y: margin,
    },
    "center-left": {
      x: margin,
      y: (project.height - element.height) / 2,
    },
    center: {
      x: (project.width - element.width) / 2,
      y: (project.height - element.height) / 2,
    },
    "center-right": {
      x: project.width - element.width - margin,
      y: (project.height - element.height) / 2,
    },
    "bottom-left": {
      x: margin,
      y: project.height - element.height - margin,
    },
    "bottom-center": {
      x: (project.width - element.width) / 2,
      y: project.height - element.height - margin,
    },
    "bottom-right": {
      x: project.width - element.width - margin,
      y: project.height - element.height - margin,
    },
  };

  return positions[position] || positions.center;
}
