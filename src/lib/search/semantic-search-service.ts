import type { SearchResult } from "@/types/search-result";
import { vectorIndexService } from "@/lib/search/vector-index-service";
import { searchStore } from "@/lib/search/search-store";

const MIN_SIMILARITY = 0.25;

export function excludeLowSimilarityResults(
  results: Array<{ score: number }>,
  threshold = MIN_SIMILARITY,
): Array<{ score: number }> {
  return results.filter((result) => result.score >= threshold);
}

export function groupSemanticResultsByDocument(results: SearchResult[]): SearchResult[] {
  const grouped = new Map<string, SearchResult>();
  for (const result of results) {
    const existing = grouped.get(result.documentId);
    if (!existing || result.score > existing.score) {
      grouped.set(result.documentId, result);
    }
  }
  return [...grouped.values()].sort((a, b) => b.score - a.score);
}

export function searchSemantic(query: string, limit = 20): SearchResult[] {
  const candidates = vectorIndexService.searchSemantic(query, limit * 4);
  const filtered = excludeLowSimilarityResults(candidates) as typeof candidates;

  const mapped: SearchResult[] = [];
  for (const candidate of filtered) {
    const chunk = searchStore.getChunk(candidate.chunkId);
    const document = chunk ? searchStore.getDocument(chunk.documentId) : undefined;
    if (!chunk || !document) continue;
    mapped.push({
      documentId: document.id,
      contentItemId: document.contentItemId,
      title: document.title,
      description: document.description,
      snippet: chunk.text.slice(0, 240),
      canonicalUrl: document.canonicalUrl,
      type: document.type,
      entities: document.entities,
      breadcrumbs: [...document.clusterIds, ...document.entityNodeIds],
      matchedFields: ["semantic"],
      score: candidate.score,
      confidence: candidate.score >= 0.6 ? "high" : candidate.score >= 0.4 ? "medium" : "low",
      explanation: `semantic similarity=${candidate.score.toFixed(3)}`,
    });
  }

  return groupSemanticResultsByDocument(mapped).slice(0, limit);
}

export const semanticSearchService = {
  searchSemantic,
  groupSemanticResultsByDocument,
  excludeLowSimilarityResults,
};
