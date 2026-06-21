import { randomUUID } from "crypto";
import type { RecommendationContext } from "@/types/recommendation-context";
import { recommendationStore, type RecommendationFeedbackRecord } from "@/lib/recommendations/recommendation-store";
import { recommendationAnalytics } from "@/lib/recommendations/recommendation-analytics";

export type RecommendationFeedbackInput = {
  sessionId?: string;
  recommendationId: string;
  contentItemId?: string;
  placement?: string;
  feedbackType: RecommendationFeedbackRecord["feedbackType"];
  message?: string;
};

export function validateRecommendationFeedback(input: RecommendationFeedbackInput): string[] {
  const errors: string[] = [];
  if (!input.recommendationId) errors.push("recommendationId required");
  if (!input.feedbackType) errors.push("feedbackType required");
  return errors;
}

export function submitRecommendationFeedback(input: RecommendationFeedbackInput): RecommendationFeedbackRecord {
  const errors = validateRecommendationFeedback(input);
  if (errors.length > 0) throw new Error(errors.join(", "));

  const record = recommendationStore.saveFeedback({
    sessionId: input.sessionId,
    recommendationId: input.recommendationId,
    contentItemId: input.contentItemId,
    placement: input.placement,
    feedbackType: input.feedbackType,
    message: input.message,
  });

  recommendationAnalytics.trackRecommendationEvent("recommendation_feedback_submitted", {
    sessionId: input.sessionId,
    recommendationId: input.recommendationId,
    contentItemId: input.contentItemId,
    placement: input.placement,
    feedbackType: input.feedbackType,
  });

  if (input.feedbackType === "hide") {
    recommendationAnalytics.trackRecommendationEvent("recommendation_dismissed", {
      sessionId: input.sessionId,
      recommendationId: input.recommendationId,
    });
  }

  return record;
}

export function dismissRecommendation(itemId: string, context: RecommendationContext): void {
  const journey = context.sessionId ? recommendationStore.findJourneyBySession(context.sessionId) : undefined;
  if (journey) {
    journey.dismissedRecommendationIds = [...new Set([...journey.dismissedRecommendationIds, itemId])];
    recommendationStore.saveJourney(journey);
  }
  submitRecommendationFeedback({
    sessionId: context.sessionId,
    recommendationId: itemId,
    contentItemId: itemId,
    feedbackType: "hide",
  });
}

export function undoRecommendationDismissal(itemId: string, context: RecommendationContext): void {
  const journey = context.sessionId ? recommendationStore.findJourneyBySession(context.sessionId) : undefined;
  if (journey) {
    journey.dismissedRecommendationIds = journey.dismissedRecommendationIds.filter((id) => id !== itemId);
    recommendationStore.saveJourney(journey);
  }
}

export function createRecommendationQualityIssue(feedback: RecommendationFeedbackRecord): { id: string; status: string } {
  return { id: randomUUID(), status: "queued" };
}

export function sendFeedbackToReviewQueue(feedback: RecommendationFeedbackRecord): RecommendationFeedbackRecord {
  return recommendationStore.saveFeedback({ ...feedback, status: "queued" });
}

export const recommendationFeedbackService = {
  submitRecommendationFeedback,
  validateRecommendationFeedback,
  dismissRecommendation,
  undoRecommendationDismissal,
  createRecommendationQualityIssue,
  sendFeedbackToReviewQueue,
};
