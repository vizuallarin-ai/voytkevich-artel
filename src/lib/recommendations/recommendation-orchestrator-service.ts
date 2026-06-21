import { randomUUID } from "crypto";
import type { RecommendationContext, PersonalizationMode } from "@/types/recommendation-context";
import type { RecommendationItem } from "@/types/recommendation";
import type { NextBestAction } from "@/types/next-best-action";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { entityResolutionService } from "@/lib/knowledge-graph/entity-resolution-service";
import { navigationMemoryService } from "@/lib/ai-navigation/navigation-memory-service";
import { journeyStageService } from "@/lib/recommendations/journey-stage-service";
import { sessionRecommendationService } from "@/lib/recommendations/session-recommendation-service";
import { recommendationPolicyRegistry } from "@/lib/recommendations/recommendation-policy-registry";
import { recommendationPlacementRegistry } from "@/lib/recommendations/recommendation-placement-registry";
import { recommendationCandidateService } from "@/lib/recommendations/recommendation-candidate-service";
import { recommendationRerankingService } from "@/lib/recommendations/recommendation-reranking-service";
import { relatedContentService } from "@/lib/recommendations/related-content-service";
import { nextBestContentService } from "@/lib/recommendations/next-best-content-service";
import { nextBestActionService } from "@/lib/recommendations/next-best-action-service";
import { projectRecommendationService } from "@/lib/recommendations/project-recommendation-service";
import { recommendationPrivacyService } from "@/lib/recommendations/recommendation-privacy-service";
import { recommendationFallbackService } from "@/lib/recommendations/recommendation-fallback-service";
import { recommendationAnalytics } from "@/lib/recommendations/recommendation-analytics";
import { recommendationFrequencyService } from "@/lib/recommendations/recommendation-frequency-service";
import { contextualRecommendationService } from "@/lib/recommendations/contextual-recommendation-service";

export type BuildContextInput = {
  sessionId?: string;
  canonicalUrl?: string;
  contentItemId?: string;
  searchQuery?: string;
  searchIntent?: string;
  searchFilters?: Record<string, string[]>;
  consent?: Partial<RecommendationContext["consent"]>;
};

