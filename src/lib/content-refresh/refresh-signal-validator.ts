import type { CMSContentItem } from "@/types/content-cms";
import type { ContentRefreshCandidate } from "@/types/content-refresh";
import type { ContentPerformanceSnapshot } from "@/types/content-analytics";
import { getActiveConfidencePreset } from "@/data/content-analytics-confidence-rules";

export type RefreshSignalContext = {
  contentItem?: CMSContentItem;
  snapshot?: ContentPerformanceSnapshot;
  previousSnapshot?: ContentPerformanceSnapshot;
  analyticsConfigChanged?: boolean;
  trackingInterrupted?: boolean;
  clusterDecline?: boolean;
  canonicalChanged?: boolean;
  seasonalPattern?: boolean;
};

export type RefreshSignalValidation = {
  valid: boolean;
  confidence: "low" | "medium" | "high";
  issues: string[];
  warnings: string[];
  observationDaysRecommended: number;
};

function daysSince(date?: string | null): number | null {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

export function validateRefreshSignal(
  candidate: ContentRefreshCandidate,
  context: RefreshSignalContext = {},
): RefreshSignalValidation {
  const issues: string[] = [];
  const warnings: string[] = [];
  const preset = getActiveConfidencePreset();
  const { snapshot, previousSnapshot, contentItem } = context;

  if (!snapshot) {
    issues.push("No analytics snapshot available");
  } else {
    const impressions = snapshot.search.impressions ?? 0;
    const pageViews = snapshot.traffic.pageViews ?? 0;
    if (impressions < preset.minimumImpressions && pageViews < preset.minimumPageViews) {
      issues.push("Insufficient traffic data for reliable signal");
    }
  }

  if (contentItem && !contentItem.indexing.indexable) {
    warnings.push("Page is not indexable — refresh may not affect search metrics");
  }

  if (snapshot?.search.indexed === false) {
    warnings.push("Page not indexed — investigate indexation before content refresh");
  }

  const publishedDays = daysSince(contentItem?.workflow.publishedAt ?? snapshot?.publication.publishedAt);
  if (publishedDays != null && publishedDays < 30) {
    issues.push("Page is too young for reliable decay signal");
  }

  if (context.seasonalPattern) {
    warnings.push("Possible seasonal decline — verify before urgent refresh");
  }

  if (context.analyticsConfigChanged) {
    issues.push("Analytics configuration changed during observation period");
  }

  if (context.trackingInterrupted) {
    issues.push("Tracking interruption detected");
  }

  if (context.canonicalChanged) {
    warnings.push("Canonical URL changed recently");
  }

  if (context.clusterDecline) {
    warnings.push("Cluster-wide decline detected — may not be page-specific");
  }

  if (!previousSnapshot) {
    warnings.push("No previous snapshot for trend comparison");
  }

  const confidence = calculateRefreshSignalConfidence(candidate, context);
  const valid = issues.length === 0 && confidence !== "low";

  return {
    valid,
    confidence,
    issues,
    warnings,
    observationDaysRecommended: recommendObservationPeriod(candidate),
  };
}

export function detectFalsePositiveSignals(
  candidate: ContentRefreshCandidate,
  context: RefreshSignalContext = {},
): string[] {
  const validation = validateRefreshSignal(candidate, context);
  const falsePositives: string[] = [...validation.issues];

  if (context.seasonalPattern) {
    falsePositives.push("Seasonal traffic pattern");
  }
  if (context.clusterDecline) {
    falsePositives.push("Cluster-wide metric decline");
  }
  if (context.trackingInterrupted) {
    falsePositives.push("Tracking gap or interruption");
  }
  if (candidate.evidence.every((e) => e.currentValue == null)) {
    falsePositives.push("No measurable metric values in evidence");
  }

  return falsePositives;
}

export function calculateRefreshSignalConfidence(
  candidate: ContentRefreshCandidate,
  context: RefreshSignalContext = {},
): "low" | "medium" | "high" {
  let score = 0;
  const preset = getActiveConfidencePreset();

  const evidenceWithValues = candidate.evidence.filter((e) => e.currentValue != null);
  if (evidenceWithValues.length >= 3) score += 2;
  else if (evidenceWithValues.length >= 1) score += 1;

  if (context.snapshot) {
    if ((context.snapshot.search.impressions ?? 0) >= preset.minimumImpressions) score += 2;
    if ((context.snapshot.traffic.pageViews ?? 0) >= preset.minimumPageViews) score += 1;
    if ((context.snapshot.conversions.leads ?? 0) >= preset.minimumLeads) score += 1;
  }

  if (context.previousSnapshot) score += 1;
  if (candidate.priority.confidence === "high") score += 1;

  if (context.analyticsConfigChanged || context.trackingInterrupted) score -= 3;
  if (context.seasonalPattern || context.clusterDecline) score -= 2;

  if (score >= 5) return "high";
  if (score >= 2) return "medium";
  return "low";
}

export function explainRefreshSignal(candidate: ContentRefreshCandidate): string {
  const parts = [
    `Reasons: ${candidate.reasons.join(", ")}`,
    `Priority: ${candidate.priority.level} (score ${candidate.priority.score})`,
    `Confidence: ${candidate.priority.confidence}`,
  ];

  for (const e of candidate.evidence.slice(0, 3)) {
    const change =
      e.changePercent != null ? ` (${e.changePercent > 0 ? "+" : ""}${e.changePercent.toFixed(1)}%)` : "";
    parts.push(`${e.metric}: ${e.currentValue ?? "n/a"}${change}`);
  }

  if (candidate.risks.length) parts.push(`Risks: ${candidate.risks.join("; ")}`);
  return parts.join(". ");
}

export function recommendObservationPeriod(candidate: ContentRefreshCandidate): number {
  if (candidate.reasons.includes("content-decay")) return 28;
  if (candidate.reasons.includes("conversion-decline")) return 21;
  if (candidate.reasons.includes("high-impressions-low-ctr")) return 14;
  if (candidate.priority.confidence === "low") return 30;
  return 21;
}

export const refreshSignalValidator = {
  validateRefreshSignal,
  detectFalsePositiveSignals,
  calculateRefreshSignalConfidence,
  explainRefreshSignal,
  recommendObservationPeriod,
};
