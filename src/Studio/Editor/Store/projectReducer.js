export function updateElement(elements, id, changes) {
  return elements.map((item) =>
    item.id === id ? { ...item, ...changes } : item
  );
}

export function deleteElement(elements, id) {
  return elements.filter((item) => item.id !== id);
}

export function duplicateElement(elements, id) {
  const source = elements.find((item) => item.id === id);
  if (!source) return elements;

  return [
    ...elements,
    {
      ...source,
      id: `${source.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: `${source.name} copia`,
      x: Number(source.x || 0) + 30,
      y: Number(source.y || 0) + 30,
      locked: false,
    },
  ];
}

export function moveLayer(elements, id, direction) {
  const index = elements.findIndex((item) => item.id === id);
  if (index < 0) return elements;

  const nextIndex =
    direction === "up"
      ? Math.min(elements.length - 1, index + 1)
      : Math.max(0, index - 1);

  if (nextIndex === index) return elements;

  const next = [...elements];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}