export async function buildContext(input: BuildContextInput = {}): Promise<RecommendationContext> {
  const requestId = randomUUID();
  const sessionId = input.sessionId;
  const sessionPartial = sessionId ? sessionRecommendationService.getSessionRecommendationContext(sessionId) : {};

  let currentPage: RecommendationContext["currentPage"];
  if (input.contentItemId || input.canonicalUrl) {
    const item = input.contentItemId
      ? await contentRepository.getContentById(input.contentItemId)
      : input.canonicalUrl
        ? await contentRepository.getContentBySlug(input.canonicalUrl.replace(/^\//, ""))
        : null;

    if (item) {
      const entities = entityResolutionService.extractEntitiesFromContent(item);
      const resolved = entityResolutionService.mapContentToEntities(item, entities);
      currentPage = {
        contentItemId: item.id,
        canonicalUrl: item.indexing.canonicalUrl ?? item.url,
        contentType: item.contentType ?? item.kind,
        entityNodeIds: resolved.filter((r) => r.entity).map((r) => r.entity!.id),
        clusterIds: item.clusterId ? [item.clusterId] : [],
      };
    } else if (input.canonicalUrl) {
      currentPage = {
        canonicalUrl: input.canonicalUrl,
        contentType: "unknown",
        entityNodeIds: [],
        clusterIds: [],
      };
    }
  }

  const navMemory = sessionId ? navigationMemoryService.get(sessionId) : undefined;

  const preferences: RecommendationContext["preferences"] = {
    buildingTypes: sessionPartial.preferences?.buildingTypes ?? (navMemory?.buildingType ? [navMemory.buildingType] : []),
    technologies: sessionPartial.preferences?.technologies ?? (navMemory?.technology ? [navMemory.technology] : []),
    materials: sessionPartial.preferences?.materials ?? (navMemory?.material ? [navMemory.material] : []),
    sizes: sessionPartial.preferences?.sizes ?? [],
    areas: sessionPartial.preferences?.areas ?? (navMemory?.area ? [navMemory.area] : []),
    floors: sessionPartial.preferences?.floors ?? (navMemory?.floors ? [navMemory.floors] : []),
    layouts: sessionPartial.preferences?.layouts ?? [],
    locations: sessionPartial.preferences?.locations ?? (navMemory?.location ? [navMemory.location] : []),
  };

  const consent = {
    personalization: input.consent?.personalization ?? true,
    location: input.consent?.location ?? false,
    persistentPreferences: input.consent?.persistentPreferences ?? false,
  };

  let mode: PersonalizationMode = "contextual";
  if (consent.persistentPreferences) {
    mode = "consented";
  } else if (sessionId) {
    mode = "anonymous-session";
  }

  const baseContext: RecommendationContext = {
    requestId,
    sessionId,
    mode,
    currentPage,
    search: input.searchQuery
      ? {
          query: input.searchQuery,
          intent: input.searchIntent,
          entityNodeIds: [],
          filters: input.searchFilters ?? {},
        }
      : undefined,
    preferences,
    journeyStage: sessionPartial.journeyStage ?? "unknown",
    viewedContentIds: sessionPartial.viewedContentIds ?? navMemory?.viewedContentIds ?? [],
    clickedRecommendationIds: sessionPartial.clickedRecommendationIds ?? [],
    dismissedRecommendationIds: sessionPartial.dismissedRecommendationIds ?? [],
    consent,
    createdAt: new Date().toISOString(),
  };

  baseContext.journeyStage = journeyStageService.detectJourneyStage(baseContext);
  return recommendationPrivacyService.enforcePrivacyMode(baseContext);
}

export async function getRecommendations(
  context: RecommendationContext,
  placementId: string,
): Promise<RecommendationItem[]> {
  const started = Date.now();
  recommendationAnalytics.trackRecommendationRequested(context, placementId);

  const placement = recommendationPlacementRegistry.getPlacement(placementId);
  if (!placement) return [];

  const policy = recommendationPolicyRegistry.getPolicy(placement.policyId);
  if (!policy) return [];

  try {
    let candidates = await recommendationCandidateService.generateRecommendationCandidates(context, policy);

    if (candidates.length === 0) {
      const contextual = await contextualRecommendationService.recommendFromCurrentPage(context);
      candidates = [...candidates, ...contextual];
    }

    let ranked = await recommendationRerankingService.rerankRecommendations(candidates, context, policy, {
      placement: placementId,
      limit: placement.maxItems,
    });

    if (ranked.length === 0) {
      const fallback = await recommendationFallbackService.applyRecommendationFallback(context, placementId, ranked);
      if (fallback.usedFallback) {
        ranked = await recommendationRerankingService.rerankRecommendations(
          fallback.items as typeof candidates,
          context,
          policy,
          { placement: placementId, limit: placement.maxItems },
        );
      }
    }

    for (const item of ranked) {
      recommendationFrequencyService.recordRecommendationExposure(item, context, placementId);
    }

    recommendationAnalytics.trackRecommendationGenerated(
      context,
      placementId,
      ranked.length,
      Date.now() - started,
    );

    return ranked;
  } catch {
    recommendationAnalytics.trackGenerationFailed(context, placementId);
    return [];
  }
}

export async function getRelatedContent(
  contentItemId: string,
  context: RecommendationContext,
): Promise<RecommendationItem[]> {
  const candidates = await relatedContentService.getRelatedContent(contentItemId, context);
  const policy = recommendationPolicyRegistry.getPolicy("related-content");
  if (!policy) return [];
  return recommendationRerankingService.rerankRecommendations(candidates, context, policy, { limit: 6 });
}

export async function getNextBestContent(context: RecommendationContext): Promise<RecommendationItem[]> {
  const candidates = await nextBestContentService.recommendNextBestContent(context);
  const policy = recommendationPolicyRegistry.getPolicy("technical-education");
  if (!policy) return [];
  return recommendationRerankingService.rerankRecommendations(candidates, context, policy, { limit: 4 });
}

export function getNextBestAction(context: RecommendationContext): NextBestAction[] {
  return nextBestActionService.recommendNextBestAction(context);
}

export async function getProjectRecommendations(context: RecommendationContext): Promise<RecommendationItem[]> {
  const candidates = projectRecommendationService.recommendProjects(context);
  const policy = recommendationPolicyRegistry.getPolicy("project-discovery");
  if (!policy) return [];
  return recommendationRerankingService.rerankRecommendations(candidates, context, policy, { limit: 6 });
}

export const recommendationOrchestratorService = {
  buildContext,
  getRecommendations,
  getRelatedContent,
  getNextBestContent,
  getNextBestAction,
  getProjectRecommendations,
};
