export const MENTOR_LIMITS = {
  free: 0,
  gratuito: 0,
  standard: 15,
  estandar: 15,
  premium: 40,
};

export function normalizePlan(plan) {
  const value = String(plan || "free")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (value === "estandar") return "standard";
  if (value === "gratuito") return "free";
  return value;
}

export function getMentorLimit(plan, unlimited = false) {
  if (unlimited) return Infinity;
  return MENTOR_LIMITS[normalizePlan(plan)] ?? 0;
}

export function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildUsageKey(entityType, entityId) {
  return `tuscomercios-mentor-usage:${entityType}:${entityId}:${getTodayKey()}`;
}
