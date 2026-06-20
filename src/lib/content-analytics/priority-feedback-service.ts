import type { ContentPerformanceSnapshot } from "@/types/content-analytics";
import type { ContentPriorityLevel } from "@/types/content-prioritization";
import { priorityScoringWeights } from "@/data/priority-scoring-rules";
import { getActiveConfidencePreset } from "@/data/content-analytics-confidence-rules";
import { cmsPriorityIntegration } from "@/lib/content-prioritization/cms-priority-integration";
import { contentRepository } from "@/lib/content-cms/content-repository";

export type PriorityPerformanceComparison = {
  contentItemId: string;
  predictedPriority: ContentPriorityLevel;
  actualLeads: number | null;
  actualQualifiedLeads: number | null;
  actualPageViews: number | null;
  performanceTier: "overperforming" | "expected" | "underperforming" | "insufficient-data";
};

export type ScoringWeightRecommendation = {
  factor: keyof typeof priorityScoringWeights;
  currentWeight: number;
  suggestedWeight: number;
  rationale: string;
  sampleSize: number;
  confidence: "low" | "medium" | "high";
  expectedImpact: "low" | "medium" | "high";
  risk: "low" | "medium" | "high";
  requiresManualApproval: true;
};

function performanceTier(
  priority: ContentPriorityLevel,
  leads: number | null,
  qualified: number | null,
): PriorityPerformanceComparison["performanceTier"] {
  const preset = getActiveConfidencePreset();
  if ((leads ?? 0) < preset.minimumLeads) return "insufficient-data";

  const score = (qualified ?? 0) * 2 + (leads ?? 0);
  const expectedMin =
    priority === "P1" ? 5 : priority === "P2" ? 3 : priority === "P3" ? 1 : 0;

  if (score >= expectedMin * 2) return "overperforming";
  if (score >= expectedMin) return "expected";
  return "underperforming";
}

export async function comparePriorityWithPerformance(
  snapshots: ContentPerformanceSnapshot[],
): Promise<PriorityPerformanceComparison[]> {
  const results: PriorityPerformanceComparison[] = [];

  for (const snapshot of snapshots) {
    const item = await contentRepository.getContentById(snapshot.contentItemId);
    const cached = cmsPriorityIntegration.getCachedScore(snapshot.contentItemId);
    const priority = cached?.level ?? item?.seo.priority ?? "P5";

    results.push({
      contentItemId: snapshot.contentItemId,
      predictedPriority: priority,
      actualLeads: snapshot.conversions.leads ?? null,
      actualQualifiedLeads: snapshot.conversions.qualifiedLeads ?? null,
      actualPageViews: snapshot.traffic.pageViews ?? null,
      performanceTier: performanceTier(
        priority,
        snapshot.conversions.leads ?? null,
        snapshot.conversions.qualifiedLeads ?? null,
      ),
    });
  }

  return results;
}

export function calculatePriorityPredictionAccuracy(
  comparisons: PriorityPerformanceComparison[],
): number | null {
  const valid = comparisons.filter((c) => c.performanceTier !== "insufficient-data");
  if (valid.length === 0) return null;

  const matches = valid.filter((c) => {
    if (c.predictedPriority === "P1" || c.predictedPriority === "P2") {
      return c.performanceTier !== "underperforming";
    }
    if (c.predictedPriority === "P5") {
      return c.performanceTier === "overperforming" || c.performanceTier === "expected";
    }
    return c.performanceTier === "expected" || c.performanceTier === "overperforming";
  });

  return matches.length / valid.length;
}

export function findOverestimatedPriorityItems(
  comparisons: PriorityPerformanceComparison[],
): PriorityPerformanceComparison[] {
  return comparisons.filter(
    (c) =>
      (c.predictedPriority === "P1" || c.predictedPriority === "P2") &&
      c.performanceTier === "underperforming",
  );
}

