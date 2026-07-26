import React from "react";
import { MapPin, Navigation, Store, Map } from "lucide-react";

const iconMap = {
  local: MapPin,
  nearby: Navigation,
  cordoba: Store,
  other: Map,
};

export default function BusinessSection({
  title,
  description = "",
  icon = null,
  businesses = [],
  renderBusiness,
  className = "",
}) {
  if (!businesses.length) return null;
  const SectionIcon = typeof icon === "string" && iconMap[icon] ? iconMap[icon] : Store;

  return (
    <section className={`search-section mb-10 last:mb-0 ${className}`.trim()}>
      <div className="search-section__header">
        <div className="search-section__heading">
          <span className="search-section__icon">
            <SectionIcon size={21} />
          </span>
          <div>
            <h2 className="search-section__title">{title}</h2>
            {description && <p className="search-section__description">{description}</p>}
          </div>
        </div>

        <span className="search-section__count">
          {businesses.length} {businesses.length === 1 ? "resultado" : "resultados"}
        </span>
      </div>

      <div className="search-section__grid grid gap-6 sm:gap-7">
        {businesses.map((business, index) => renderBusiness(business, index))}
      </div>
    </section>
  );
}
