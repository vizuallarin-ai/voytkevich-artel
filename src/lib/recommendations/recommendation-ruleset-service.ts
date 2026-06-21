import { randomUUID } from "crypto";
import type { RecommendationRuleset } from "@/types/recommendation-ruleset";
import { recommendationStore } from "@/lib/recommendations/recommendation-store";
import { DEFAULT_SCORING_WEIGHTS } from "@/lib/recommendations/recommendation-scoring-service";
import { RECOMMENDATION_EXCLUSION_RULE_IDS } from "@/data/recommendation-exclusion-rules";

const DEFAULT_RULESET: RecommendationRuleset = {
  id: "ruleset:default",
  version: 1,
  status: "active",
  weights: DEFAULT_SCORING_WEIGHTS,
  policies: ["related-content", "project-discovery", "cold-start"],
  exclusions: RECOMMENDATION_EXCLUSION_RULE_IDS,
  diversity: { minTypes: 2, preserveTop: true },
  frequencyCaps: { default: 5, "next-action": 2, project: 4 },
  fallbacks: { default: "cold-start" },
  createdBy: "system",
  createdAt: new Date().toISOString(),
  activatedAt: new Date().toISOString(),
};

function ensureDefaultRuleset(): void {
  if (!recommendationStore.getActiveRuleset()) {
    recommendationStore.saveRuleset(DEFAULT_RULESET);
  }
}

export function createRecommendationRuleset(
  input: Partial<RecommendationRuleset> & { createdBy: string },
): RecommendationRuleset {
  const ruleset: RecommendationRuleset = {
    id: input.id ?? `ruleset:${randomUUID()}`,
    version: input.version ?? 1,
    status: "draft",
    weights: input.weights ?? { ...DEFAULT_SCORING_WEIGHTS },
    policies: input.policies ?? ["related-content"],
    exclusions: input.exclusions ?? RECOMMENDATION_EXCLUSION_RULE_IDS,
    diversity: input.diversity ?? { minTypes: 2 },
    frequencyCaps: input.frequencyCaps ?? { default: 5 },
    fallbacks: input.fallbacks ?? { default: "cold-start" },
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
  };
  return recommendationStore.saveRuleset(ruleset);
}

export function validateRecommendationRuleset(id: string): { valid: boolean; errors: string[] } {
  const ruleset = recommendationStore.getRuleset(id);
  if (!ruleset) return { valid: false, errors: ["Ruleset not found"] };

  const errors: string[] = [];
  if (Object.keys(ruleset.weights).length === 0) errors.push("weights empty");
  if (ruleset.policies.length === 0) errors.push("policies empty");
  const weightSum = Object.values(ruleset.weights).reduce((a, b) => a + b, 0);
  if (weightSum <= 0) errors.push("invalid weight sum");

  const valid = errors.length === 0;
  if (valid) {
    recommendationStore.saveRuleset({ ...ruleset, status: "validating" });
  } else {
    recommendationStore.saveRuleset({ ...ruleset, status: "failed" });
  }
  return { valid, errors };
}

export function compareRecommendationRulesets(a: RecommendationRuleset, b: RecommendationRuleset): Record<string, unknown> {
  return {
    weightDiff: Object.keys({ ...a.weights, ...b.weights }).reduce<Record<string, number>>((acc, key) => {
      acc[key] = (b.weights[key] ?? 0) - (a.weights[key] ?? 0);
      return acc;
    }, {}),
    policyAdded: b.policies.filter((p) => !a.policies.includes(p)),
    policyRemoved: a.policies.filter((p) => !b.policies.includes(p)),
  };
}

export function approveRecommendationRuleset(id: string, actor: string): RecommendationRuleset | null {
  const ruleset = recommendationStore.getRuleset(id);
  if (!ruleset || ruleset.status !== "validating") return null;
  return recommendationStore.saveRuleset({ ...ruleset, status: "approved", createdBy: actor });
}

export function activateRecommendationRuleset(id: string): RecommendationRuleset | null {
  const ruleset = recommendationStore.getRuleset(id);
  if (!ruleset) return null;
  const validation = validateRecommendationRuleset(id);
  if (!validation.valid && ruleset.status !== "approved") return null;

  for (const existing of recommendationStore.listRulesets()) {
    if (existing.status === "active" && existing.id !== id) {
      recommendationStore.saveRuleset({ ...existing, status: "archived" });
    }
  }

  return recommendationStore.saveRuleset({
    ...ruleset,
    status: "active",
    activatedAt: new Date().toISOString(),
  });
}

export function rollbackRecommendationRuleset(targetId: string): RecommendationRuleset | null {
  const target = recommendationStore.getRuleset(targetId);
  if (!target) return null;
  return activateRecommendationRuleset(targetId);
}

export function getActiveRecommendationRuleset(): RecommendationRuleset {
  ensureDefaultRuleset();
  return recommendationStore.getActiveRuleset() ?? DEFAULT_RULESET;
}

export const recommendationRulesetService = {
  createRecommendationRuleset,
  validateRecommendationRuleset,
  compareRecommendationRulesets,
  approveRecommendationRuleset,
  activateRecommendationRuleset,
  rollbackRecommendationRuleset,
  getActiveRecommendationRuleset,
};
