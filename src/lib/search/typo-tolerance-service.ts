import { queryNormalizationService } from "@/lib/search/query-normalization-service";
import { searchStore } from "@/lib/search/search-store";

type Suggestion = {
  suggestion: string;
  distance: number;
  confidence: "low" | "medium" | "high";
};

function levenshteinDistance(left: string, right: string): number {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));

  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let col = 0; col < cols; col += 1) matrix[0][col] = col;

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
}

function confidenceFromDistance(distance: number, length: number): Suggestion["confidence"] {
  if (distance <= 1) return "high";
  if (distance <= 2 && length >= 6) return "medium";
  return "low";
}

function buildDictionary(): string[] {
  const dictionary = new Set<string>();
  for (const document of searchStore.listDocuments()) {
    dictionary.add(queryNormalizationService.normalizeSearchQuery(document.title));
    document.entities.forEach((entity) => dictionary.add(queryNormalizationService.normalizeSearchQuery(entity)));
  }
  return [...dictionary].filter(Boolean);
}

function findSuggestions(query: string, limit = 3): Suggestion[] {
  const normalized = queryNormalizationService.normalizeSearchQuery(query);
  if (!normalized) return [];

  return buildDictionary()
    .map((candidate) => {
      const distance = levenshteinDistance(normalized, candidate);
      return {
        suggestion: candidate,
        distance,
        confidence: confidenceFromDistance(distance, normalized.length),
      } satisfies Suggestion;
    })
    .filter((item) => item.distance <= Math.max(2, Math.floor(normalized.length / 4)))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

export function applySafeQueryCorrection(query: string): { correctedQuery: string; applied: boolean; confidence: Suggestion["confidence"] } {
  const normalized = queryNormalizationService.normalizeSearchQuery(query);
  const suggestions = findSuggestions(normalized, 1);
  const top = suggestions[0];
  if (!top) return { correctedQuery: normalized, applied: false, confidence: "low" };
  if (top.confidence !== "high") return { correctedQuery: normalized, applied: false, confidence: top.confidence };
  if (top.suggestion === normalized) return { correctedQuery: normalized, applied: false, confidence: "high" };
  return { correctedQuery: top.suggestion, applied: true, confidence: top.confidence };
}

export const typoToleranceService = {
  levenshteinDistance,
  buildDictionary,
  findSuggestions,
  applySafeQueryCorrection,
};
