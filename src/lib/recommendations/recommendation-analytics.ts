import { randomUUID } from "crypto";
import type { RecommendationContext } from "@/types/recommendation-context";
import { recommendationStore } from "@/lib/recommendations/recommendation-store";

export type RecommendationAnalyticsPayload = {
  requestId?: string;
  sessionId?: string;
  recommendationId?: string;
  placement?: string;
  recommendationType?: string;
  contentItemId?: string;
  position?: number;
  scoreBand?: "low" | "medium" | "high";
  confidence?: string;
  reasonCodes?: string[];
  personalizationMode?: string;
  journeyStage?: string;
  clicked?: boolean;
  feedbackType?: string;
  latencyMs?: number;
};

const EVENT_NAMES = [
  "recommendation_requested",
  "recommendation_generated",
  "recommendation_viewed",
  "recommendation_clicked",
  "recommendation_dismissed",
  "recommendation_feedback_submitted",
  "recommendation_action_selected",
  "recommendation_to_search",
  "recommendation_to_cta",
  "recommendation_to_lead",
  "recommendation_to_qualified_lead",
  "recommendation_preferences_updated",
  "recommendation_profile_reset",
  "personalization_enabled",
  "personalization_disabled",
  "recommendation_fallback_used",
  "recommendation_generation_failed",
] as const;

export type RecommendationAnalyticsEventName = (typeof EVENT_NAMES)[number];

function scoreBand(score: number): "low" | "medium" | "high" {
  if (score >= 0.65) return "high";
  if (score >= 0.35) return "medium";
  return "low";
}

export function trackRecommendationEvent(
  eventName: RecommendationAnalyticsEventName,
  payload: RecommendationAnalyticsPayload,
): void {
  recommendationStore.saveAnalyticsEvent({
    eventName,
    payload: {
      ...payload,
      scoreBand: payload.scoreBand ?? (payload.confidence as RecommendationAnalyticsPayload["scoreBand"]),
    },
  });
}

export function trackRecommendationRequested(context: RecommendationContext, placement: string): void {
  trackRecommendationEvent("recommendation_requested", {
    requestId: context.requestId,
    sessionId: context.sessionId,
    placement,
    personalizationMode: context.mode,
    journeyStage: context.journeyStage,
  });
}

export function trackRecommendationGenerated(
  context: RecommendationContext,
  placement: string,
  count: number,
  latencyMs: number,
): void {
  trackRecommendationEvent("recommendation_generated", {
    requestId: context.requestId,
    sessionId: context.sessionId,
    placement,
    personalizationMode: context.mode,
    journeyStage: context.journeyStage,
    latencyMs,
    position: count,
  });
}

export function trackRecommendationViewed(
  context: RecommendationContext,
  recommendationId: string,
  placement: string,
  position: number,
): void {
  trackRecommendationEvent("recommendation_viewed", {
    requestId: context.requestId,
    sessionId: context.sessionId,
    recommendationId,
    placement,
    position,
    personalizationMode: context.mode,
  });
}

export function trackRecommendationClicked(
  context: RecommendationContext,
  recommendationId: string,
  placement: string,
): void {
  trackRecommendationEvent("recommendation_clicked", {
    requestId: context.requestId,
    sessionId: context.sessionId,
    recommendationId,
    placement,
    clicked: true,
    personalizationMode: context.mode,
  });
}

export function trackFallbackUsed(context: RecommendationContext, placement: string): void {
  trackRecommendationEvent("recommendation_fallback_used", {
    requestId: context.requestId,
    sessionId: context.sessionId,
    placement,
    personalizationMode: context.mode,
  });
}

export function trackGenerationFailed(context: RecommendationContext, placement: string): void {
  trackRecommendationEvent("recommendation_generation_failed", {
    requestId: context.requestId,
    sessionId: context.sessionId,
    placement,
  });
}

export function listEvents(limit = 1000) {
  return recommendationStore.listAnalyticsEvents(limit);
}

export const recommendationAnalytics = {
  trackRecommendationEvent,
  trackRecommendationRequested,
  trackRecommendationGenerated,
  trackRecommendationViewed,
  trackRecommendationClicked,
  trackFallbackUsed,
  trackGenerationFailed,
  listEvents,
  scoreBand,
  EVENT_NAMES,
};
