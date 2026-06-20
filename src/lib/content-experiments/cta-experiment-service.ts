import { createHash } from "crypto";
import type { ContentExperiment } from "@/types/content-experiment";
import { experimentStore } from "@/lib/content-experiments/experiment-store";
import { experimentDesignService } from "@/lib/content-experiments/experiment-design-service";
import { refreshAnalytics } from "@/lib/content-refresh/refresh-analytics";

export type CTAExperimentInput = {
  contentItemId: string;
  baselineVersionId: string;
  hypothesis: string;
  ctaText?: string;
  variantVersionId?: string;
};

export type CTAExposureEvent = {
  experimentId: string;
  sessionId: string;
  variantId: string;
};

export type CTAConversionEvent = {
  experimentId: string;
  sessionId: string;
  variantId: string;
  conversionType: string;
};

export function createCTAExperiment(input: CTAExperimentInput): ContentExperiment {
  return experimentDesignService.createContentExperiment({
    contentItemId: input.contentItemId,
    type: "cta",
    hypothesis: input.hypothesis,
    baselineVersionId: input.baselineVersionId,
    variantVersionIds: input.variantVersionId ? [input.variantVersionId] : [],
    primaryMetric: "conversions.leads",
  });
}

export function assignCTAVariant(
  session: { id: string },
  experiment: ContentExperiment,
): { variantId: string; isControl: boolean } {
  const hash = createHash("sha256")
    .update(`${session.id}:${experiment.id}`)
    .digest("hex");
  const bucket = parseInt(hash.slice(0, 8), 16) % 100;

  const controlWeight = experiment.audienceAllocation?.control ?? 50;
  const isControl = bucket < controlWeight;
  const variantId = isControl
    ? experiment.baselineVersionId
    : experiment.variantVersionIds[0] ?? experiment.baselineVersionId;

  experimentStore.setAssignment(session.id, experiment.id, variantId);
  return { variantId, isControl };
}

export function trackCTAExperimentExposure(event: CTAExposureEvent): void {
  experimentStore.recordMetrics(event.experimentId, {
    exposures: (experimentStore.getMetrics(event.experimentId)?.exposures ?? 0)! + 1,
  });
}

export function trackCTAExperimentConversion(event: CTAConversionEvent): void {
  const metrics = experimentStore.getMetrics(event.experimentId) ?? {};
  experimentStore.recordMetrics(event.experimentId, {
    ...metrics,
    conversions: (metrics.conversions ?? 0)! + 1,
  });
}

export function calculateCTAExperimentResult(experiment: ContentExperiment): {
  outcome: "winner" | "loser" | "neutral" | "inconclusive" | "insufficient-data";
  uplift: number | null;
} {
  const metrics = experimentStore.getMetrics(experiment.id);
  if (!metrics || metrics.exposures == null || metrics.exposures < (experiment.minimumSample ?? 100)) {
    return { outcome: "insufficient-data", uplift: null };
  }

  const conversions = metrics.conversions ?? 0;
  const rate = metrics.exposures > 0 ? conversions / metrics.exposures : 0;

  if (rate > 0.05) return { outcome: "winner", uplift: rate };
  if (rate < 0.01) return { outcome: "loser", uplift: rate };
  return { outcome: "neutral", uplift: rate };
}

export function validateCTAGuardrails(experiment: ContentExperiment): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  if (experiment.variantVersionIds.length > 1) {
    violations.push("CTA experiment must change one element at a time");
  }
  return { passed: violations.length === 0, violations };
}

export const ctaExperimentService = {
  createCTAExperiment,
  assignCTAVariant,
  trackCTAExperimentExposure,
  trackCTAExperimentConversion,
  calculateCTAExperimentResult,
  validateCTAGuardrails,
};
