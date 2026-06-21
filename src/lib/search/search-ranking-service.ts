import type { SearchResult } from "@/types/search-result";

export type SearchRankingFactors = {
  relevanceScore: number;
  confidenceWeight: number;
  entityCoverageWeight: number;
  freshnessWeight: number;
  intentAlignmentWeight: number;
};

const CONFIDENCE_WEIGHT: Record<SearchResult["confidence"], number> = {
  low: 0.85,
  medium: 1,
  high: 1.12,
};

function getIntentAlignmentBoost(intent?: string): number {
  if (!intent) return 1;
  if (intent === "commercial" || intent === "transactional") return 1.06;
  if (intent === "comparison") return 1.03;
  return 1;
}

export function calculateSearchRankingScore(
  result: SearchResult,
  options: { intent?: string; now?: string } = {},
): { score: number; factors: SearchRankingFactors } {
  const relevanceScore = Math.max(result.score, 0);
  const confidenceWeight = CONFIDENCE_WEIGHT[result.confidence];
  const entityCoverageWeight = 1 + Math.min(result.entities.length, 6) * 0.015;
  const freshnessWeight = result.type === "editorial" ? 1.03 : 1;
  const intentAlignmentWeight = getIntentAlignmentBoost(options.intent);

  const finalScore =
    relevanceScore *
    confidenceWeight *
    entityCoverageWeight *
    freshnessWeight *
    intentAlignmentWeight;

  return {
    score: finalScore,
    factors: {
      relevanceScore,
      confidenceWeight,
      entityCoverageWeight,
      freshnessWeight,
      intentAlignmentWeight,
    },
  };
}

export function explainSearchRanking(
  result: SearchResult,
  options: { intent?: string } = {},
): string {
  const ranking = calculateSearchRankingScore(result, options);
  return [
    `relevance=${ranking.factors.relevanceScore.toFixed(3)}`,
    `confidence=${ranking.factors.confidenceWeight.toFixed(2)}`,
    `entityCoverage=${ranking.factors.entityCoverageWeight.toFixed(2)}`,
    `freshness=${ranking.factors.freshnessWeight.toFixed(2)}`,
    `intentAlignment=${ranking.factors.intentAlignmentWeight.toFixed(2)}`,
    `final=${ranking.score.toFixed(3)}`,
  ].join(" | ");
}

export function rankSearchResults(
  results: SearchResult[],
  options: { intent?: string } = {},
): SearchResult[] {
  return results
    .map((result) => {
      const ranking = calculateSearchRankingScore(result, options);
      return {
        ...result,
        score: ranking.score,
        explanation: [result.explanation, explainSearchRanking(result, options)].filter(Boolean).join(" | "),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export const searchRankingService = {
  calculateSearchRankingScore,
  rankSearchResults,
  explainSearchRanking,
};
