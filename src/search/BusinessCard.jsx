import React from "react";
import { MapPin, MessageCircle, Crown, Star, Store, Navigation } from "lucide-react";
import { formatDistance } from "./utils/distance";
import { getBusinessPlan } from "./utils/sorter";

const normalizePlan = (business) => {
  const plan = getBusinessPlan(business);
  if (["premium", "premiun", "plan premium"].includes(plan)) return "premium";
  if (["standard", "estandar", "estándar", "plan standard", "plan estandar", "plan estándar"].includes(plan)) return "standard";
  return "free";
};

const formatWhatsappNumber = (number) => {
  if (!number) return "";
  let clean = String(number).replace(/\D/g, "");
  if (clean.startsWith("00")) clean = clean.slice(2);
  if (clean.startsWith("549") || clean.startsWith("54")) return clean;
  if (clean.startsWith("0")) clean = clean.slice(1);
  return `549${clean}`;
};

export default function BusinessCard({ business, index = 0, onOpen, onWhatsapp, variant = "list" }) {
  const plan = normalizePlan(business);
  const whatsappNumber = formatWhatsappNumber(business.whatsapp);
  const message = encodeURIComponent(`Hola ${business.negocio || ""}, vi tu negocio en Tus Comercios`);
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${message}` : "";
  const isGrid = variant === "grid";
  const validDistance = Number.isFinite(business.distanceKm) && business.distanceKm >= 0 && business.distanceKm <= 2000;

  const openBusiness = () => onOpen?.(business);

  const handleKeyboard = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openBusiness();
    }
  };

  const handleWhatsapp = async (event) => {
    event.stopPropagation();
    if (!whatsappLink) return;
    await onWhatsapp?.(business);
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  };

  const PlanIcon = plan === "premium" ? Crown : plan === "standard" ? Star : Store;

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openBusiness}
      onKeyDown={handleKeyboard}
      className={`group overflow-hidden rounded-[24px] border bg-white shadow-[0_10px_30px_rgba(15,23,42,0.10)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(15,23,42,0.16)] focus:outline-none focus:ring-4 focus:ring-blue-100 ${
        plan === "premium"
          ? "border-blue-200 ring-1 ring-blue-50 hover:border-blue-300"
          : plan === "standard"
            ? "border-red-100 ring-1 ring-red-50 hover:border-red-200"
            : "border-slate-200 ring-1 ring-slate-100 hover:border-slate-300"
      } ${isGrid ? "flex flex-col" : "flex flex-col sm:flex-row"}`}
    >
      <div className={isGrid ? "h-52 w-full bg-slate-100" : "h-48 w-full bg-slate-100 sm:h-auto sm:min-h-[170px] sm:w-48"}>
        <img
          src={business.image || "/no-image.jpg"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          alt={business.negocio || "Comercio"}
          loading={index < 3 ? "eager" : "lazy"}
          fetchPriority={index < 3 ? "high" : "auto"}
          decoding="async"
          onError={(event) => { event.currentTarget.src = "/no-image.jpg"; }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-black leading-tight text-slate-950">{business.negocio}</h3>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <MapPin size={16} className="shrink-0 text-red-500" />
                {business.ciudad}
              </p>
            </div>

            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] ${
              plan === "premium"
                ? "bg-blue-50 text-blue-700"
                : plan === "standard"
                  ? "bg-red-50 text-red-700"
                  : "bg-slate-100 text-slate-500"
            }`}>
              <PlanIcon size={14} />
              {plan === "standard" ? "Estándar" : plan === "premium" ? "Premium" : "Gratis"}
            </span>
          </div>

          {business.rubro && <p className="mt-3 text-xs font-black uppercase tracking-[0.08em] text-blue-600">{business.rubro}</p>}

          {validDistance && (
            <p className="mt-2 flex items-center gap-2 text-xs font-bold text-blue-600">
              <Navigation size={15} />
              A {formatDistance(business.distanceKm)} de vos
            </p>
          )}

          {business.descripcion && (
            <p className="mt-3 line-clamp-2 whitespace-pre-line text-sm leading-6 text-slate-600">
              {business.descripcion}
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          {whatsappNumber && (
            <button
              type="button"
              onClick={handleWhatsapp}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700"
            >
              <MessageCircle size={17} />
              Contactar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