export function findUnderestimatedPriorityItems(
  comparisons: PriorityPerformanceComparison[],
): PriorityPerformanceComparison[] {
  return comparisons.filter(
    (c) =>
      (c.predictedPriority === "P4" || c.predictedPriority === "P5") &&
      c.performanceTier === "overperforming",
  );
}

export function compareP1P2P3Performance(
  comparisons: PriorityPerformanceComparison[],
): Record<string, { count: number; avgLeads: number | null; avgQualified: number | null }> {
  const levels = ["P1", "P2", "P3"] as const;
  const result: Record<string, { count: number; avgLeads: number | null; avgQualified: number | null }> = {};

  for (const level of levels) {
    const items = comparisons.filter((c) => c.predictedPriority === level);
    const leadSum = items.reduce((acc, i) => acc + (i.actualLeads ?? 0), 0);
    const qualSum = items.reduce((acc, i) => acc + (i.actualQualifiedLeads ?? 0), 0);
    result[level] = {
      count: items.length,
      avgLeads: items.length ? leadSum / items.length : null,
      avgQualified: items.length ? qualSum / items.length : null,
    };
  }

  return result;
}

export function analyzePriorityFactors(
  comparisons: PriorityPerformanceComparison[],
): string[] {
  const insights: string[] = [];
  const over = findOverestimatedPriorityItems(comparisons);
  const under = findUnderestimatedPriorityItems(comparisons);

  if (over.length > 0) {
    insights.push(`${over.length} материалов с P1/P2 показывают слабые результаты`);
  }
  if (under.length > 0) {
    insights.push(`${under.length} материалов с P4/P5 превосходят ожидания`);
  }

  return insights;
}

export function recommendScoringWeightChanges(
  comparisons: PriorityPerformanceComparison[],
): ScoringWeightRecommendation[] {
  const preset = getActiveConfidencePreset();
  if (comparisons.length < preset.minimumComparableItems) return [];

  const over = findOverestimatedPriorityItems(comparisons);
  const under = findUnderestimatedPriorityItems(comparisons);
  const recommendations: ScoringWeightRecommendation[] = [];

  if (over.length > under.length) {
    recommendations.push({
      factor: "leadPotential",
      currentWeight: priorityScoringWeights.leadPotential,
      suggestedWeight: Math.max(0.1, priorityScoringWeights.leadPotential - 0.02),
      rationale: "P1/P2 материалы недополучают лидов относительно прогноза",
      sampleSize: comparisons.length,
      confidence: "low",
      expectedImpact: "medium",
      risk: "medium",
      requiresManualApproval: true,
    });
  }

  if (under.length > over.length) {
    recommendations.push({
      factor: "leadPotential",
      currentWeight: priorityScoringWeights.leadPotential,
      suggestedWeight: Math.min(0.3, priorityScoringWeights.leadPotential + 0.02),
      rationale: "P4/P5 материалы показывают неожиданно высокую конверсию",
      sampleSize: comparisons.length,
      confidence: "low",
      expectedImpact: "medium",
      risk: "medium",
      requiresManualApproval: true,
    });
  }

  return recommendations;
}

export function buildPriorityFeedbackReport(comparisons: PriorityPerformanceComparison[]): {
  accuracy: number | null;
  overestimated: PriorityPerformanceComparison[];
  underestimated: PriorityPerformanceComparison[];
  recommendations: ScoringWeightRecommendation[];
  insights: string[];
} {
  return {
    accuracy: calculatePriorityPredictionAccuracy(comparisons),
    overestimated: findOverestimatedPriorityItems(comparisons),
    underestimated: findUnderestimatedPriorityItems(comparisons),
    recommendations: recommendScoringWeightChanges(comparisons),
    insights: analyzePriorityFactors(comparisons),
  };
}

export const priorityFeedbackService = {
  comparePriorityWithPerformance,
  calculatePriorityPredictionAccuracy,
  findOverestimatedPriorityItems,
  findUnderestimatedPriorityItems,
  compareP1P2P3Performance,
  analyzePriorityFactors,
  recommendScoringWeightChanges,
  buildPriorityFeedbackReport,
};
