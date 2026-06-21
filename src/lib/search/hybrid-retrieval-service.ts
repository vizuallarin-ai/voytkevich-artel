import type { SearchMode } from "@/types/search-query";
import type { SearchResult } from "@/types/search-result";
import { lexicalSearchService } from "@/lib/search/lexical-search-service";
import { semanticSearchService } from "@/lib/search/semantic-search-service";
import { entityAwareSearchService } from "@/lib/search/entity-aware-search-service";
import { queryIntentService } from "@/lib/search/query-intent-service";

type RankedResult = SearchResult & { _rrfScore?: number };

function rrfScore(rank: number, k = 60): number {
  return 1 / (k + rank + 1);
}

export function combineLexicalAndSemanticResults(
  lexical: SearchResult[],
  semantic: SearchResult[],
  k = 60,
): SearchResult[] {
  const combined = new Map<string, RankedResult>();

  lexical.forEach((result, index) => {
    const key = result.documentId;
    const existing = combined.get(key) ?? { ...result, _rrfScore: 0 };
    const score = (existing._rrfScore ?? 0) + rrfScore(index, k);
    combined.set(key, { ...existing, ...result, _rrfScore: score });
  });

  semantic.forEach((result, index) => {
    const key = result.documentId;
    const existing = combined.get(key) ?? { ...result, _rrfScore: 0 };
    const score = (existing._rrfScore ?? 0) + rrfScore(index, k);
    combined.set(key, {
      ...existing,
      snippet: existing.snippet.length >= result.snippet.length ? existing.snippet : result.snippet,
      matchedFields: [...new Set([...existing.matchedFields, ...result.matchedFields])],
      _rrfScore: score,
    });
  });

  return [...combined.values()]
    .map((result) => ({
      ...result,
      score: result._rrfScore ?? result.score,
      explanation: [result.explanation, "rrf"].filter(Boolean).join(" | "),
    }))
    .sort((a, b) => b.score - a.score);
}

export function applyBusinessReranking(results: SearchResult[]): SearchResult[] {
  return results
    .map((result) => {
      let multiplier = 1;
      if (result.type === "service") multiplier += 0.05;
      if (result.type === "project" || result.type === "programmatic") multiplier += 0.03;
      if (result.confidence === "high") multiplier += 0.02;
      return {
        ...result,
        score: result.score * multiplier,
        explanation: [result.explanation, "business-rerank"].filter(Boolean).join(" | "),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function deduplicateSearchResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  const deduped: SearchResult[] = [];
  for (const result of results) {
    if (seen.has(result.canonicalUrl)) continue;
    seen.add(result.canonicalUrl);
    deduped.push(result);
  }
  return deduped;
}

function runByMode(query: string, mode: SearchMode, limit: number): { lexical: SearchResult[]; semantic: SearchResult[] } {
  switch (mode) {
    case "lexical-first":
      return { lexical: lexicalSearchService.searchLexical(query, limit * 2), semantic: semanticSearchService.searchSemantic(query, limit) };
    case "semantic-first":
      return { lexical: lexicalSearchService.searchLexical(query, limit), semantic: semanticSearchService.searchSemantic(query, limit * 2) };
    case "entity-first":
      return { lexical: lexicalSearchService.searchLexical(query, limit * 2), semantic: semanticSearchService.searchSemantic(query, limit * 2) };
    case "project-search":
      return { lexical: lexicalSearchService.searchLexical(`${query} проект`, limit * 2), semantic: semanticSearchService.searchSemantic(query, limit) };
    case "informational-search":
      return { lexical: lexicalSearchService.searchLexical(`${query} как`, limit * 2), semantic: semanticSearchService.searchSemantic(query, limit * 2) };
    case "balanced":
    default:
      return { lexical: lexicalSearchService.searchLexical(query, limit * 2), semantic: semanticSearchService.searchSemantic(query, limit * 2) };
  }
}

export function searchHybrid(
  query: string,
  options: {
    limit?: number;
    mode?: SearchMode;
    applyRerank?: boolean;
  } = {},
): SearchResult[] {
  const limit = options.limit ?? 20;
  const mode = options.mode ?? "balanced";
  const { lexical, semantic } = runByMode(query, mode, limit);

  let combined = combineLexicalAndSemanticResults(lexical, semantic);

  if (mode === "entity-first") {
    const entities = entityAwareSearchService.resolveQueryEntities(query);
    combined = entityAwareSearchService.boostExactEntityMatches(combined, entities);
  }

  const intent = queryIntentService.detectQueryIntent(query);
  if (intent.intent === "commercial" || intent.intent === "project-selection") {
    combined = applyBusinessReranking(combined);
  } else if (options.applyRerank !== false) {
    combined = applyBusinessReranking(combined);
  }

  return deduplicateSearchResults(combined).slice(0, limit);
}

export const hybridRetrievalService = {
  searchHybrid,
  combineLexicalAndSemanticResults,
  applyBusinessReranking,
  deduplicateSearchResults,
};
