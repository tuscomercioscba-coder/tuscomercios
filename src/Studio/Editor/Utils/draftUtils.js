const PREFIX = "tuscomercios-studio-draft:";

export function saveDraft(key, project) {
  if (!key || !project) return false;

  localStorage.setItem(
    `${PREFIX}${key}`,
    JSON.stringify({
      project,
      savedAt: new Date().toISOString(),
    })
  );

  return true;
}

export function loadDraft(key) {
  if (!key) return null;

  const raw = localStorage.getItem(`${PREFIX}${key}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function removeDraft(key) {
  if (!key) return;
  localStorage.removeItem(`${PREFIX}${key}`);
}
