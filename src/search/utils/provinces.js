export const ARGENTINA_PROVINCES = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Ciudad Autónoma de Buenos Aires",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const removeAccents = (value = "") =>
  String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const normalizePlaceName = (value = "") =>
  removeAccents(value).trim().replace(/\s+/g, " ").toLocaleLowerCase("es-AR");

export const isSamePlace = (first, second) =>
  Boolean(first && second) && normalizePlaceName(first) === normalizePlaceName(second);

export const isCordoba = (province) => isSamePlace(province, "Córdoba");

export const getProvinceName = (province) => {
  const normalized = normalizePlaceName(province);
  return ARGENTINA_PROVINCES.find((item) => normalizePlaceName(item) === normalized) ?? province ?? "";
};

export const groupLocalitiesByProvince = (localities = []) =>
  localities.reduce((groups, locality) => {
    const province = getProvinceName(locality.province ?? locality.provincia) || "Sin provincia";
    if (!groups[province]) groups[province] = [];
    groups[province].push(locality);
    return groups;
  }, {});
