import { recommendationAnalytics } from "@/lib/recommendations/recommendation-analytics";
import { recommendationStore } from "@/lib/recommendations/recommendation-store";
import { recommendationDiversityService } from "@/lib/recommendations/recommendation-diversity-service";
import type { RecommendationItem } from "@/types/recommendation";

export type RecommendationQualityReport = {
  period: { from: string; to: string };
  requests: number;
  generated: number;
  viewed: number;
  clicked: number;
  ctr: number;
  dismissRate: number;
  negativeFeedbackRate: number;
  fallbackRate: number;
  emptyRate: number;
  averageLatencyMs: number;
  diversity: number;
  coverage: number;
};

function eventsInPeriod(period: { from: string; to: string }) {
  const from = new Date(period.from).getTime();
  const to = new Date(period.to).getTime();
  return recommendationAnalytics.listEvents(5000).filter((e) => {
    const ts = new Date(e.occurredAt).getTime();
    return ts >= from && ts <= to;
  });
}

export function calculateRecommendationQuality(period: { from: string; to: string }): RecommendationQualityReport {
  const events = eventsInPeriod(period);
  const requests = events.filter((e) => e.eventName === "recommendation_requested").length;
  const generated = events.filter((e) => e.eventName === "recommendation_generated").length;
  const viewed = events.filter((e) => e.eventName === "recommendation_viewed").length;
  const clicked = events.filter((e) => e.eventName === "recommendation_clicked").length;
  const dismissed = events.filter((e) => e.eventName === "recommendation_dismissed").length;
  const negative = recommendationStore.listFeedback().filter((f) => f.feedbackType === "not-relevant").length;
  const fallbacks = events.filter((e) => e.eventName === "recommendation_fallback_used").length;
  const failed = events.filter((e) => e.eventName === "recommendation_generation_failed").length;
  const latencies = events
    .map((e) => e.payload.latencyMs)
    .filter((v): v is number => typeof v === "number");

  return {
    period,
    requests,
    generated,
    viewed,
    clicked,
    ctr: viewed > 0 ? clicked / viewed : 0,
    dismissRate: viewed > 0 ? dismissed / viewed : 0,
    negativeFeedbackRate: viewed > 0 ? negative / viewed : 0,
    fallbackRate: requests > 0 ? fallbacks / requests : 0,
    emptyRate: requests > 0 ? failed / requests : 0,
    averageLatencyMs: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
    diversity: 0.5,
    coverage: generated > 0 ? viewed / generated : 0,
  };
}

export function calculatePlacementQuality(placement: string, period: { from: string; to: string }) {
  const events = eventsInPeriod(period).filter((e) => e.payload.placement === placement);
  const viewed = events.filter((e) => e.eventName === "recommendation_viewed").length;
  const clicked = events.filter((e) => e.eventName === "recommendation_clicked").length;
  return { placement, viewed, clicked, ctr: viewed > 0 ? clicked / viewed : 0 };
}

export function detectLowQualityRecommendations(period: { from: string; to: string }): string[] {
  const feedback = recommendationStore.listFeedback().filter((f) => f.feedbackType === "not-relevant");
  return [...new Set(feedback.map((f) => f.recommendationId))];
}

export function detectHighDismissalRecommendations(period: { from: string; to: string }): string[] {
  const events = eventsInPeriod(period).filter((e) => e.eventName === "recommendation_dismissed");
  const counts = new Map<string, number>();
  for (const e of events) {
    const id = String(e.payload.recommendationId ?? "");
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, c]) => c >= 3).map(([id]) => id);
}

export function detectRepetitionProblems(period: { from: string; to: string }): number {
  return recommendationStore.listExposures().filter((e) => e.count >= 5).length;
}

export function detectLowDiversity(items: RecommendationItem[]): boolean {
  return recommendationDiversityService.calculateRecommendationDiversity(items) < 0.3;
}

export function detectCoverageGaps(period: { from: string; to: string }): string[] {
  const report = calculateRecommendationQuality(period);
  return report.emptyRate > 0.2 ? ["high-empty-rate"] : [];
}

export function recommendQualityActions(period: { from: string; to: string }): string[] {
  const report = calculateRecommendationQuality(period);
  const actions: string[] = [];
  if (report.ctr < 0.02) actions.push("review-ranking-weights");
  if (report.dismissRate > 0.15) actions.push("review-explanations");
  if (report.fallbackRate > 0.3) actions.push("improve-candidate-coverage");
  if (report.diversity < 0.3) actions.push("increase-diversity-rules");
  return actions;
}

export const recommendationQualityService = {
  calculateRecommendationQuality,
  calculatePlacementQuality,
  detectLowQualityRecommendations,
  detectHighDismissalRecommendations,
  detectRepetitionProblems,
  detectLowDiversity,
  detectCoverageGaps,
  recommendQualityActions,
};
