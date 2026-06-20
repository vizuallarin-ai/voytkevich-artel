import type { ContentExperiment, ContentExperimentType } from "@/types/content-experiment";
import { experimentStore, createExperimentId } from "@/lib/content-experiments/experiment-store";
import { refreshAnalytics } from "@/lib/content-refresh/refresh-analytics";

export type CreateExperimentInput = {
  contentItemId: string;
  type: ContentExperimentType;
  hypothesis: string;
  baselineVersionId: string;
  variantVersionIds?: string[];
  primaryMetric?: string;
  risks?: string[];
};

export function createContentExperiment(input: CreateExperimentInput): ContentExperiment {
  const experiment: ContentExperiment = {
    id: createExperimentId(),
    contentItemId: input.contentItemId,
    type: input.type,
    status: "draft",
    hypothesis: input.hypothesis,
    baselineVersionId: input.baselineVersionId,
    variantVersionIds: input.variantVersionIds ?? [],
    primaryMetric: input.primaryMetric ?? definePrimaryMetric({ type: input.type } as ContentExperiment),
    secondaryMetrics: [],
    guardrailMetrics: defineGuardrailMetrics({ type: input.type } as ContentExperiment),
    minimumSample: null,
    confidenceThreshold: 0.95,
    risks: input.risks ?? [],
    createdAt: new Date().toISOString(),
    period: {},
  };

  experimentStore.save(experiment);
  refreshAnalytics.trackExperimentCreated({
    contentItemId: experiment.contentItemId,
    experimentId: experiment.id,
  });

  return experiment;
}

export function validateExperimentHypothesis(experiment: ContentExperiment): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!experiment.hypothesis.trim()) errors.push("Hypothesis is required");
  if (experiment.hypothesis.length < 20) errors.push("Hypothesis too short — describe expected outcome");
  return { valid: errors.length === 0, errors };
}

export function validateExperimentIsolation(experiment: ContentExperiment): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  if (experiment.variantVersionIds.length > 1) {
    warnings.push("Multiple variants reduce isolation — prefer single change");
  }
  if (experiment.type === "content-structure" && experiment.variantVersionIds.length > 0) {
    warnings.push("Structure experiments should change one element at a time");
  }
  return { valid: warnings.length === 0, warnings };
}

export function definePrimaryMetric(experiment: ContentExperiment): string {
  switch (experiment.type) {
    case "title":
    case "description":
      return "search.ctr";
    case "cta":
      return "conversions.leads";
    case "internal-linking":
      return "internal-link.clicks";
    case "content-depth":
    case "faq":
      return "traffic.pageViews";
    default:
      return "traffic.pageViews";
  }
}

export function defineGuardrailMetrics(experiment: ContentExperiment): string[] {
  return [
    "search.clicks",
    "search.indexed",
    "conversions.qualifiedLeads",
    "indexability",
  ];
}

export function calculateMinimumSample(
  experiment: ContentExperiment,
  context: { baselineConversionRate?: number | null } = {},
): number | null {
  const rate = context.baselineConversionRate;
  if (rate == null) return null;
  if (rate <= 0) return 1000;
  return Math.ceil(16 / (rate * rate));
}

export function recommendExperimentDuration(
  experiment: ContentExperiment,
  context: { dailyTraffic?: number | null } = {},
): number | null {
  if (experiment.type === "title" || experiment.type === "description") return 28;
  if (experiment.type === "cta") return 14;
  if ((context.dailyTraffic ?? 0) < 50) return 42;
  return 21;
}

export function detectExperimentConflicts(
  experiment: ContentExperiment,
  activeExperiments: ContentExperiment[],
): string[] {
  return activeExperiments
    .filter(
      (e) =>
        e.id !== experiment.id &&
        e.contentItemId === experiment.contentItemId &&
        e.status === "running",
    )
    .map((e) => `Conflicts with running experiment ${e.id} (${e.type})`);
}

export function approveExperiment(experimentId: string): ContentExperiment | null {
  const experiment = experimentStore.get(experimentId);
  if (!experiment) return null;

  const hypothesisCheck = validateExperimentHypothesis(experiment);
  if (!hypothesisCheck.valid) return null;
  if (!experiment.primaryMetric) return null;

  const updated = { ...experiment, status: "approved" as const };
  experimentStore.save(updated);
  return updated;
}

export function rejectExperiment(experimentId: string, reason: string): ContentExperiment | null {
  const experiment = experimentStore.get(experimentId);
  if (!experiment) return null;
  const updated = { ...experiment, status: "stopped" as const, risks: [...experiment.risks, reason] };
  experimentStore.save(updated);
  return updated;
}

export const experimentDesignService = {
  createContentExperiment,
  validateExperimentHypothesis,
  validateExperimentIsolation,
  definePrimaryMetric,
  defineGuardrailMetrics,
  calculateMinimumSample,
  recommendExperimentDuration,
  detectExperimentConflicts,
  approveExperiment,
  rejectExperiment,
};
