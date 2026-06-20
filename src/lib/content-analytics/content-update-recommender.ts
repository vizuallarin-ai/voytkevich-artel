import type { ContentPerformanceSnapshot } from "@/types/content-analytics";
import { contentUnderperformanceService } from "@/lib/content-analytics/content-underperformance-service";
import { contentDecayService } from "@/lib/content-analytics/content-decay-service";

export type ContentUpdateAction =
  | "keep"
  | "update-title"
  | "update-description"
  | "strengthen-intent"
  | "add-expert-block"
  | "add-faq"
  | "add-project"
  | "add-cta"
  | "improve-internal-links"
  | "update-outdated-data"
  | "add-visuals"
  | "merge-pages"
  | "fix-canonical"
  | "resolve-cannibalization"
  | "restructure"
  | "expert-review"
  | "wait-for-data"
  | "consider-noindex-after-review";

export type ContentUpdateRecommendation = {
  contentItemId: string;
  url: string;
  actions: ContentUpdateAction[];
  priority: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  potential: "low" | "medium" | "high";
  explanation: string;
  requiresHumanReview: true;
};

export type ContentUpdateContext = {
  previousSnapshot?: ContentPerformanceSnapshot;
  hasCannibalizationRisk?: boolean;
};

export function recommendContentUpdate(
  item: ContentPerformanceSnapshot,
  context: ContentUpdateContext = {},
): ContentUpdateRecommendation {
  const underperf = contentUnderperformanceService.classifyUnderperformance(item, {
    hasCannibalizationRisk: context.hasCannibalizationRisk,
  });

  const decay = context.previousSnapshot
    ? contentDecayService.detectContentDecay(item, context.previousSnapshot)
    : null;

  const actions: ContentUpdateAction[] = [];

  switch (underperf.category) {
    case "too-early":
      actions.push("wait-for-data");
      break;
    case "not-indexed":
      actions.push("fix-canonical", "improve-internal-links");
      break;
    case "impressions-no-clicks":
      actions.push("update-title", "update-description");
      break;
    case "engagement-no-cta":
      actions.push("add-cta");
      break;
    case "cta-no-submissions":
      actions.push("add-cta", "strengthen-intent");
      break;
    case "leads-low-quality":
      actions.push("strengthen-intent", "add-project");
      break;
    case "cannibalization":
      actions.push("resolve-cannibalization", "merge-pages", "fix-canonical");
      break;
    case "no-demand":
      actions.push("wait-for-data", "strengthen-intent");
      break;
    default:
      actions.push("keep");
  }

  if (decay?.detected) {
    actions.push("update-outdated-data", "add-faq", "improve-internal-links");
  }

  if (actions.length === 0) actions.push("keep");

  return {
    contentItemId: item.contentItemId,
    url: item.url,
    actions: [...new Set(actions)],
    priority: decay?.severity === "high" || underperf.category === "not-indexed" ? "high" : "medium",
    effort: actions.includes("restructure") || actions.includes("merge-pages") ? "high" : "medium",
    potential: underperf.category === "impressions-no-clicks" ? "high" : "medium",
    explanation: `${underperf.category}: ${underperf.reasons.join("; ")}`,
    requiresHumanReview: true,
  };
}

export function prioritizeContentUpdates(
  items: ContentPerformanceSnapshot[],
  context: ContentUpdateContext = {},
): ContentUpdateRecommendation[] {
  return items
    .map((item) => recommendContentUpdate(item, context))
    .filter((r) => !r.actions.includes("keep") && !r.actions.includes("wait-for-data"))
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
}

export function explainUpdateRecommendation(recommendation: ContentUpdateRecommendation): string {
  return `${recommendation.url}: ${recommendation.actions.join(", ")} — ${recommendation.explanation}`;
}

export function estimateUpdateEffort(recommendation: ContentUpdateRecommendation): "low" | "medium" | "high" {
  return recommendation.effort;
}

export function estimateUpdatePotential(recommendation: ContentUpdateRecommendation): "low" | "medium" | "high" {
  return recommendation.potential;
}

export async function sendUpdateRecommendationToCMS(
  recommendation: ContentUpdateRecommendation,
): Promise<{ queued: boolean; message: string }> {
  return {
    queued: false,
    message: `Recommendation for ${recommendation.contentItemId} requires manual CMS review: ${recommendation.actions.join(", ")}`,
  };
}

export const contentUpdateRecommender = {
  recommendContentUpdate,
  prioritizeContentUpdates,
  explainUpdateRecommendation,
  estimateUpdateEffort,
  estimateUpdatePotential,
  sendUpdateRecommendationToCMS,
};
