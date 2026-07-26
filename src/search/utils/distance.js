const EARTH_RADIUS_KM = 6371;
const ARGENTINA_BOUNDS = {
  minLatitude: -55.5,
  maxLatitude: -21,
  minLongitude: -73.7,
  maxLongitude: -53.4,
};

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const parseCoordinate = (value) => {
  if (value === null || value === undefined || value === "") return NaN;
  return Number(String(value).trim().replace(",", "."));
};

const isValidCoordinatePair = (latitude, longitude) =>
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  longitude >= -180 &&
  longitude <= 180;

const isInsideArgentina = ({ latitude, longitude }) =>
  latitude >= ARGENTINA_BOUNDS.minLatitude &&
  latitude <= ARGENTINA_BOUNDS.maxLatitude &&
  longitude >= ARGENTINA_BOUNDS.minLongitude &&
  longitude <= ARGENTINA_BOUNDS.maxLongitude;

export const normalizeCoordinates = (value) => {
  if (!value) return null;

  const latitude = parseCoordinate(
    value.latitude ?? value.lat ?? value.coords?.latitude ?? value.location?.latitude
  );
  const longitude = parseCoordinate(
    value.longitude ?? value.lng ?? value.lon ?? value.coords?.longitude ?? value.location?.longitude
  );

  if (!isValidCoordinatePair(latitude, longitude)) return null;
  return { latitude, longitude };
};

export const normalizeArgentineCoordinates = (value) => {
  const coordinates = normalizeCoordinates(value);
  if (!coordinates) return null;
  if (isInsideArgentina(coordinates)) return coordinates;

  const swapped = {
    latitude: coordinates.longitude,
    longitude: coordinates.latitude,
  };
  if (isValidCoordinatePair(swapped.latitude, swapped.longitude) && isInsideArgentina(swapped)) {
    return swapped;
  }

  const correctedSigns = {
    latitude: -Math.abs(coordinates.latitude),
    longitude: -Math.abs(coordinates.longitude),
  };
  if (isInsideArgentina(correctedSigns)) return correctedSigns;

  const swappedCorrectedSigns = {
    latitude: -Math.abs(coordinates.longitude),
    longitude: -Math.abs(coordinates.latitude),
  };
  if (isInsideArgentina(swappedCorrectedSigns)) return swappedCorrectedSigns;

  return null;
};

export const calculateDistanceKm = (origin, destination) => {
  const from = normalizeCoordinates(origin);
  const to = normalizeCoordinates(destination);
  if (!from || !to) return null;

  const latitudeDistance = toRadians(to.latitude - from.latitude);
  const longitudeDistance = toRadians(to.longitude - from.longitude);
  const originLatitude = toRadians(from.latitude);
  const destinationLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDistance / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDistance / 2) ** 2;

  const safeHaversine = Math.min(1, Math.max(0, haversine));
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(safeHaversine), Math.sqrt(1 - safeHaversine));
};

export const formatDistance = (distanceKm) => {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return "";
  if (distanceKm < 1) return `${Math.max(1, Math.round(distanceKm * 1000))} m`;
  return `${distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm)} km`;
};
