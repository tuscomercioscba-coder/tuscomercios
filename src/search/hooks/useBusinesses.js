import { useMemo } from "react";
import {
  calculateDistanceKm,
  normalizeArgentineCoordinates,
} from "../utils/distance";
import {
  isCordoba,
  isSamePlace,
  normalizePlaceName,
} from "../utils/provinces";
import { sortBusinessesByPlan } from "../utils/sorter";
import { smartTextMatches } from "../utils/smartSearch";

const DEFAULT_NEARBY_DISTANCE_KM = 80;

const textFrom = (value) => (value == null ? "" : String(value));

const getBusinessValue = (business, keys) => {
  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((current, part) => current?.[part], business);

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
};

const getLocality = (business) =>
  getBusinessValue(business, [
    "locality",
    "localidad",
    "city",
    "ciudad",
    "location.locality",
    "location.city",
    "address.locality",
  ]);

const getProvince = (business) =>
  getBusinessValue(business, [
    "province",
    "provincia",
    "location.province",
    "address.province",
  ]);

const getCoordinates = (business) => ({
  latitude: getBusinessValue(business, [
    "latitude",
    "lat",
    "coordinates.latitude",
    "coordinates.lat",
    "location.latitude",
    "location.lat",
  ]),
  longitude: getBusinessValue(business, [
    "longitude",
    "lng",
    "lon",
    "coordinates.longitude",
    "coordinates.lng",
    "location.longitude",
    "location.lng",
  ]),
});

/**
 * Convierte variantes como:
 * - "Villa Dolores"
 * - "Villa Dolores, centro"
 * - "Villa Dolores - Centro"
 *
 * en una misma localidad base: "villa dolores".
 */
const canonicalLocality = (value) => {
  const normalized = normalizePlaceName(value);
  if (!normalized) return "";

  return normalized
    .split(",")[0]
    .split(" - ")[0]
    .replace(/\b(centro|zona centro|barrio centro)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const sameLocality = (first, second) => {
  const firstCanonical = canonicalLocality(first);
  const secondCanonical = canonicalLocality(second);

  if (!firstCanonical || !secondCanonical) return false;

  return (
    firstCanonical === secondCanonical ||
    isSamePlace(firstCanonical, secondCanonical)
  );
};

const displayLocality = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  return raw
    .split(",")[0]
    .split(" - ")[0]
    .trim();
};

const searchableText = (business) =>
  normalizePlaceName(
    [
      getBusinessValue(business, [
        "negocio",
        "name",
        "nombre",
        "businessName",
      ]),
      getBusinessValue(business, [
        "category",
        "categoria",
        "rubro",
        "type",
      ]),
      getBusinessValue(business, ["description", "descripcion"]),
      Array.isArray(business.keywords)
        ? business.keywords.join(" ")
        : business.keywords,
      getLocality(business),
      getProvince(business),
    ]
      .map(textFrom)
      .join(" ")
  );

const matchesSearch = (business, query) => {
  return smartTextMatches(searchableText(business), query);
};

const withDistance = (business, userCoordinates) => {
  const businessCoordinates = normalizeArgentineCoordinates(
    getCoordinates(business)
  );

  const distanceKm = calculateDistanceKm(
    userCoordinates,
    businessCoordinates
  );

  return distanceKm === null
    ? { ...business, distanceKm: null }
    : { ...business, distanceKm };
};

const orderSection = (businesses, seed) =>
  sortBusinessesByPlan(businesses, {
    seed,
    rotationMinutes: 60,
  });

export default function useBusinesses({
  businesses = [],
  query = "",
  selectedLocality = "",
  selectedProvince = "Córdoba",
  userCoordinates = null,
  nearbyDistanceKm = DEFAULT_NEARBY_DISTANCE_KM,
} = {}) {
  return useMemo(() => {
    const availableBusinesses = Array.isArray(businesses)
      ? businesses.filter(Boolean)
      : [];

    const activeBusinesses = availableBusinesses
      .filter(
        (business) =>
          business.active !== false &&
          business.activo !== false
      )
      .map((business) => withDistance(business, userCoordinates));

    const nearestBusiness = userCoordinates
      ? activeBusinesses
          .filter(
            (business) =>
              Number.isFinite(business.distanceKm) &&
              getLocality(business)
          )
          .sort(
            (first, second) =>
              first.distanceKm - second.distanceKm
          )[0]
      : null;

    const resolvedLocalityRaw =
      selectedLocality || getLocality(nearestBusiness);

    const resolvedLocality = displayLocality(resolvedLocalityRaw);

    const filtered = activeBusinesses.filter((business) =>
      matchesSearch(business, query)
    );

    const local = [];
    const nearby = [];
    const cordoba = [];
    const otherProvinces = [];

    filtered.forEach((business) => {
      const locality = getLocality(business);
      const province = getProvince(business);

      if (
        resolvedLocalityRaw &&
        sameLocality(locality, resolvedLocalityRaw)
      ) {
        local.push(business);
        return;
      }

      const isNearbyByGps =
        userCoordinates &&
        Number.isFinite(business.distanceKm) &&
        business.distanceKm <= nearbyDistanceKm;

      if (
        isNearbyByGps &&
        (!selectedProvince ||
          isSamePlace(province, selectedProvince))
      ) {
        nearby.push(business);
        return;
      }

      if (isCordoba(province)) {
        cordoba.push(business);
        return;
      }

      otherProvinces.push(business);
    });

    return {
      sections: {
        local: orderSection(
          local,
          `local:${canonicalLocality(resolvedLocalityRaw)}`
        ),
        nearby: orderSection(
          nearby,
          `nearby:${canonicalLocality(resolvedLocalityRaw)}`
        ),
        cordoba: orderSection(cordoba, "cordoba"),
        otherProvinces: orderSection(
          otherProvinces,
          "other-provinces"
        ),
      },
      all: filtered,
      total: filtered.length,
      hasResults: filtered.length > 0,
      resolvedLocality,
    };
  }, [
    businesses,
    nearbyDistanceKm,
    query,
    selectedLocality,
    selectedProvince,
    userCoordinates,
  ]);
}
