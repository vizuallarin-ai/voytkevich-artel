import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationItem } from "@/types/recommendation";
import { recommendationStore } from "@/lib/recommendations/recommendation-store";
import { recommendationPlacementRegistry } from "@/lib/recommendations/recommendation-placement-registry";

const DEFAULT_CAPS: Record<string, number> = {
  "next-action": 2,
  project: 4,
  service: 3,
  "related-content": 5,
  default: 5,
};

export function getRecommendationExposureCount(
  item: RecommendationItem,
  context: RecommendationContext,
  placement = "default",
): number {
  const exposure = recommendationStore.getExposure(context.sessionId, item.id, placement);
  return exposure?.count ?? 0;
}

export function isFrequencyCapReached(
  item: RecommendationItem,
  context: RecommendationContext,
  placement = "default",
): boolean {
  const placementConfig = recommendationPlacementRegistry.getPlacement(placement);
  const cap = placementConfig?.frequencyCap ?? DEFAULT_CAPS[item.type] ?? DEFAULT_CAPS.default;
  return getRecommendationExposureCount(item, context, placement) >= cap;
}

export function applyRecommendationFrequencyCap(
  items: RecommendationItem[],
  context: RecommendationContext,
  placement = "default",
): RecommendationItem[] {
  return items.filter((item) => !isFrequencyCapReached(item, context, placement));
}

export function recordRecommendationExposure(
  item: RecommendationItem,
  context: RecommendationContext,
  placement: string,
): void {
  recommendationStore.saveExposure({
    sessionId: context.sessionId,
    contentItemId: item.contentItemId,
    recommendationId: item.id,
    placement,
    recommendationType: item.type,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
}

export function resetExpiredFrequencyCaps(): number {
  const now = Date.now();
  let removed = 0;
  for (const exposure of recommendationStore.listExposures()) {
    if (exposure.expiresAt && new Date(exposure.expiresAt).getTime() < now) {
      removed++;
    }
  }
  return removed;
}

export const recommendationFrequencyService = {
  getRecommendationExposureCount,
  isFrequencyCapReached,
  applyRecommendationFrequencyCap,
  recordRecommendationExposure,
  resetExpiredFrequencyCaps,
};
