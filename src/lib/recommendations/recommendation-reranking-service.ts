import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate, RecommendationItem } from "@/types/recommendation";
import type { RecommendationPolicy } from "@/lib/recommendations/recommendation-policy-registry";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { recommendationScoringService } from "@/lib/recommendations/recommendation-scoring-service";
import { recommendationEligibilityService } from "@/lib/recommendations/recommendation-eligibility-service";
import { recommendationDiversityService } from "@/lib/recommendations/recommendation-diversity-service";
import { recommendationNoveltyService } from "@/lib/recommendations/recommendation-novelty-service";
import { recommendationFrequencyService } from "@/lib/recommendations/recommendation-frequency-service";
import { explicitPreferenceService } from "@/lib/recommendations/explicit-preference-service";
import { filterBubbleGuard } from "@/lib/recommendations/filter-bubble-guard";
import { recommendationRulesetService } from "@/lib/recommendations/recommendation-ruleset-service";

export function applyEligibilityRules(candidates: RecommendationCandidate[]): RecommendationCandidate[] {
  return candidates.filter(
    (c) =>
      c.eligibility.published &&
      c.eligibility.indexable &&
      c.eligibility.canonical &&
      c.eligibility.available,
  );
}

export function applyPreferenceRules(
  candidates: RecommendationCandidate[],
  context: RecommendationContext,
): RecommendationCandidate[] {
  const prefs = explicitPreferenceService.listExplicitPreferences(context);
  return explicitPreferenceService.applyExplicitPreferences(candidates, prefs);
}

export function applyJourneyRules(
  items: RecommendationItem[],
  context: RecommendationContext,
): RecommendationItem[] {
  if (context.journeyStage === "exploration" || context.journeyStage === "education") {
    return items.filter((i) => i.type !== "next-action" || i.score < 0.8);
  }
  return items;
}

export function applyDiversityRules(
  items: RecommendationItem[],
  _context: RecommendationContext,
): RecommendationItem[] {
  return recommendationDiversityService.preserveTopRelevantItem(items);
}

export function applyNoveltyRules(
  items: RecommendationItem[],
  context: RecommendationContext,
): RecommendationItem[] {
  const filtered = recommendationNoveltyService.excludeIrrelevantNovelty(items, context);
  return recommendationNoveltyService.applyExplorationSlot(filtered, context);
}

export function applyFrequencyCaps(
  items: RecommendationItem[],
  context: RecommendationContext,
  placement = "default",
): RecommendationItem[] {
  return recommendationFrequencyService.applyRecommendationFrequencyCap(items, context, placement);
}

export function applyBusinessRules(
  items: RecommendationItem[],
  _context: RecommendationContext,
): RecommendationItem[] {
  return items.map((item) => {
    const relevance =
      (item.factors.contextualRelevance + item.factors.entityRelevance + item.factors.preferenceMatch) / 3;
    if (relevance < 0.3) {
      return { ...item, factors: { ...item.factors, businessValue: 0 }, score: item.score * 0.7 };
    }
    return item;
  });
}

export function buildFinalRecommendationSet(items: RecommendationItem[], limit: number): RecommendationItem[] {
  return items.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function rerankRecommendations(
  candidates: RecommendationCandidate[],
  context: RecommendationContext,
  policy: RecommendationPolicy,
  options?: { placement?: string; limit?: number },
): Promise<RecommendationItem[]> {
  const limit = options?.limit ?? 6;
  const placement = options?.placement ?? "default";

  let filtered = applyEligibilityRules(candidates);
  filtered = applyPreferenceRules(filtered, context);

  const items = await contentRepository.listContent();
  const cmsMap = new Map(items.map((i) => [i.id, i]));
  const ruleset = recommendationRulesetService.getActiveRecommendationRuleset();
  const weights = ruleset?.weights;

  let ranked: RecommendationItem[] = filtered.map((candidate) => {
    const rankedPart = recommendationScoringService.calculateRecommendationScore(candidate, context, {
      cmsItem: candidate.contentItemId ? cmsMap.get(candidate.contentItemId) : undefined,
      weights,
    });
    return { ...candidate, ...rankedPart };
  });

  ranked = applyBusinessRules(ranked, context);
  ranked = applyJourneyRules(ranked, context);
  ranked = applyDiversityRules(ranked, context);
  ranked = applyNoveltyRules(ranked, context);
  ranked = applyFrequencyCaps(ranked, context, placement);
  ranked = filterBubbleGuard.injectAlternativePerspective(ranked, context);

  ranked = recommendationEligibilityService.filterEligibleCandidates(
    ranked,
    context,
    { cmsItems: cmsMap, allowedTypes: policy.allowedTypes },
  ) as RecommendationItem[];

  return buildFinalRecommendationSet(ranked, limit);
}

export const recommendationRerankingService = {
  rerankRecommendations,
  applyEligibilityRules,
  applyPreferenceRules,
  applyJourneyRules,
  applyDiversityRules,
  applyNoveltyRules,
  applyFrequencyCaps,
  applyBusinessRules,
  buildFinalRecommendationSet,
};
