import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationItem } from "@/types/recommendation";
import { recommendationExplanationService } from "@/lib/recommendations/recommendation-explanation-service";

export function calculateRecommendationNovelty(
  item: RecommendationItem,
  context: RecommendationContext,
): number {
  if (context.viewedContentIds.includes(item.contentItemId ?? "")) return 0;
  if (context.clickedRecommendationIds.includes(item.id)) return 0.1;
  if (item.source === "cold-start" || item.source === "popular") return 0.4;
  return 0.7;
}

export function findSafeExplorationCandidates(
  items: RecommendationItem[],
  context: RecommendationContext,
): RecommendationItem[] {
  return items
    .filter((item) => calculateRecommendationNovelty(item, context) >= 0.4)
    .filter((item) => item.score >= 0.25)
    .slice(0, 3);
}

export function applyExplorationSlot(
  items: RecommendationItem[],
  context: RecommendationContext,
): RecommendationItem[] {
  if (items.length <= 2) return items;
  const exploration = findSafeExplorationCandidates(items.slice(1), context)[0];
  if (!exploration) return items;

  const result = [...items];
  const insertAt = Math.min(2, result.length);
  if (!result.find((i) => i.id === exploration.id)) {
    result.splice(insertAt, 0, {
      ...exploration,
      factors: { ...exploration.factors, noveltyBoost: 0.08 },
      explanation: explainExplorationRecommendation(exploration),
    });
  }
  return result.slice(0, items.length);
}

export function excludeIrrelevantNovelty(
  items: RecommendationItem[],
  context: RecommendationContext,
): RecommendationItem[] {
  return items.filter((item) => {
    const novelty = calculateRecommendationNovelty(item, context);
    return novelty >= 0.2 || item.score >= 0.5;
  });
}

export function explainExplorationRecommendation(item: RecommendationItem): string {
  return recommendationExplanationService.removeSensitiveExplanationSignals(
    `Дополнительный вариант для расширения выбора: ${item.title}`,
  );
}

export const recommendationNoveltyService = {
  calculateRecommendationNovelty,
  findSafeExplorationCandidates,
  applyExplorationSlot,
  excludeIrrelevantNovelty,
  explainExplorationRecommendation,
};
