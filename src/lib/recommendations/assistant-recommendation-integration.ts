import { randomUUID } from "crypto";
import type { NavigationMemory } from "@/types/ai-navigation";
import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate, RecommendationItem } from "@/types/recommendation";
import type { NextBestAction } from "@/types/next-best-action";
import { navigationMemoryService } from "@/lib/ai-navigation/navigation-memory-service";
import { recommendationCandidateService } from "@/lib/recommendations/recommendation-candidate-service";
import { recommendationRerankingService } from "@/lib/recommendations/recommendation-reranking-service";
import { recommendationPolicyRegistry } from "@/lib/recommendations/recommendation-policy-registry";
import { recommendationPlacementRegistry } from "@/lib/recommendations/recommendation-placement-registry";
import { recommendationExplanationService } from "@/lib/recommendations/recommendation-explanation-service";
import { recommendationEligibilityService } from "@/lib/recommendations/recommendation-eligibility-service";
import { contentRepository } from "@/lib/content-cms/content-repository";

export function buildAssistantRecommendationContext(memory: NavigationMemory): RecommendationContext {
  const sanitized = navigationMemoryService.sanitizeNavigationMemory(memory);
  return {
    requestId: randomUUID(),
    sessionId: sanitized.sessionId,
    mode: "anonymous-session",
    preferences: {
      buildingTypes: sanitized.buildingType ? [sanitized.buildingType] : [],
      technologies: sanitized.technology ? [sanitized.technology] : [],
      materials: sanitized.material ? [sanitized.material] : [],
      sizes: [],
      areas: sanitized.area ? [sanitized.area] : [],
      floors: sanitized.floors ? [sanitized.floors] : [],
      layouts: [],
      locations: sanitized.location ? [sanitized.location] : [],
    },
    journeyStage: sanitized.intent === "consultation" ? "consultation-intent" : sanitized.intent === "cost" ? "calculation-intent" : "exploration",
    viewedContentIds: sanitized.viewedContentIds,
    clickedRecommendationIds: [],
    dismissedRecommendationIds: [],
    consent: { personalization: true, location: false, persistentPreferences: false },
    createdAt: new Date().toISOString(),
  };
}

export async function getAssistantRecommendations(context: RecommendationContext): Promise<RecommendationItem[]> {
  const placement = recommendationPlacementRegistry.getPlacement("assistant-actions");
  const policy = recommendationPolicyRegistry.getPolicy(placement?.policyId ?? "next-best-action");
  if (!policy) return [];
  const candidates = await recommendationCandidateService.generateRecommendationCandidates(context, policy);
  return recommendationRerankingService.rerankRecommendations(candidates, context, policy, {
    placement: "assistant-actions",
    limit: placement?.maxItems ?? 4,
  });
}

export async function validateAssistantRecommendation(item: RecommendationCandidate): Promise<boolean> {
  if (!item.title || (!item.contentItemId && !item.targetUrl)) return false;
  if (item.contentItemId) {
    const cmsItem = await contentRepository.getContentById(item.contentItemId);
    if (!cmsItem) return false;
    const check = recommendationEligibilityService.checkCandidateEligibility({
      candidate: item,
      context: {
        requestId: randomUUID(),
        mode: "anonymous-session",
        preferences: {
          buildingTypes: [],
          technologies: [],
          materials: [],
          sizes: [],
          areas: [],
          floors: [],
          layouts: [],
          locations: [],
        },
        journeyStage: "unknown",
        viewedContentIds: [],
        clickedRecommendationIds: [],
        dismissedRecommendationIds: [],
        consent: { personalization: true, location: false, persistentPreferences: false },
        createdAt: new Date().toISOString(),
      },
      cmsItem,
    });
    return check.eligible;
  }
  return Boolean(item.targetUrl?.startsWith("/"));
}

export function buildAssistantRecommendationExplanation(item: RecommendationCandidate): string {
  return recommendationExplanationService.removeSensitiveExplanationSignals(
    `Подходит по контексту диалога: ${item.title}`,
  );
}

export function applyAssistantRecommendationAction(
  action: NextBestAction,
  consent: { persistentPreferences: boolean },
): { allowed: boolean; reason?: string } {
  if (action.requiresConsent && !consent.persistentPreferences) {
    return { allowed: false, reason: "Требуется согласие на сохранение предпочтений" };
  }
  if (action.type === "request-consultation" && !action.requiresConfirmation) {
    return { allowed: false, reason: "Консультация требует подтверждения пользователя" };
  }
  return { allowed: true };
}

export const assistantRecommendationIntegration = {
  buildAssistantRecommendationContext,
  getAssistantRecommendations,
  validateAssistantRecommendation,
  buildAssistantRecommendationExplanation,
  applyAssistantRecommendationAction,
};
