import { randomUUID } from "crypto";
import { trackEvent } from "@/lib/analytics/events";
import type { ContentAnalyticsEventPayload } from "@/lib/content-analytics/event-taxonomy";
import { sanitizeContentAnalyticsPayload } from "@/lib/content-analytics/event-taxonomy";

function buildPayload(
  eventName: string,
  partial: Omit<ContentAnalyticsEventPayload, "eventId" | "eventName" | "occurredAt"> = {},
): ContentAnalyticsEventPayload {
  return sanitizeContentAnalyticsPayload({
    eventId: randomUUID(),
    eventName,
    occurredAt: new Date().toISOString(),
    ...partial,
  });
}

function trackContentAnalyticsEvent(
  eventName: string,
  partial: Omit<ContentAnalyticsEventPayload, "eventId" | "eventName" | "occurredAt"> = {},
): ContentAnalyticsEventPayload {
  const payload = buildPayload(eventName, partial);
  trackEvent(eventName, payload as unknown as Record<string, unknown>);
  return payload;
}

export function trackContentPlanned(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_planned", payload);
}

export function trackContentCreated(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_created", payload);
}

export function trackContentSentToReview(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_sent_to_review", payload);
}

export function trackContentApproved(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_approved", payload);
}

export function trackContentPublished(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_published", payload);
}

export function trackContentUpdated(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_updated", payload);
}

export function trackContentArchived(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_archived", payload);
}

export function trackContentIndexed(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_indexed", payload);
}

export function trackContentViewed(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_viewed", payload);
}

export function trackContentLeadCreated(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_lead_created", payload);
}

export function trackContentLeadQualified(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_lead_qualified", payload);
}

export function trackContentPerformanceRecalculated(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_performance_recalculated", payload);
}

export function trackContentDecayDetected(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_decay_detected", payload);
}

export function trackContentUnderperformanceDetected(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_underperformance_detected", payload);
}

export function trackContentWinnerDetected(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_winner_detected", payload);
}

export function trackContentUpdateRecommended(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_update_recommended", payload);
}

export function trackPriorityFeedbackGenerated(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("priority_feedback_generated", payload);
}

export function trackCalendarFeedbackGenerated(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("calendar_feedback_generated", payload);
}

export function trackTeaserPublished(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("teaser_published", payload);
}

export function trackTeaserClicked(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("teaser_clicked", payload);
}

export function trackContentAnalyticsDashboardViewed(payload?: Partial<ContentAnalyticsEventPayload>) {
  return trackContentAnalyticsEvent("content_performance_recalculated", {
    ...payload,
    metadata: { ...payload?.metadata, dashboard: "main" },
  });
}
