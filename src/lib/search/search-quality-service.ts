import { searchStore } from "@/lib/search/search-store";

export type SearchQualityScore = {
  score: number;
  totalQueries: number;
  zeroResultRate: number;
  correctionRate: number;
  avgLatencyMs: number;
  feedbackNegativeRate: number;
};

function safeRate(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}

export function calculateSearchQuality(): SearchQualityScore {
  const queries = searchStore.listQueryLogs(5000);
  const totalQueries = queries.length;
  const zeroResults = queries.filter((entry) => entry.resultCount === 0).length;
  const corrected = queries.filter((entry) => Boolean(entry.correctionApplied)).length;
  const avgLatencyMs = totalQueries > 0
    ? queries.reduce((sum, entry) => sum + (entry.latencyMs ?? 0), 0) / totalQueries
    : 0;

  const feedback = searchStore.listFeedback();
  const negativeFeedback = feedback.filter((item) =>
    item.feedbackType === "not-helpful" || item.feedbackType === "wrong-result" || item.feedbackType === "missing-result",
  ).length;

  const zeroResultRate = safeRate(zeroResults, totalQueries);
  const correctionRate = safeRate(corrected, totalQueries);
  const feedbackNegativeRate = safeRate(negativeFeedback, Math.max(feedback.length, 1));

  const normalizedLatencyPenalty = Math.min(avgLatencyMs / 1500, 1);
  const score = Math.max(
    0,
    100 -
      zeroResultRate * 45 -
      correctionRate * 15 -
      feedbackNegativeRate * 25 -
      normalizedLatencyPenalty * 15,
  );

  return {
    score: Number(score.toFixed(2)),
    totalQueries,
    zeroResultRate: Number((zeroResultRate * 100).toFixed(2)),
    correctionRate: Number((correctionRate * 100).toFixed(2)),
    avgLatencyMs: Number(avgLatencyMs.toFixed(2)),
    feedbackNegativeRate: Number((feedbackNegativeRate * 100).toFixed(2)),
  };
}

export const searchQualityService = {
  calculateSearchQuality,
};
