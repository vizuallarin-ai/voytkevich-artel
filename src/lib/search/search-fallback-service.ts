import type { SearchResult } from "@/types/search-result";
import { lexicalSearchService } from "@/lib/search/lexical-search-service";
import { hybridRetrievalService } from "@/lib/search/hybrid-retrieval-service";
import { searchSuggestionService } from "@/lib/search/search-suggestion-service";
import { zeroResultsService } from "@/lib/search/zero-results-service";

export type SearchFallbackContext = {
  vectorAvailable: boolean;
  aiAvailable: boolean;
  graphAvailable: boolean;
};

export type SearchFallbackResponse = {
  results: SearchResult[];
  usedFallback: boolean;
  strategy:
    | "hybrid"
    | "lexical-only"
    | "lexical-corrected"
    | "suggestions-only"
    | "no-results";
  suggestions: string[];
};

function runLexicalFallback(query: string, limit: number): SearchFallbackResponse {
  const lexicalResults = lexicalSearchService.searchLexical(query, limit);
  if (lexicalResults.length > 0) {
    return {
      results: lexicalResults,
      usedFallback: true,
      strategy: "lexical-only",
      suggestions: [],
    };
  }

  const corrected = zeroResultsService.searchWithCorrection(query, limit);
  if (corrected.results.length > 0) {
    return {
      results: corrected.results,
      usedFallback: true,
      strategy: "lexical-corrected",
      suggestions: corrected.correction ? [corrected.correction] : [],
    };
  }

  const suggestions = searchSuggestionService.getSearchSuggestions(query, 8);
  return {
    results: [],
    usedFallback: true,
    strategy: suggestions.length > 0 ? "suggestions-only" : "no-results",
    suggestions,
  };
}

export function searchWithFallbacks(
  query: string,
  context: SearchFallbackContext,
  limit = 20,
): SearchFallbackResponse {
  if (context.vectorAvailable && context.aiAvailable && context.graphAvailable) {
    return {
      results: hybridRetrievalService.searchHybrid(query, { limit }),
      usedFallback: false,
      strategy: "hybrid",
      suggestions: [],
    };
  }

  if (context.vectorAvailable) {
    const results = hybridRetrievalService.searchHybrid(query, { limit, mode: "balanced" });
    if (results.length > 0) {
      return {
        results,
        usedFallback: true,
        strategy: "hybrid",
        suggestions: [],
      };
    }
  }

  return runLexicalFallback(query, limit);
}

export const searchFallbackService = {
  searchWithFallbacks,
};
