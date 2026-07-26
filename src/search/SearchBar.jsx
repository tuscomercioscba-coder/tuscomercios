import React from "react";

export default function SearchBar({
  value = "",
  onChange,
  onClear,
  placeholder = "¿Qué comercio, producto o servicio buscás?",
}) {
  return (
    <div className="search-bar">
      <span className="search-bar__icon" aria-hidden="true">🔎</span>

      <input
        className="search-bar__input"
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label="Buscar comercios"
        autoComplete="off"
      />

      {value && (
        <button
          className="search-bar__clear"
          type="button"
          onClick={() => onClear?.()}
          aria-label="Borrar búsqueda"
        >
          ×
        </button>
      )}
    </div>
  );
}
