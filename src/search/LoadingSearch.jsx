import React from "react";

const SKELETON_CARDS = 6;

export default function LoadingSearch({ message = "Buscando comercios..." }) {
  return (
    <section className="search-loading" aria-busy="true" aria-live="polite">
      <div className="search-loading__top">
        <span className="search-loading__spinner" aria-hidden="true" />
        <p className="search-loading__message">{message}</p>
      </div>

      <div className="search-loading__grid" aria-hidden="true">
        {Array.from({ length: SKELETON_CARDS }, (_, index) => (
          <div className="search-loading__card" key={index}>
            <div className="search-loading__image" />
            <div className="search-loading__line search-loading__line--title" />
            <div className="search-loading__line" />
            <div className="search-loading__line search-loading__line--short" />
          </div>
        ))}
      </div>
    </section>
  );
}
