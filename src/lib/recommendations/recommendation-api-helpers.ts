import { randomUUID } from "crypto";
import type { RecommendationContext } from "@/types/recommendation-context";
import { recommendationOrchestratorService } from "@/lib/recommendations/recommendation-orchestrator-service";

export function parseRecommendationQueryParams(searchParams: URLSearchParams) {
  return {
    placement: searchParams.get("placement") ?? "article-related",
    sessionId: searchParams.get("sessionId") ?? undefined,
    contentItemId: searchParams.get("contentItemId") ?? undefined,
    canonicalUrl: searchParams.get("canonicalUrl") ?? undefined,
    searchQuery: searchParams.get("searchQuery") ?? undefined,
    searchIntent: searchParams.get("searchIntent") ?? undefined,
    consentPersonalization: searchParams.get("consentPersonalization") !== "false",
    consentLocation: searchParams.get("consentLocation") === "true",
    consentPersistent: searchParams.get("consentPersistent") === "true",
  };
}

export async function buildContextFromRequest(searchParams: URLSearchParams): Promise<RecommendationContext> {
  const params = parseRecommendationQueryParams(searchParams);
  return recommendationOrchestratorService.buildContext({
    sessionId: params.sessionId ?? randomUUID(),
    contentItemId: params.contentItemId,
    canonicalUrl: params.canonicalUrl,
    searchQuery: params.searchQuery,
    searchIntent: params.searchIntent,
    consent: {
      personalization: params.consentPersonalization,
      location: params.consentLocation,
      persistentPreferences: params.consentPersistent,
    },
  });
}
