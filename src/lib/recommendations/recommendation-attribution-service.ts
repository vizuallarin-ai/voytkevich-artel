import { randomUUID } from "crypto";
import type { RecommendationJourneyRecord } from "@/lib/recommendations/recommendation-store";
import { recommendationStore } from "@/lib/recommendations/recommendation-store";
import { recommendationAnalytics } from "@/lib/recommendations/recommendation-analytics";

export type RecommendationAttributionType = "direct" | "assisted" | "journey-support" | "unknown";

export type RecommendationAttributionResult = {
  leadId: string;
  type: RecommendationAttributionType;
  confidence: "low" | "medium" | "high";
  recommendationIds: string[];
  journeyId?: string;
};

export function buildRecommendationJourney(sessionId: string): RecommendationJourneyRecord | null {
  const existing = recommendationStore.findJourneyBySession(sessionId);
  if (existing) return existing;

  return recommendationStore.saveJourney({
    id: randomUUID(),
    sessionId,
    viewedContentIds: [],
    clickedRecommendationIds: [],
    dismissedRecommendationIds: [],
    journeyStage: "unknown",
    personalizationMode: "anonymous-session",
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
}

export function calculateRecommendationAssistanceConfidence(
  journey: RecommendationJourneyRecord,
): "low" | "medium" | "high" {
  const clicks = journey.clickedRecommendationIds.length;
  if (clicks >= 3) return "high";
  if (clicks >= 1) return "medium";
  return "low";
}

export function attributeLeadToRecommendations(
  leadId: string,
  journey: RecommendationJourneyRecord,
): RecommendationAttributionResult {
  const confidence = calculateRecommendationAssistanceConfidence(journey);
  let type: RecommendationAttributionType = "unknown";

  if (journey.clickedRecommendationIds.length >= 2) {
    type = "direct";
  } else if (journey.clickedRecommendationIds.length === 1) {
    type = "assisted";
  } else if (journey.viewedContentIds.length > 0) {
    type = "journey-support";
  }

  recommendationAnalytics.trackRecommendationEvent("recommendation_to_lead", {
    sessionId: journey.sessionId,
    recommendationId: journey.clickedRecommendationIds[0],
    confidence,
  });

  return {
    leadId,
    type,
    confidence,
    recommendationIds: journey.clickedRecommendationIds,
    journeyId: journey.id,
  };
}

function filterByPeriod<T extends { occurredAt?: string; createdAt?: string; lastActivityAt?: string }>(
  items: T[],
  period?: { from: string; to: string },
): T[] {
  if (!period) return items;
  const from = new Date(period.from).getTime();
  const to = new Date(period.to).getTime();
  return items.filter((item) => {
    const ts = new Date(item.occurredAt ?? item.createdAt ?? item.lastActivityAt ?? 0).getTime();
    return ts >= from && ts <= to;
  });
}

export function getRecommendationAssistedLeads(period?: { from: string; to: string }): RecommendationAttributionResult[] {
  return filterByPeriod(recommendationStore.listJourneys(), period)
    .filter((j) => j.clickedRecommendationIds.length > 0 && j.convertedLeadId)
    .map((j) => attributeLeadToRecommendations(j.convertedLeadId!, j));
}

export function getDirectRecommendationLeads(period?: { from: string; to: string }): RecommendationAttributionResult[] {
  return getRecommendationAssistedLeads(period).filter((r) => r.type === "direct");
}

export function getQualifiedLeadsByRecommendationType(
  _type: string,
  period?: { from: string; to: string },
): number {
  return getRecommendationAssistedLeads(period).filter((r) => r.confidence === "high").length;
}

export function getLeadsByPlacement(placement: string, period?: { from: string; to: string }): number {
  const events = filterByPeriod(recommendationAnalytics.listEvents(2000), period);
  return events.filter((e) => e.eventName === "recommendation_to_lead" && e.payload.placement === placement).length;
}

export function getRecommendationsBeforeConversion(leadId: string): string[] {
  const journey = recommendationStore.listJourneys().find((j) => j.convertedLeadId === leadId);
  return journey?.clickedRecommendationIds ?? [];
}

export const recommendationAttributionService = {
  buildRecommendationJourney,
  attributeLeadToRecommendations,
  getRecommendationAssistedLeads,
  getDirectRecommendationLeads,
  getQualifiedLeadsByRecommendationType,
  getLeadsByPlacement,
  getRecommendationsBeforeConversion,
  calculateRecommendationAssistanceConfidence,
};
