import React from "react";
import { MapPin, Navigation, RotateCcw } from "lucide-react";
import { ARGENTINA_PROVINCES } from "./utils/provinces";

export default function SearchFilters({
  selectedProvince = "Córdoba",
  selectedLocality = "",
  provinces = ARGENTINA_PROVINCES,
  localities = [],
  onProvinceChange,
  onLocalityChange,
  onRequestGps,
  onClearGps,
  gpsStatus = "idle",
  gpsError = "",
}) {
  const gpsActive = gpsStatus === "success";
  const gpsLoading = gpsStatus === "loading";

  return (
    <div className="search-filters">
      <div className="search-filters__fields">
        <label className="search-filter">
          <span className="search-filter__label">Provincia</span>
          <select
            className="search-filter__select"
            value={selectedProvince}
            onChange={(event) => onProvinceChange?.(event.target.value)}
          >
            {provinces.map((province) => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </label>

        <label className="search-filter">
          <span className="search-filter__label">Localidad</span>
          <select
            className="search-filter__select"
            value={selectedLocality}
            onChange={(event) => onLocalityChange?.(event.target.value)}
          >
            <option value="">Todas las localidades</option>
            {localities.map((locality) => (
              <option key={locality} value={locality}>{locality}</option>
            ))}
          </select>
        </label>

        <button
          className={`search-filter__gps ${gpsActive ? "search-filter__gps--active" : ""}`}
          type="button"
          onClick={gpsActive ? onClearGps : onRequestGps}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <Navigation size={18} className="animate-pulse" />
          ) : gpsActive ? (
            <RotateCcw size={18} />
          ) : (
            <MapPin size={18} />
          )}
          {gpsLoading
            ? "Buscando ubicación..."
            : gpsActive
              ? "Ubicación activada"
              : "Usar mi ubicación"}
        </button>
      </div>

      {gpsError && <p className="search-filter__error" role="alert">{gpsError}</p>}
    </div>
  );
}
