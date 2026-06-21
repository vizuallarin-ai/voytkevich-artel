import { randomUUID } from "crypto";
import type { ZeroResultRecord } from "@/types/search-index";
import type { SearchResult } from "@/types/search-result";
import { hybridRetrievalService } from "@/lib/search/hybrid-retrieval-service";
import { typoToleranceService } from "@/lib/search/typo-tolerance-service";
import { searchSuggestionService } from "@/lib/search/search-suggestion-service";
import { searchSynonymService } from "@/lib/search/search-synonym-service";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";
import { queryIntentService } from "@/lib/search/query-intent-service";
import { searchStore } from "@/lib/search/search-store";
import type { SearchFacetFilters } from "@/lib/search/search-facet-service";

export function detectZeroResultQuery(results: SearchResult[]): boolean {
  return results.length === 0;
}

export function searchWithCorrection(query: string, limit = 20): {
  correction?: string;
  results: SearchResult[];
} {
  const correction = typoToleranceService.applySafeQueryCorrection(query);
  if (!correction.applied) {
    return { results: hybridRetrievalService.searchHybrid(query, { limit }) };
  }
  return {
    correction: correction.correctedQuery,
    results: hybridRetrievalService.searchHybrid(correction.correctedQuery, { limit }),
  };
}

export function searchWithRelaxedFilters(
  query: string,
  filters: SearchFacetFilters = {},
  limit = 20,
): SearchResult[] {
  const hasFilters = Boolean(filters.types?.length || filters.entities?.length || filters.breadcrumbs?.length);
  const mode = hasFilters ? "balanced" : "semantic-first";
  return hybridRetrievalService.searchHybrid(query, { limit, mode });
}

export function recommendAlternativeQueries(query: string): string[] {
  const normalized = queryNormalizationService.normalizeSearchQuery(query);
  const suggestions = searchSuggestionService.getSearchSuggestions(normalized, 8);
  const synonyms = searchSynonymService.expandSynonyms([normalized]).slice(0, 6);
  return [...new Set([...suggestions, ...synonyms])].filter((candidate) => candidate !== normalized).slice(0, 8);
}

function inferCommercialRelevance(query: string): ZeroResultRecord["commercialRelevance"] {
  const intent = queryIntentService.detectQueryIntent(query);
  if (intent.intent === "commercial" || intent.intent === "project-selection") return "high";
  if (intent.intent === "informational" || intent.intent === "comparison") return "medium";
  return "low";
}

export function createZeroResultAnalyticsRecord(query: string, entities: string[] = []): ZeroResultRecord {
  const normalizedQuery = queryNormalizationService.normalizeSearchQuery(query);
  const existing = searchStore.getZeroResultRecordByQuery(normalizedQuery);
  const now = new Date().toISOString();
  const record: ZeroResultRecord = existing
    ? {
        ...existing,
        frequency: existing.frequency + 1,
        entities: [...new Set([...existing.entities, ...entities])],
        lastSeenAt: now,
      }
    : {
        id: randomUUID(),
        normalizedQuery,
        rawQuery: query,
        frequency: 1,
        entities,
        commercialRelevance: inferCommercialRelevance(query),
        status: "open",
        createdAt: now,
        lastSeenAt: now,
      };

  searchStore.upsertZeroResultRecord(record);
  return record;
}

export const zeroResultsService = {
  detectZeroResultQuery,
  searchWithCorrection,
  searchWithRelaxedFilters,
  recommendAlternativeQueries,
  createZeroResultAnalyticsRecord,
};
