export function getStoryVisitorId() {
  const key = "tc_story_visitor_id";
  let value = localStorage.getItem(key);
  if (!value) {
    value =
      globalThis.crypto?.randomUUID?.() ||
      `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, value);
  }
  return value;
}

export function getSeenStoryIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem("tc_seen_stories") || "[]"));
  } catch {
    return new Set();
  }
}

export function markStorySeen(storyId) {
  const seen = getSeenStoryIds();
  seen.add(storyId);
  localStorage.setItem("tc_seen_stories", JSON.stringify([...seen].slice(-500)));
}

export function normalizeStoryPlan(plan) {
  const value = String(plan || "").toLowerCase();
  if (value === "premium") return "premium";
  if (["standard", "estandar", "estándar"].includes(value)) return "standard";
  return "free";
}
