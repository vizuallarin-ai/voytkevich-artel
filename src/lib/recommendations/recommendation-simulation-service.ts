import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationItem, RecommendationCandidate } from "@/types/recommendation";
import type { RecommendationRuleset } from "@/types/recommendation-ruleset";
import { recommendationCandidateService } from "@/lib/recommendations/recommendation-candidate-service";
import { recommendationRerankingService } from "@/lib/recommendations/recommendation-reranking-service";
import { recommendationPolicyRegistry } from "@/lib/recommendations/recommendation-policy-registry";
import { recommendationPlacementRegistry } from "@/lib/recommendations/recommendation-placement-registry";
import { recommendationEligibilityService } from "@/lib/recommendations/recommendation-eligibility-service";
import { recommendationDiversityService } from "@/lib/recommendations/recommendation-diversity-service";

export type SimulationResult = {
  context: RecommendationContext;
  ruleset: RecommendationRuleset;
  candidates: RecommendationCandidate[];
  ranked: RecommendationItem[];
  eligibilityViolations: string[];
  diversityScore: number;
  placementPreview?: string;
};

export async function simulateRecommendations(
  context: RecommendationContext,
  ruleset: RecommendationRuleset,
  placementId = "article-related",
): Promise<SimulationResult> {
  const placement = recommendationPlacementRegistry.getPlacement(placementId);
  const policyId = placement?.policyId ?? ruleset.policies[0] ?? "related-content";
  const policy = recommendationPolicyRegistry.getPolicy(policyId);
  if (!policy) {
    return {
      context,
      ruleset,
      candidates: [],
      ranked: [],
      eligibilityViolations: ["policy-not-found"],
      diversityScore: 0,
    };
  }

  const candidates = await recommendationCandidateService.generateRecommendationCandidates(context, policy);
  const ranked = await recommendationRerankingService.rerankRecommendations(candidates, context, policy, {
    placement: placementId,
    limit: placement?.maxItems ?? 6,
  });

  const diversityScore = recommendationDiversityService.calculateRecommendationDiversity(ranked);

  const partialResult: SimulationResult = {
    context,
    ruleset,
    candidates,
    ranked,
    eligibilityViolations: [],
    diversityScore,
    placementPreview: placement?.uiComponent,
  };

  const violations = detectSimulationEligibilityViolations(partialResult);

  return {
    ...partialResult,
    eligibilityViolations: violations,
  };
}

export async function compareRecommendationRulesets(
  a: RecommendationRuleset,
  b: RecommendationRuleset,
  context: RecommendationContext,
): Promise<{ a: SimulationResult; b: SimulationResult; diff: Record<string, unknown> }> {
  const resultA = await simulateRecommendations(context, a);
  const resultB = await simulateRecommendations(context, b);
  return {
    a: resultA,
    b: resultB,
    diff: {
      candidateDiff: resultB.candidates.length - resultA.candidates.length,
      rankedDiff: resultB.ranked.length - resultA.ranked.length,
      diversityDiff: resultB.diversityScore - resultA.diversityScore,
    },
  };
}

export function explainSimulationResult(result: SimulationResult): string {
  return `Сгенерировано ${result.candidates.length} кандидатов, в выдачу попало ${result.ranked.length}. Diversity: ${result.diversityScore.toFixed(2)}. Нарушений: ${result.eligibilityViolations.length}.`;
}

export function detectSimulationEligibilityViolations(result: SimulationResult): string[] {
  const violations: string[] = [];
  for (const item of result.ranked) {
    const check = recommendationEligibilityService.checkCandidateEligibility({
      candidate: item,
      context: result.context,
    });
    if (!check.eligible) violations.push(...check.violations.map((v) => `${item.id}:${v}`));
  }
  return violations;
}

export function detectSimulationDiversityProblems(result: SimulationResult): string[] {
  if (result.diversityScore < 0.25) return ["low-diversity"];
  return recommendationQualityDiversityCheck(result.ranked);
}

function recommendationQualityDiversityCheck(items: RecommendationItem[]): string[] {
  const types = new Set(items.map((i) => i.type));
  return types.size < 2 && items.length > 2 ? ["low-type-diversity"] : [];
}

export function previewRecommendationPlacement(result: SimulationResult): {
  placement: string;
  items: Array<{ title: string; score: number; explanation: string }>;
} {
  return {
    placement: result.placementPreview ?? "RecommendationBlock",
    items: result.ranked.map((item) => ({
      title: item.title,
      score: item.score,
      explanation: item.explanation,
    })),
  };
}

export const recommendationSimulationService = {
  simulateRecommendations,
  compareRecommendationRulesets,
  explainSimulationResult,
  detectSimulationEligibilityViolations,
  detectSimulationDiversityProblems,
  previewRecommendationPlacement,
};
