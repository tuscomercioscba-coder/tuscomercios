import { buildUsageKey } from "../Utils/MentorLimits";

function safeParse(value, fallback) {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

export function getHistoryKey(entityType, entityId) {
  return `tuscomercios-mentor-history:${entityType}:${entityId}`;
}

export function getProfileKey(entityType, entityId) {
  return `tuscomercios-mentor-profile:${entityType}:${entityId}`;
}

export function loadMentorHistory(entityType, entityId) {
  return safeParse(localStorage.getItem(getHistoryKey(entityType, entityId)), []);
}

export function saveMentorHistory(entityType, entityId, messages) {
  localStorage.setItem(
    getHistoryKey(entityType, entityId),
    JSON.stringify(messages.slice(-80))
  );
}

export function loadMarketingProfile(entityType, entityId) {
  return safeParse(localStorage.getItem(getProfileKey(entityType, entityId)), {
    audience: "",
    tone: "Cercano y profesional",
    goal: "Vender más",
    products: "",
  });
}

export function saveMarketingProfile(entityType, entityId, profile) {
  localStorage.setItem(getProfileKey(entityType, entityId), JSON.stringify(profile));
}

export function loadDailyUsage(entityType, entityId) {
  return Number(localStorage.getItem(buildUsageKey(entityType, entityId)) || 0);
}

export function saveDailyUsage(entityType, entityId, value) {
  localStorage.setItem(buildUsageKey(entityType, entityId), String(Math.max(0, value)));
}
