import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate, RecommendationItem } from "@/types/recommendation";
import { coldStartService } from "@/lib/recommendations/cold-start-service";
import { contextualRecommendationService } from "@/lib/recommendations/contextual-recommendation-service";
import { recommendationPlacementRegistry } from "@/lib/recommendations/recommendation-placement-registry";
import { recommendationAnalytics } from "@/lib/recommendations/recommendation-analytics";

export type FallbackResult = {
  items: RecommendationCandidate[] | RecommendationItem[];
  strategy: string;
  usedFallback: boolean;
};

export async function fallbackToContextual(
  context: RecommendationContext,
): Promise<RecommendationCandidate[]> {
  const page = await contextualRecommendationService.recommendFromCurrentPage(context);
  if (page.length > 0) return page;
  return contextualRecommendationService.recommendByCluster(context);
}

export async function fallbackToColdStart(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  return coldStartService.buildColdStartRecommendations(context);
}

export async function fallbackToEditorial(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  return coldStartService.getEditorialColdStartCandidates(context);
}

export async function applyRecommendationFallback(
  context: RecommendationContext,
  placementId: string,
  currentItems: RecommendationItem[],
): Promise<FallbackResult> {
  if (currentItems.length > 0) {
    return { items: currentItems, strategy: "none", usedFallback: false };
  }

  const placement = recommendationPlacementRegistry.getPlacement(placementId);
  let candidates: RecommendationCandidate[] = [];

  if (context.mode === "contextual" || !context.consent.personalization) {
    candidates = await fallbackToContextual(context);
  }

  if (candidates.length === 0) {
    candidates = await fallbackToColdStart(context);
  }

  if (candidates.length === 0 && placement?.fallbackPlacementId) {
    const fallbackPlacement = recommendationPlacementRegistry.getPlacement(placement.fallbackPlacementId);
    if (fallbackPlacement) {
      candidates = await fallbackToEditorial(context);
    }
  }

  if (candidates.length > 0) {
    recommendationAnalytics.trackFallbackUsed(context, placementId);
  }

  return {
    items: candidates,
    strategy: candidates.length > 0 ? "contextual-cold-start" : "empty",
    usedFallback: candidates.length > 0,
  };
}

export const recommendationFallbackService = {
  fallbackToContextual,
  fallbackToColdStart,
  fallbackToEditorial,
  applyRecommendationFallback,
};
