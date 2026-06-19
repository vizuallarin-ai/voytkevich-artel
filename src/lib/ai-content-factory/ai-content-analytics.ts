import { trackEvent } from "@/lib/analytics/events";

type AIPayload = Record<string, unknown>;

export function trackAIContentGenerateOpened(payload: AIPayload) {
  trackEvent("ai_content_generate_opened", payload);
}

export function trackAIContentGenerationStarted(payload: AIPayload) {
  trackEvent("ai_content_generation_started", payload);
}

export function trackAIContentGenerationCompleted(payload: AIPayload) {
  trackEvent("ai_content_generation_completed", payload);
}

export function trackAIContentGenerationFailed(payload: AIPayload) {
  trackEvent("ai_content_generation_failed", payload);
}

export function trackAIContentValidationFailed(payload: AIPayload) {
  trackEvent("ai_content_validation_failed", payload);
}

export function trackAIContentSavedToCMS(payload: AIPayload) {
  trackEvent("ai_content_saved_to_cms", payload);
}

export function trackAIContentSentToReview(payload: AIPayload) {
  trackEvent("ai_content_sent_to_review", payload);
}

export function trackAIContentDiscarded(payload: AIPayload) {
  trackEvent("ai_content_discarded", payload);
}

export function trackAITeaserPackageGenerated(payload: AIPayload) {
  trackEvent("ai_teaser_package_generated", payload);
}

export function trackAIGenerationHistoryOpened(payload: AIPayload) {
  trackEvent("ai_generation_history_opened", payload);
}
