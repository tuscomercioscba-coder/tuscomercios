import { useCallback, useEffect, useState } from "react";

const GEOLOCATION_ERRORS = {
  1: "No permitiste el acceso a tu ubicación.",
  2: "No pudimos detectar tu ubicación.",
  3: "La búsqueda de tu ubicación tardó demasiado.",
};

const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 12000,
  maximumAge: 5 * 60 * 1000,
};

export default function useGeolocation({ autoRequest = false, options = {} } = {}) {
  const [coordinates, setCoordinates] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      setError("Tu dispositivo no permite usar la ubicación.");
      return Promise.resolve(null);
    }

    setStatus("loading");
    setError("");

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          setCoordinates(nextCoordinates);
          setStatus("success");
          resolve(nextCoordinates);
        },
        (geolocationError) => {
          setCoordinates(null);
          setStatus("error");
          setError(
            GEOLOCATION_ERRORS[geolocationError.code] ||
              "Ocurrió un problema al buscar tu ubicación."
          );
          resolve(null);
        },
        { ...DEFAULT_OPTIONS, ...options }
      );
    });
  }, [options.enableHighAccuracy, options.maximumAge, options.timeout]);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setStatus("idle");
    setError("");
  }, []);

  useEffect(() => {
    if (autoRequest) requestLocation();
  }, [autoRequest, requestLocation]);

  return {
    coordinates,
    error,
    isLoading: status === "loading",
    isSupported: status !== "unsupported",
    status,
    requestLocation,
    clearLocation,
  };
}
