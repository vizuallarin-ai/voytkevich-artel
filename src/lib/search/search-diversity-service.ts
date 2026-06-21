import type { SearchResult } from "@/types/search-result";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";

export function preserveTopExactMatch(results: SearchResult[], query: string): SearchResult[] {
  if (results.length === 0) return results;
  const normalizedQuery = queryNormalizationService.normalizeSearchQuery(query);
  const index = results.findIndex((result) => {
    const normalizedTitle = queryNormalizationService.normalizeSearchQuery(result.title);
    return normalizedTitle === normalizedQuery;
  });

  if (index <= 0) return results;
  const exact = results[index];
  return [exact, ...results.slice(0, index), ...results.slice(index + 1)];
}

export function limitDuplicateProjectVariants(
  results: SearchResult[],
  maxPerBase = 2,
): SearchResult[] {
  const variantCounter = new Map<string, number>();
  const filtered: SearchResult[] = [];

  for (const result of results) {
    if (result.type !== "project" && result.type !== "programmatic") {
      filtered.push(result);
      continue;
    }

    const base = queryNormalizationService
      .normalizeSearchQuery(result.title)
      .replace(/\b\d+[x×]\d+\b/g, "")
      .replace(/\b\d+\s?(м2|кв)\b/g, "")
      .trim();

    const count = variantCounter.get(base) ?? 0;
    if (count >= maxPerBase) continue;
    variantCounter.set(base, count + 1);
    filtered.push(result);
  }

  return filtered;
}

export function diversifyResultsByContentType(
  results: SearchResult[],
  maxPerType = 4,
): SearchResult[] {
  const typeCounter = new Map<string, number>();
  const diversified: SearchResult[] = [];

  for (const result of results) {
    const count = typeCounter.get(result.type) ?? 0;
    if (count >= maxPerType) continue;
    typeCounter.set(result.type, count + 1);
    diversified.push(result);
  }

  return diversified;
}

export const searchDiversityService = {
  diversifyResultsByContentType,
  limitDuplicateProjectVariants,
  preserveTopExactMatch,
};
