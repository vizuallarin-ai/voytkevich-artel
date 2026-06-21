import type { PersonalizationMode } from "@/types/recommendation-context";
import type { RecommendationType } from "@/types/recommendation";

export type RecommendationPolicy = {
  id: string;
  label: string;
  allowedTypes: RecommendationType[];
  allowedSources: Array<
    | "knowledge-graph"
    | "taxonomy"
    | "search"
    | "session"
    | "analytics"
    | "manual-rule"
    | "popular"
    | "cold-start"
  >;
  rankingPreset: string;
  diversityMinTypes: number;
  frequencyCap: number;
  minConfidence: "low" | "medium" | "high";
  explanationTemplate: string;
  fallbackPolicyId?: string;
  analyticsEvent: string;
  privacyMode: PersonalizationMode;
  requireEligibility: boolean;
};

const POLICIES: Record<string, RecommendationPolicy> = {
  "related-content": {
    id: "related-content",
    label: "Связанные материалы",
    allowedTypes: ["related-content", "technology", "material", "faq", "comparison"],
    allowedSources: ["knowledge-graph", "taxonomy", "search", "manual-rule", "session"],
    rankingPreset: "relevance-first",
    diversityMinTypes: 2,
    frequencyCap: 5,
    minConfidence: "low",
    explanationTemplate: "Продолжает тему текущей страницы",
    fallbackPolicyId: "cold-start",
    analyticsEvent: "recommendation_related",
    privacyMode: "contextual",
    requireEligibility: true,
  },
  "project-discovery": {
    id: "project-discovery",
    label: "Подбор проектов",
    allowedTypes: ["project", "comparison", "technology", "material"],
    allowedSources: ["taxonomy", "search", "session", "analytics", "popular"],
    rankingPreset: "preference-match",
    diversityMinTypes: 2,
    frequencyCap: 4,
    minConfidence: "medium",
    explanationTemplate: "Подходит по выбранным параметрам",
    fallbackPolicyId: "cold-start",
    analyticsEvent: "recommendation_projects",
    privacyMode: "anonymous-session",
    requireEligibility: true,
  },
  "technical-education": {
    id: "technical-education",
    label: "Техническое обучение",
    allowedTypes: ["related-content", "next-content", "faq", "comparison", "technology"],
    allowedSources: ["knowledge-graph", "taxonomy", "search", "manual-rule"],
    rankingPreset: "journey-education",
    diversityMinTypes: 3,
    frequencyCap: 6,
    minConfidence: "low",
    explanationTemplate: "Помогает разобраться в теме",
    analyticsEvent: "recommendation_education",
    privacyMode: "contextual",
    requireEligibility: true,
  },
  "comparison-support": {
    id: "comparison-support",
    label: "Поддержка сравнения",
    allowedTypes: ["comparison", "technology", "material", "project", "faq"],
    allowedSources: ["knowledge-graph", "taxonomy", "search", "session"],
    rankingPreset: "comparison",
    diversityMinTypes: 2,
    frequencyCap: 4,
    minConfidence: "medium",
    explanationTemplate: "Помогает сравнить варианты",
    analyticsEvent: "recommendation_comparison",
    privacyMode: "anonymous-session",
    requireEligibility: true,
  },
  "commercial-transition": {
    id: "commercial-transition",
    label: "Коммерческий переход",
    allowedTypes: ["service", "project", "next-action", "next-content"],
    allowedSources: ["knowledge-graph", "taxonomy", "session", "analytics"],
    rankingPreset: "journey-commercial",
    diversityMinTypes: 2,
    frequencyCap: 2,
    minConfidence: "medium",
    explanationTemplate: "Следующий шаг к решению",
    analyticsEvent: "recommendation_commercial",
    privacyMode: "anonymous-session",
    requireEligibility: true,
  },
  "local-navigation": {
    id: "local-navigation",
    label: "Локальная навигация",
    allowedTypes: ["location", "service", "project", "faq"],
    allowedSources: ["taxonomy", "search", "manual-rule", "knowledge-graph"],
    rankingPreset: "location-first",
    diversityMinTypes: 2,
    frequencyCap: 4,
    minConfidence: "medium",
    explanationTemplate: "Актуально для выбранного региона",
    analyticsEvent: "recommendation_local",
    privacyMode: "contextual",
    requireEligibility: true,
  },
  "next-best-action": {
    id: "next-best-action",
    label: "Следующее действие",
    allowedTypes: ["next-action"],
    allowedSources: ["session", "analytics", "knowledge-graph"],
    rankingPreset: "action-journey",
    diversityMinTypes: 1,
    frequencyCap: 2,
    minConfidence: "medium",
    explanationTemplate: "Рекомендуемый следующий шаг",
    analyticsEvent: "recommendation_action",
    privacyMode: "anonymous-session",
    requireEligibility: true,
  },
  "cold-start": {
    id: "cold-start",
    label: "Cold start",
    allowedTypes: ["related-content", "project", "service", "technology", "faq", "next-content"],
    allowedSources: ["popular", "taxonomy", "knowledge-graph", "manual-rule", "cold-start"],
    rankingPreset: "diverse-popular",
    diversityMinTypes: 3,
    frequencyCap: 5,
    minConfidence: "low",
    explanationTemplate: "Популярные материалы раздела",
    analyticsEvent: "recommendation_cold_start",
    privacyMode: "contextual",
    requireEligibility: true,
  },
};

export function getRecommendationPolicy(policyId: string): RecommendationPolicy | undefined {
  return POLICIES[policyId];
}

export function listRecommendationPolicies(): RecommendationPolicy[] {
  return Object.values(POLICIES);
}

export const recommendationPolicyRegistry = {
  getPolicy: getRecommendationPolicy,
  listPolicies: listRecommendationPolicies,
  policies: POLICIES,
};
