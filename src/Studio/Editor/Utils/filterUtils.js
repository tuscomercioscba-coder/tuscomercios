export function buildKonvaFilters(Konva, element) {
  const filters = [];
  if (Number(element.blur || 0) > 0) filters.push(Konva.Filters.Blur);
  if (Number(element.brightness || 0) !== 0) filters.push(Konva.Filters.Brighten);
  if (Number(element.contrast || 0) !== 0) filters.push(Konva.Filters.Contrast);
  if (Number(element.saturation || 0) !== 0) filters.push(Konva.Filters.HSL);
  if (Number(element.grayscale || 0) > 0) filters.push(Konva.Filters.Grayscale);
  return filters;
}

export function getImageFilterProps(element) {
  return {
    blurRadius: Number(element.blur || 0),
    brightness: Number(element.brightness || 0),
    contrast: Number(element.contrast || 0),
    saturation: Number(element.saturation || 0),
  };
}

export function resetImageFilters() {
  return {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    grayscale: 0,
  };
}
