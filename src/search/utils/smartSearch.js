const MIN_PREFIX_LENGTH = 4;

export function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s-]/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function singularizeSpanishWord(word) {
  if (!word || word.length < 4) return word;

  // luces -> luz, peces -> pez
  if (word.endsWith("ces") && word.length > 5) {
    return `${word.slice(0, -3)}z`;
  }

  // panaderias -> panaderia, electricistas -> electricista,
  // repuestos -> repuesto. Solo quitamos la S si antes hay vocal.
  if (/[aeiou]s$/.test(word) && word.length > 4) {
    return word.slice(0, -1);
  }

  // flores -> flor, talleres -> taller, motores -> motor.
  if (word.endsWith("es") && word.length > 5) {
    return word.slice(0, -2);
  }

  return word;
}

export function canonicalSearchWord(value) {
  return singularizeSpanishWord(normalizeSearchText(value));
}

export function tokenizeSearch(value) {
  return normalizeSearchText(value)
    .split(" ")
    .filter(Boolean)
    .map(canonicalSearchWord);
}

function editDistanceAtMostOne(first, second) {
  if (first === second) return true;

  const lengthDifference = Math.abs(first.length - second.length);
  if (lengthDifference > 1) return false;

  let i = 0;
  let j = 0;
  let differences = 0;

  while (i < first.length && j < second.length) {
    if (first[i] === second[j]) {
      i += 1;
      j += 1;
      continue;
    }

    differences += 1;
    if (differences > 1) return false;

    if (first.length > second.length) i += 1;
    else if (second.length > first.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }

  if (i < first.length || j < second.length) differences += 1;
  return differences <= 1;
}

export function wordsMatch(queryWord, indexedWord) {
  if (!queryWord || !indexedWord) return false;
  if (queryWord === indexedWord) return true;

  const shortestLength = Math.min(queryWord.length, indexedWord.length);

  // Permite escribir una parte razonable: panad -> panaderia.
  if (
    shortestLength >= MIN_PREFIX_LENGTH &&
    (queryWord.startsWith(indexedWord) || indexedWord.startsWith(queryWord))
  ) {
    return true;
  }

  // Tolera un error de escritura en palabras suficientemente largas.
  if (shortestLength >= 5 && editDistanceAtMostOne(queryWord, indexedWord)) {
    return true;
  }

  return false;
}

export function smartTextMatches(searchableValue, query) {
  const queryWords = tokenizeSearch(query);
  if (!queryWords.length) return true;

  const indexedWords = tokenizeSearch(searchableValue);
  if (!indexedWords.length) return false;

  return queryWords.every((queryWord) =>
    indexedWords.some((indexedWord) => wordsMatch(queryWord, indexedWord))
  );
}

export function smartFieldScore(fieldValue, query, weights = {}) {
  const normalizedField = normalizeSearchText(fieldValue);
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery || !smartTextMatches(normalizedField, normalizedQuery)) {
    return 0;
  }

  const exact = weights.exact ?? 20;
  const phrase = weights.phrase ?? 12;
  const words = weights.words ?? 6;

  if (normalizedField === normalizedQuery) return exact;
  if (normalizedField.includes(normalizedQuery)) return phrase;
  return words;
}
