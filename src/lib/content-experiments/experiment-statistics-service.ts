import type { ContentExperiment } from "@/types/content-experiment";
import { experimentStore } from "@/lib/content-experiments/experiment-store";
import { refreshAnalytics } from "@/lib/content-refresh/refresh-analytics";

export type ExperimentOutcome =
  | "winner"
  | "loser"
  | "neutral"
  | "inconclusive"
  | "insufficient-data"
  | "guardrail-violation";

export function calculateExperimentSample(experiment: ContentExperiment): number | null {
  const metrics = experimentStore.getMetrics(experiment.id);
  return metrics?.exposures ?? metrics?.sample ?? null;
}

export function calculateConversionUplift(experiment: ContentExperiment): number | null {
  const metrics = experimentStore.getMetrics(experiment.id);
  if (!metrics) return null;

  const controlRate = metrics.controlConversionRate ?? null;
  const variantRate = metrics.variantConversionRate ?? null;
  if (controlRate == null || variantRate == null || controlRate === 0) return null;

  return ((variantRate - controlRate) / controlRate) * 100;
}

export function calculateRelativeChange(experiment: ContentExperiment): number | null {
  const metrics = experimentStore.getMetrics(experiment.id);
  if (!metrics) return null;

  const before = metrics.before ?? null;
  const after = metrics.after ?? null;
  if (before == null || after == null || before === 0) return null;

  return ((after - before) / before) * 100;
}

export function calculateConfidence(experiment: ContentExperiment): number | null {
  const sample = calculateExperimentSample(experiment);
  const minSample = experiment.minimumSample;
  if (sample == null || minSample == null) return null;
  if (sample < minSample) return null;

  const ratio = Math.min(sample / minSample, 1);
  return ratio * (experiment.confidenceThreshold ?? 0.95);
}

export function detectExperimentGuardrailViolation(experiment: ContentExperiment): string[] {
  const metrics = experimentStore.getMetrics(experiment.id);
  const violations: string[] = [];

  if (!metrics) return violations;

  for (const guardrail of experiment.guardrailMetrics) {
    const value = metrics[guardrail];
    if (guardrail === "search.indexed" && value === 0) {
      violations.push("Page lost indexability");
    }
    if (guardrail === "conversions.qualifiedLeads" && value != null && value < 0) {
      violations.push("Qualified leads declined");
    }
  }

  if (violations.length > 0) {
    refreshAnalytics.trackExperimentGuardrailViolated({
      experimentId: experiment.id,
      contentItemId: experiment.contentItemId,
      reason: violations.join(", "),
    });
  }

  return violations;
}

export function determineExperimentOutcome(experiment: ContentExperiment): ExperimentOutcome {
  const violations = detectExperimentGuardrailViolation(experiment);
  if (violations.length > 0) return "guardrail-violation";

  const sample = calculateExperimentSample(experiment);
  if (sample == null || (experiment.minimumSample != null && sample < experiment.minimumSample)) {
    return "insufficient-data";
  }

  const confidence = calculateConfidence(experiment);
  if (confidence == null || confidence < (experiment.confidenceThreshold ?? 0.95) * 0.8) {
    return "inconclusive";
  }

  const uplift = calculateConversionUplift(experiment) ?? calculateRelativeChange(experiment);
  if (uplift == null) return "inconclusive";
  if (uplift > 5) return "winner";
  if (uplift < -5) return "loser";
  return "neutral";
}

export function explainExperimentLimitations(experiment: ContentExperiment): string[] {
  const limitations: string[] = [];
  const sample = calculateExperimentSample(experiment);

  if (sample == null) {
    limitations.push("No sample data collected yet");
  } else if (experiment.minimumSample != null && sample < experiment.minimumSample) {
    limitations.push(`Sample ${sample} below minimum ${experiment.minimumSample}`);
  }

  if (["title", "description"].includes(experiment.type)) {
    limitations.push("SEO experiments require extended observation — short-term results may mislead");
  }

  if (!experiment.audienceAllocation) {
    limitations.push("No client-side split — using time-based or before/after comparison");
  }

  limitations.push("Correlation does not imply causation — review with analyst");

  return limitations;
}

export const experimentStatisticsService = {
  calculateExperimentSample,
  calculateConversionUplift,
  calculateRelativeChange,
  calculateConfidence,
  detectExperimentGuardrailViolation,
  determineExperimentOutcome,
  explainExperimentLimitations,
};
