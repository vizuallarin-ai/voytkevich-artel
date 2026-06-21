import type { SearchDocumentType } from "@/types/search-document";
import type { SearchResult } from "@/types/search-result";

export type SearchFacetFilters = {
  types?: SearchDocumentType[];
  entities?: string[];
  breadcrumbs?: string[];
};

export type SearchFacetMap = Record<string, Array<{ value: string; count: number }>>;

function toCounter(values: string[]): Array<{ value: string; count: number }> {
  const counter = new Map<string, number>();
  for (const value of values) {
    counter.set(value, (counter.get(value) ?? 0) + 1);
  }
  return [...counter.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

export function buildSearchFacets(results: SearchResult[]): SearchFacetMap {
  return {
    types: toCounter(results.map((result) => result.type)),
    entities: toCounter(results.flatMap((result) => result.entities)),
    breadcrumbs: toCounter(results.flatMap((result) => result.breadcrumbs)),
  };
}

export function applySearchFacets(results: SearchResult[], filters: SearchFacetFilters = {}): SearchResult[] {
  return results.filter((result) => {
    if (filters.types?.length && !filters.types.includes(result.type)) return false;
    if (filters.entities?.length && !filters.entities.some((entity) => result.entities.includes(entity))) {
      return false;
    }
    if (filters.breadcrumbs?.length && !filters.breadcrumbs.some((item) => result.breadcrumbs.includes(item))) {
      return false;
    }
    return true;
  });
}

function parseListParam(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseSearchFilters(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): SearchFacetFilters {
  const getParam = (key: string): string | null => {
    if (params instanceof URLSearchParams) return params.get(key);
    const value = params[key];
    if (Array.isArray(value)) return value.join(",");
    return value ?? null;
  };

  return {
    types: parseListParam(getParam("type")) as SearchDocumentType[],
    entities: parseListParam(getParam("entity")),
    breadcrumbs: parseListParam(getParam("breadcrumb")),
  };
}

export const searchFacetService = {
  buildSearchFacets,
  applySearchFacets,
  parseSearchFilters,
};
