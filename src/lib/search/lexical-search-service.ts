import type { SearchResult } from "@/types/search-result";
import { lexicalIndexService } from "@/lib/search/lexical-index-service";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";
import { searchStore } from "@/lib/search/search-store";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function calculateLexicalScore(baseScore: number, matchedTerms: string[], matchedFields: string[]): number {
  const termBoost = 1 + Math.min(matchedTerms.length, 6) * 0.08;
  const fieldBoost = matchedFields.includes("title") ? 1.15 : matchedFields.includes("headings") ? 1.08 : 1;
  return baseScore * termBoost * fieldBoost;
}

export function highlightSearchMatches(text: string, terms: string[]): string {
  const safeText = escapeHtml(text);
  if (terms.length === 0) return safeText;

  const escapedTerms = terms
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (escapedTerms.length === 0) return safeText;
  const pattern = new RegExp(`(${escapedTerms.join("|")})`, "gi");
  return safeText.replace(pattern, "<mark>$1</mark>");
}

export function searchLexical(query: string, limit = 20): SearchResult[] {
  const matches = lexicalIndexService.searchLexical(query, limit * 2);
  const normalizedQueryTerms = queryNormalizationService.normalizeSearchQuery(query).split(/\s+/).filter(Boolean);

  const results: SearchResult[] = [];

  for (const match of matches) {
    const chunk = searchStore.getChunk(match.chunkId);
    const document = chunk ? searchStore.getDocument(chunk.documentId) : undefined;
    if (!chunk || !document) continue;

    const matchedFields: string[] = [];
    const normalizedTitle = queryNormalizationService.normalizeSearchQuery(document.title);
    const normalizedChunkTitle = queryNormalizationService.normalizeSearchQuery(chunk.title);
    const normalizedText = queryNormalizationService.normalizeSearchQuery(chunk.text);

    if (normalizedQueryTerms.some((term) => normalizedTitle.includes(term))) matchedFields.push("title");
    if (normalizedQueryTerms.some((term) => normalizedChunkTitle.includes(term))) matchedFields.push("headings");
    if (normalizedQueryTerms.some((term) => normalizedText.includes(term))) matchedFields.push("content");

    const score = calculateLexicalScore(match.score, match.matchedTerms, matchedFields);
    const snippetSource = match.snippet || chunk.text.slice(0, 220);

    results.push({
      documentId: document.id,
      contentItemId: document.contentItemId,
      title: document.title,
      description: document.description,
      snippet: highlightSearchMatches(snippetSource, match.matchedTerms),
      canonicalUrl: document.canonicalUrl,
      type: document.type,
      entities: document.entities,
      breadcrumbs: [...document.clusterIds, ...document.entityNodeIds],
      matchedFields,
      score,
      confidence: score >= 1.5 ? "high" : score >= 0.8 ? "medium" : "low",
      explanation: `lexical score=${score.toFixed(3)}`,
      highlights: [
        {
          field: "snippet",
          fragments: [highlightSearchMatches(snippetSource, match.matchedTerms)],
        },
      ],
    });
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

export const lexicalSearchService = {
  searchLexical,
  calculateLexicalScore,
  highlightSearchMatches,
  escapeHtml,
};
