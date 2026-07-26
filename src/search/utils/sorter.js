import { rotateBusinesses } from "./rotation";

const PREMIUM_NAMES = new Set(["premium", "pro", "destacado"]);
const STANDARD_NAMES = new Set(["standard", "estandar", "estándar"]);

export const getBusinessPlan = (business = {}) =>
  String(
    business.plan?.name ??
      business.plan?.nombre ??
      business.planName ??
      business.plan ??
      business.subscription?.plan ??
      "free"
  )
    .trim()
    .toLocaleLowerCase("es-AR");

export const getPlanPriority = (business) => {
  const plan = getBusinessPlan(business);
  if (PREMIUM_NAMES.has(plan) || plan === "premiun" || plan === "plan premium") return 3;
  if (
    STANDARD_NAMES.has(plan) ||
    plan === "plan standard" ||
    plan === "plan estandar" ||
    plan === "plan estándar"
  ) return 2;
  return 1;
};

export const sortBusinessesByPlan = (businesses = [], rotationOptions = {}) => {
  const groups = new Map();

  businesses.forEach((business) => {
    const priority = getPlanPriority(business);
    if (!groups.has(priority)) groups.set(priority, []);
    groups.get(priority).push(business);
  });

  return [...groups.keys()]
    .sort((first, second) => second - first)
    .flatMap((priority) =>
      rotateBusinesses(groups.get(priority), {
        ...rotationOptions,
        seed: `${rotationOptions.seed ?? "search"}:plan-${priority}`,
      })
    );
};

export const sortBusinessesByDistance = (businesses = []) =>
  [...businesses].sort((first, second) => {
    const firstDistance = Number.isFinite(first.distanceKm) ? first.distanceKm : Number.POSITIVE_INFINITY;
    const secondDistance = Number.isFinite(second.distanceKm) ? second.distanceKm : Number.POSITIVE_INFINITY;
    return firstDistance - secondDistance;
  });
