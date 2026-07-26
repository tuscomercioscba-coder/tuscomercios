import React from "react";

export default function EmptyResults({ query = "", onClear = null }) {
  return (
    <section className="search-empty" role="status">
      <div className="search-empty__icon" aria-hidden="true">
        🔎
      </div>

      <h2 className="search-empty__title">No encontramos resultados</h2>

      <p className="search-empty__message">
        {query
          ? `No hay comercios que coincidan con “${query}” en las zonas disponibles.`
          : "Todavía no hay comercios disponibles para esta búsqueda."}
      </p>

      {onClear && (
        <button className="search-empty__button" type="button" onClick={onClear}>
          Ver todos los comercios
        </button>
      )}
    </section>
  );
}
