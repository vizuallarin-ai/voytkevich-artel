import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate, RankedRecommendation } from "@/types/recommendation";
import type { CMSContentItem } from "@/types/content-cms";
import { recommendationExplanationService } from "@/lib/recommendations/recommendation-explanation-service";

export const DEFAULT_SCORING_WEIGHTS: Record<string, number> = {
  contextualRelevance: 0.25,
  entityRelevance: 0.15,
  clusterRelevance: 0.1,
  preferenceMatch: 0.2,
  journeyValue: 0.1,
  contentQuality: 0.08,
  freshness: 0.05,
  businessValue: 0.04,
  diversityBoost: 0.02,
  noveltyBoost: 0.01,
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function calculateContextualRelevance(
  candidate: RecommendationCandidate,
  context: RecommendationContext,
): number {
  let score = 0.2;
  if (context.currentPage?.contentItemId === candidate.contentItemId) return 0;
  if (context.currentPage?.clusterIds.some((id) => candidate.clusterIds.includes(id))) score += 0.4;
  if (context.search?.query && candidate.title.toLowerCase().includes(context.search.query.toLowerCase().slice(0, 20))) {
    score += 0.25;
  }
  if (context.viewedContentIds.includes(candidate.contentItemId ?? "")) score -= 0.15;
  return clamp01(score);
}

export function calculateEntityRelevance(
  candidate: RecommendationCandidate,
  context: RecommendationContext,
): number {
  const pageEntities = new Set([
    ...(context.currentPage?.entityNodeIds ?? []),
    ...(context.search?.entityNodeIds ?? []),
  ]);
  if (pageEntities.size === 0) return 0.3;
  let overlap = 0;
  for (const id of candidate.entityNodeIds) {
    if (pageEntities.has(id)) overlap++;
  }
  return clamp01(overlap / Math.max(pageEntities.size, 1));
}

export function calculateClusterRelevance(
  candidate: RecommendationCandidate,
  context: RecommendationContext,
): number {
  const clusters = new Set(context.currentPage?.clusterIds ?? []);
  if (clusters.size === 0) return 0.25;
  const match = candidate.clusterIds.filter((id) => clusters.has(id)).length;
  return clamp01(match / clusters.size);
}

export function calculatePreferenceMatch(
  candidate: RecommendationCandidate,
  context: RecommendationContext,
): number {
  const prefs = context.preferences;
  const hay = `${candidate.title} ${candidate.description ?? ""}`.toLowerCase();
  let matches = 0;
  let total = 0;
  const groups = [
    prefs.buildingTypes,
    prefs.technologies,
    prefs.materials,
    prefs.areas,
    prefs.floors,
    prefs.locations,
  ];
  for (const group of groups) {
    if (group.length === 0) continue;
    total += group.length;
    for (const value of group) {
      if (hay.includes(value.toLowerCase())) matches++;
    }
  }
  if (total === 0) return 0.2;
  return clamp01(matches / total);
}

export function calculateJourneyValue(
  candidate: RecommendationCandidate,
  context: RecommendationContext,
): number {
  const stage = context.journeyStage;
  if (stage === "exploration" || stage === "education") {
    return candidate.type === "related-content" || candidate.type === "faq" ? 0.8 : 0.4;
  }
  if (stage === "comparison") {
    return candidate.type === "comparison" || candidate.type === "technology" ? 0.85 : 0.35;
  }
  if (stage === "project-selection") {
    return candidate.type === "project" ? 0.9 : 0.3;
  }
  if (stage === "calculation-intent" || stage === "consultation-intent") {
    return candidate.type === "service" || candidate.type === "next-action" ? 0.7 : 0.25;
  }
  return 0.4;
}

export function calculateContentQuality(
  candidate: RecommendationCandidate,
  cmsItem?: CMSContentItem,
): number {
  if (!cmsItem) return candidate.eligibility.indexable ? 0.5 : 0.2;
  const level = cmsItem.quality.level;
  if (level === "strong" || level === "good") return 0.85;
  if (level === "acceptable") return 0.6;
  return 0.3;
}

export function calculateFreshness(candidate: RecommendationCandidate, cmsItem?: CMSContentItem): number {
  if (!cmsItem?.workflow.publishedAt) return 0.5;
  const published = new Date(cmsItem.workflow.publishedAt).getTime();
  const ageDays = (Date.now() - published) / (1000 * 60 * 60 * 24);
  if (ageDays < 30) return 0.9;
  if (ageDays < 180) return 0.7;
  if (ageDays < 365) return 0.5;
  return 0.35;
}

export function calculateBusinessValue(candidate: RecommendationCandidate): number {
  if (candidate.type === "service" || candidate.type === "next-action") return 0.6;
  if (candidate.type === "project") return 0.5;
  return 0.2;
}

export function calculateRecommendationPenalties(
  candidate: RecommendationCandidate,
  context: RecommendationContext,
): { repetitionPenalty: number; exclusionPenalty: number } {
  let repetitionPenalty = 0;
  let exclusionPenalty = 0;

  if (context.viewedContentIds.includes(candidate.contentItemId ?? "")) {
    repetitionPenalty += 0.2;
  }
  if (context.clickedRecommendationIds.includes(candidate.id)) {
    repetitionPenalty += 0.15;
  }
  if (context.dismissedRecommendationIds.includes(candidate.id) || context.dismissedRecommendationIds.includes(candidate.contentItemId ?? "")) {
    exclusionPenalty = 1;
  }
  if (!candidate.eligibility.published || !candidate.eligibility.indexable) {
    exclusionPenalty = 1;
  }

  return { repetitionPenalty, exclusionPenalty };
}

export function calculateRecommendationConfidence(
  factors: RankedRecommendation["factors"],
): "low" | "medium" | "high" {
  const relevance = (factors.contextualRelevance + factors.entityRelevance + factors.preferenceMatch) / 3;
  if (relevance >= 0.65) return "high";
  if (relevance >= 0.35) return "medium";
  return "low";
}

export function calculateRecommendationScore(
  candidate: RecommendationCandidate,
  context: RecommendationContext,
  options?: { cmsItem?: CMSContentItem; weights?: Record<string, number> },
): RankedRecommendation {
  const weights = { ...DEFAULT_SCORING_WEIGHTS, ...options?.weights };
  const penalties = calculateRecommendationPenalties(candidate, context);

  const factors: RankedRecommendation["factors"] = {
    contextualRelevance: calculateContextualRelevance(candidate, context),
    entityRelevance: calculateEntityRelevance(candidate, context),
    clusterRelevance: calculateClusterRelevance(candidate, context),
    preferenceMatch: calculatePreferenceMatch(candidate, context),
    journeyValue: calculateJourneyValue(candidate, context),
    contentQuality: calculateContentQuality(candidate, options?.cmsItem),
    freshness: calculateFreshness(candidate, options?.cmsItem),
    businessValue: calculateBusinessValue(candidate),
    diversityBoost: 0,
    noveltyBoost: 0,
    repetitionPenalty: penalties.repetitionPenalty,
    exclusionPenalty: penalties.exclusionPenalty,
  };

  let score =
    factors.contextualRelevance * weights.contextualRelevance +
    factors.entityRelevance * weights.entityRelevance +
    factors.clusterRelevance * weights.clusterRelevance +
    factors.preferenceMatch * weights.preferenceMatch +
    factors.journeyValue * weights.journeyValue +
    factors.contentQuality * weights.contentQuality +
    factors.freshness * weights.freshness;

  const relevanceAvg = (factors.contextualRelevance + factors.entityRelevance + factors.preferenceMatch) / 3;
  if (relevanceAvg >= 0.3) {
    score += factors.businessValue * weights.businessValue;
  }

  score -= factors.repetitionPenalty * 0.15;
  score -= factors.exclusionPenalty;

  const confidence = calculateRecommendationConfidence(factors);
  const explanation = recommendationExplanationService.explainRecommendation(candidate, context);
  const reasonCodes = recommendationExplanationService.buildSafeReasonCodes(candidate, context);

  return {
    recommendationId: candidate.id,
    score: Math.max(0, score),
    confidence,
    factors,
    explanation,
    reasonCodes,
  };
}

export const recommendationScoringService = {
  calculateRecommendationScore,
  calculateContextualRelevance,
  calculateEntityRelevance,
  calculateClusterRelevance,
  calculatePreferenceMatch,
  calculateJourneyValue,
  calculateContentQuality,
  calculateFreshness,
  calculateBusinessValue,
  calculateRecommendationPenalties,
  calculateRecommendationConfidence,
  DEFAULT_SCORING_WEIGHTS,
};
