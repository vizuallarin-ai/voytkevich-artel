import type { PersonalizationMode } from "@/types/recommendation-context";
import type { RecommendationType } from "@/types/recommendation";

export type RecommendationPlacement = {
  id: string;
  label: string;
  allowedTypes: RecommendationType[];
  maxItems: number;
  policyId: string;
  frequencyCap: number;
  privacyMode: PersonalizationMode;
  fallbackPlacementId?: string;
  analyticsEvent: string;
  uiComponent: string;
};

const PLACEMENTS: Record<string, RecommendationPlacement> = {
  "article-related": {
    id: "article-related",
    label: "Связанные материалы статьи",
    allowedTypes: ["related-content", "technology", "material", "faq", "comparison"],
    maxItems: 6,
    policyId: "related-content",
    frequencyCap: 5,
    privacyMode: "contextual",
    fallbackPlacementId: "article-related-fallback",
    analyticsEvent: "placement_article_related",
    uiComponent: "RelatedContentRecommendations",
  },
  "article-next-step": {
    id: "article-next-step",
    label: "Следующий шаг статьи",
    allowedTypes: ["next-content", "comparison", "service", "next-action"],
    maxItems: 3,
    policyId: "technical-education",
    frequencyCap: 3,
    privacyMode: "anonymous-session",
    analyticsEvent: "placement_article_next",
    uiComponent: "NextBestContent",
  },
  "project-similar": {
    id: "project-similar",
    label: "Похожие проекты",
    allowedTypes: ["project", "comparison"],
    maxItems: 6,
    policyId: "project-discovery",
    frequencyCap: 4,
    privacyMode: "anonymous-session",
    analyticsEvent: "placement_project_similar",
    uiComponent: "ProjectRecommendations",
  },
  "project-supporting": {
    id: "project-supporting",
    label: "Материалы по проекту",
    allowedTypes: ["related-content", "technology", "material", "faq"],
    maxItems: 4,
    policyId: "related-content",
    frequencyCap: 4,
    privacyMode: "contextual",
    analyticsEvent: "placement_project_support",
    uiComponent: "RelatedContentRecommendations",
  },
  "service-supporting": {
    id: "service-supporting",
    label: "Материалы по услуге",
    allowedTypes: ["related-content", "faq", "project", "next-content"],
    maxItems: 4,
    policyId: "related-content",
    frequencyCap: 4,
    privacyMode: "contextual",
    analyticsEvent: "placement_service_support",
    uiComponent: "RelatedContentRecommendations",
  },
  "search-continuation": {
    id: "search-continuation",
    label: "Продолжение поиска",
    allowedTypes: ["related-content", "project", "service", "next-content"],
    maxItems: 5,
    policyId: "related-content",
    frequencyCap: 4,
    privacyMode: "anonymous-session",
    analyticsEvent: "placement_search_continuation",
    uiComponent: "RecommendationBlock",
  },
  "search-zero-result": {
    id: "search-zero-result",
    label: "Альтернативы при пустой выдаче",
    allowedTypes: ["related-content", "project", "service", "faq"],
    maxItems: 5,
    policyId: "cold-start",
    frequencyCap: 3,
    privacyMode: "contextual",
    analyticsEvent: "placement_zero_result",
    uiComponent: "RecommendationEmptyState",
  },
  "assistant-actions": {
    id: "assistant-actions",
    label: "Действия AI-помощника",
    allowedTypes: ["next-action", "project", "service", "related-content"],
    maxItems: 4,
    policyId: "next-best-action",
    frequencyCap: 3,
    privacyMode: "anonymous-session",
    analyticsEvent: "placement_assistant",
    uiComponent: "NextBestAction",
  },
  "homepage-personalized": {
    id: "homepage-personalized",
    label: "Персонализированная секция главной",
    allowedTypes: ["project", "service", "related-content", "next-content"],
    maxItems: 6,
    policyId: "cold-start",
    frequencyCap: 4,
    privacyMode: "anonymous-session",
    analyticsEvent: "placement_homepage",
    uiComponent: "RecommendationBlock",
  },
  "comparison-recommendations": {
    id: "comparison-recommendations",
    label: "Рекомендации при сравнении",
    allowedTypes: ["comparison", "technology", "material", "project"],
    maxItems: 4,
    policyId: "comparison-support",
    frequencyCap: 4,
    privacyMode: "anonymous-session",
    analyticsEvent: "placement_comparison",
    uiComponent: "RecommendationBlock",
  },
  "saved-selection": {
    id: "saved-selection",
    label: "Сохранённый подбор",
    allowedTypes: ["project", "comparison", "next-content"],
    maxItems: 8,
    policyId: "project-discovery",
    frequencyCap: 6,
    privacyMode: "consented",
    analyticsEvent: "placement_saved_selection",
    uiComponent: "ProjectRecommendations",
  },
  "cta-context": {
    id: "cta-context",
    label: "Контекст CTA",
    allowedTypes: ["next-action", "service", "project"],
    maxItems: 2,
    policyId: "commercial-transition",
    frequencyCap: 2,
    privacyMode: "anonymous-session",
    analyticsEvent: "placement_cta",
    uiComponent: "NextBestAction",
  },
  "article-related-fallback": {
    id: "article-related-fallback",
    label: "Fallback связанных материалов",
    allowedTypes: ["related-content", "faq"],
    maxItems: 4,
    policyId: "cold-start",
    frequencyCap: 3,
    privacyMode: "contextual",
    analyticsEvent: "placement_article_fallback",
    uiComponent: "RecommendationEmptyState",
  },
};

export function getRecommendationPlacement(placementId: string): RecommendationPlacement | undefined {
  return PLACEMENTS[placementId];
}

export function listRecommendationPlacements(): RecommendationPlacement[] {
  return Object.values(PLACEMENTS);
}

export function isPlacementAllowed(placementId: string): boolean {
  return placementId in PLACEMENTS;
}

export const recommendationPlacementRegistry = {
  getPlacement: getRecommendationPlacement,
  listPlacements: listRecommendationPlacements,
  isAllowed: isPlacementAllowed,
  placements: PLACEMENTS,
};
