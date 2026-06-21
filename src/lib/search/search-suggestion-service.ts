import { searchStore } from "@/lib/search/search-store";
import { searchSynonymService } from "@/lib/search/search-synonym-service";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";

function collectSuggestionDictionary(): string[] {
  const values = new Set<string>();
  for (const document of searchStore.listDocuments()) {
    values.add(queryNormalizationService.normalizeSearchQuery(document.title));
    document.search.keywords.forEach((keyword) => values.add(queryNormalizationService.normalizeSearchQuery(keyword)));
    document.entities.forEach((entity) => values.add(queryNormalizationService.normalizeSearchQuery(entity)));
  }

  for (const entry of searchSynonymService.list()) {
    values.add(queryNormalizationService.normalizeSearchQuery(entry.term));
    entry.variants.forEach((variant) => values.add(queryNormalizationService.normalizeSearchQuery(variant)));
  }

  return [...values].filter(Boolean);
}

export function getSearchSuggestions(query: string, limit = 10): string[] {
  const normalized = queryNormalizationService.normalizeSearchQuery(query);
  if (!normalized) return collectSuggestionDictionary().slice(0, limit);

  const dictionary = collectSuggestionDictionary();
  const exact = dictionary.filter((item) => item.startsWith(normalized));
  const contains = dictionary.filter((item) => !item.startsWith(normalized) && item.includes(normalized));
  const synonyms = searchSynonymService.expandSynonyms([normalized]).filter((item) => item !== normalized);

  return [...new Set([...exact, ...contains, ...synonyms])].slice(0, limit);
}

export const searchSuggestionService = {
  getSearchSuggestions,
};
