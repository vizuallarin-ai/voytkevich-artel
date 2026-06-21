import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationItem } from "@/types/recommendation";
import { recommendationStore } from "@/lib/recommendations/recommendation-store";

export function detectRecommendationNarrowing(history: string[]): boolean {
  if (history.length < 4) return false;
  const recent = history.slice(-4);
  const unique = new Set(recent);
  return unique.size <= 2;
}

export function detectRepeatedCategoryExposure(sessionId?: string): boolean {
  const exposures = recommendationStore.listExposures(sessionId);
  const byType = new Map<string, number>();
  for (const exp of exposures) {
    byType.set(exp.recommendationType, (byType.get(exp.recommendationType) ?? 0) + exp.count);
  }
  return [...byType.values()].some((count) => count >= 5);
}

export function detectPreferenceOverfitting(context: RecommendationContext): boolean {
  const techOnly =
    context.preferences.technologies.length >= 2 &&
    context.preferences.materials.length === 0 &&
    context.preferences.areas.length === 0;
  const narrowViews = detectRecommendationNarrowing(context.viewedContentIds);
  return techOnly && narrowViews;
}

export function injectAlternativePerspective(
  items: RecommendationItem[],
  context: RecommendationContext,
): RecommendationItem[] {
  if (!detectPreferenceOverfitting(context)) return items;

  const alternative = items.find(
    (item) =>
      item.type !== items[0]?.type ||
      !item.clusterIds.some((id) => items[0]?.clusterIds.includes(id)),
  );

  if (!alternative || items.some((i) => i.id === alternative.id)) return items;

  const result = [...items];
  const insertAt = Math.min(2, result.length);
  result.splice(insertAt, 0, {
    ...alternative,
    explanation: "Дополнительный вариант для расширения выбора",
    reasonCodes: [...alternative.reasonCodes, "filter-bubble-guard"],
  });
  return result.slice(0, items.length);
}

export function recommendPreferenceReset(context: RecommendationContext): boolean {
  return detectPreferenceOverfitting(context) || detectRepeatedCategoryExposure(context.sessionId);
}

export function buildFilterBubbleWarning(context: RecommendationContext): string | null {
  if (!detectPreferenceOverfitting(context)) return null;
  return "Рекомендации могут быть слишком узкими. Вы можете сбросить предпочтения и посмотреть другие варианты.";
}

export const filterBubbleGuard = {
  detectRecommendationNarrowing,
  detectRepeatedCategoryExposure,
  detectPreferenceOverfitting,
  injectAlternativePerspective,
  recommendPreferenceReset,
  buildFilterBubbleWarning,
};
