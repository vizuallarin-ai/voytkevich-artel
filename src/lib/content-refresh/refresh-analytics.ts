import { randomUUID } from "crypto";
import { trackEvent } from "@/lib/analytics/events";

export type RefreshAnalyticsPayload = {
  contentItemId?: string;
  candidateId?: string;
  briefId?: string;
  versionId?: string;
  experimentId?: string;
  reason?: string;
  priority?: string;
  confidence?: string;
  reviewType?: string;
  changeMagnitude?: string;
  riskLevel?: string;
  outcome?: string;
};

const ALLOWED_KEYS = new Set([
  "contentItemId",
  "candidateId",
  "briefId",
  "versionId",
  "experimentId",
  "reason",
  "priority",
  "confidence",
  "reviewType",
  "changeMagnitude",
  "riskLevel",
  "outcome",
]);

function sanitizePayload(payload: RefreshAnalyticsPayload): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!ALLOWED_KEYS.has(key) || value == null) continue;
    result[key] = String(value).slice(0, 200);
  }
  return result;
}

function trackRefreshEvent(eventName: string, payload: RefreshAnalyticsPayload = {}): void {
  trackEvent(eventName, {
    eventId: randomUUID(),
    occurredAt: new Date().toISOString(),
    ...sanitizePayload(payload),
  });
}

export function trackRefreshCandidateDetected(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_candidate_detected", payload);
}

export function trackRefreshCandidateDismissed(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_candidate_dismissed", payload);
}

export function trackRefreshCandidateDeferred(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_candidate_deferred", payload);
}

export function trackRefreshBriefCreated(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_brief_created", payload);
}

export function trackRefreshDraftGenerated(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_draft_generated", payload);
}

export function trackRefreshSourceVerificationStarted(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_source_verification_started", payload);
}

export function trackRefreshSourceVerificationFailed(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_source_verification_failed", payload);
}

export function trackRefreshReviewRequested(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_review_requested", payload);
}

export function trackRefreshReviewApproved(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_review_approved", payload);
}

export function trackRefreshReviewRejected(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_review_rejected", payload);
}

export function trackRefreshVersionPublished(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_version_published", payload);
}

export function trackRefreshMonitoringStarted(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_monitoring_started", payload);
}

export function trackRefreshImprovementDetected(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_improvement_detected", payload);
}

export function trackRefreshRegressionDetected(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_regression_detected", payload);
}

export function trackRefreshRollbackRecommended(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_rollback_recommended", payload);
}

export function trackRefreshRollbackCompleted(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("refresh_rollback_completed", payload);
}

export function trackExperimentCreated(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("experiment_created", payload);
}

export function trackExperimentStarted(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("experiment_started", payload);
}

export function trackExperimentPaused(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("experiment_paused", payload);
}

export function trackExperimentCompleted(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("experiment_completed", payload);
}

export function trackExperimentGuardrailViolated(payload: RefreshAnalyticsPayload): void {
  trackRefreshEvent("experiment_guardrail_violated", payload);
}

export const refreshAnalytics = {
  trackRefreshCandidateDetected,
  trackRefreshCandidateDismissed,
  trackRefreshCandidateDeferred,
  trackRefreshBriefCreated,
  trackRefreshDraftGenerated,
  trackRefreshSourceVerificationStarted,
  trackRefreshSourceVerificationFailed,
  trackRefreshReviewRequested,
  trackRefreshReviewApproved,
  trackRefreshReviewRejected,
  trackRefreshVersionPublished,
  trackRefreshMonitoringStarted,
  trackRefreshImprovementDetected,
  trackRefreshRegressionDetected,
  trackRefreshRollbackRecommended,
  trackRefreshRollbackCompleted,
  trackExperimentCreated,
  trackExperimentStarted,
  trackExperimentPaused,
  trackExperimentCompleted,
  trackExperimentGuardrailViolated,
};
