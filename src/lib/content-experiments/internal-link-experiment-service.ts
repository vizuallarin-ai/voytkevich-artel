import type { CMSContentItem } from "@/types/content-cms";
import type { ContentExperiment } from "@/types/content-experiment";
import { experimentDesignService } from "@/lib/content-experiments/experiment-design-service";
import { experimentStore } from "@/lib/content-experiments/experiment-store";

export type InternalLinkExperimentInput = {
  contentItemId: string;
  baselineVersionId: string;
  hypothesis: string;
  linksToAdd: string[];
  variantVersionId?: string;
};

export function createInternalLinkExperiment(input: InternalLinkExperimentInput): ContentExperiment {
  return experimentDesignService.createContentExperiment({
    contentItemId: input.contentItemId,
    type: "internal-linking",
    hypothesis: input.hypothesis,
    baselineVersionId: input.baselineVersionId,
    variantVersionIds: input.variantVersionId ? [input.variantVersionId] : [],
    primaryMetric: "internal-link.clicks",
  });
}

export function suggestExperimentLinks(
  contentItem: CMSContentItem,
  context: { candidateUrls?: string[] } = {},
): string[] {
  const suggestions = [
    ...(contentItem.related.projects ?? []),
    ...(contentItem.related.technicalArticles ?? []),
    ...(contentItem.related.programmaticPages ?? []),
    ...(context.candidateUrls ?? []),
  ];
  return [...new Set(suggestions)].slice(0, 5);
}

export function validateLinkRelevance(link: string): { relevant: boolean; reason: string } {
  if (!link.startsWith("/") && !link.includes("stroistroy")) {
    return { relevant: false, reason: "Link must be internal canonical URL" };
  }
  if (link.includes("redirect") || link.includes("noindex")) {
    return { relevant: false, reason: "Link must not point to redirect or noindex page" };
  }
  return { relevant: true, reason: "Link appears relevant" };
}

export function trackInternalLinkClicks(experiment: ContentExperiment): Record<string, number | null> {
  const metrics = experimentStore.getMetrics(experiment.id) ?? {};
  return { ...metrics, linkClicks: metrics.linkClicks ?? null };
}

export function monitorTargetPagePerformance(experiment: ContentExperiment): {
  monitored: boolean;
  message: string;
} {
  return {
    monitored: true,
    message: `Monitoring target pages for experiment ${experiment.id} — requires analytics data`,
  };
}

export function detectInternalLinkCannibalization(experiment: ContentExperiment): string[] {
  const warnings: string[] = [];
  if (experiment.guardrailMetrics.includes("cannibalization")) {
    warnings.push("Monitor for keyword cannibalization on target pages");
  }
  return warnings;
}

export function evaluateInternalLinkExperiment(experiment: ContentExperiment): {
  outcome: "positive" | "neutral" | "negative" | "inconclusive";
  limitations: string[];
} {
  const metrics = experimentStore.getMetrics(experiment.id);
  if (!metrics || metrics.linkClicks == null) {
    return {
      outcome: "inconclusive",
      limitations: ["Insufficient click data for evaluation"],
    };
  }

  const clicks = metrics.linkClicks ?? 0;
  if (clicks > 10) return { outcome: "positive", limitations: [] };
  if (clicks > 0) return { outcome: "neutral", limitations: ["Low sample size"] };
  return { outcome: "negative", limitations: ["No measurable link engagement"] };
}

export const internalLinkExperimentService = {
  createInternalLinkExperiment,
  suggestExperimentLinks,
  validateLinkRelevance,
  trackInternalLinkClicks,
  monitorTargetPagePerformance,
  detectInternalLinkCannibalization,
  evaluateInternalLinkExperiment,
};
