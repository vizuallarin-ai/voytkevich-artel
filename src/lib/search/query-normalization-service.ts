import { SEARCH_QUERY_MAX_LENGTH } from "@/data/search-synonyms";

const UNSAFE_QUERY_RE = /<[^>]*>|javascript:|data:text\/html|on\w+=|[`$]/gi;

const TRANSLITERATION_DICTIONARY: Record<string, string> = {
  irkutsk: "иркутск",
  angarsk: "ангарск",
  shelehov: "шелехов",
  khomutovo: "хомутово",
  mamony: "мамоны",
  mamon: "мамон",
  dom: "дом",
  bani: "бани",
  proekt: "проект",
};

export function normalizeYoAndE(value: string): string {
  return value.replace(/ё/gi, "е");
}

export function normalizeDimensionQuery(query: string): string {
  return query.replace(/(\d+(?:[.,]\d+)?)\s*[xхXХ]\s*(\d+(?:[.,]\d+)?)/g, "$1×$2");
}

export function normalizeTransliteration(query: string): string {
  return query.replace(/\b[a-z]{3,}\b/gi, (word) => {
    const lower = word.toLowerCase();
    return TRANSLITERATION_DICTIONARY[lower] ?? word;
  });
}

export function removeUnsafeQueryContent(query: string): string {
  return query.replace(UNSAFE_QUERY_RE, " ").replace(/\s+/g, " ").trim();
}

export function limitQueryLength(query: string, maxLength = SEARCH_QUERY_MAX_LENGTH): string {
  return query.length > maxLength ? query.slice(0, maxLength).trim() : query;
}

export function normalizeSearchQuery(rawQuery: string): string {
  const trimmed = rawQuery.trim();
  const safe = removeUnsafeQueryContent(trimmed);
  const transliterated = normalizeTransliteration(safe);
  const withDimensions = normalizeDimensionQuery(transliterated);
  const normalizedYo = normalizeYoAndE(withDimensions);
  const collapsed = normalizedYo
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s×-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return limitQueryLength(collapsed);
}

export const queryNormalizationService = {
  normalizeSearchQuery,
  normalizeDimensionQuery,
  normalizeYoAndE,
  normalizeTransliteration,
  removeUnsafeQueryContent,
  limitQueryLength,
};
