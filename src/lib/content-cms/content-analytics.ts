import { trackEvent } from "@/lib/analytics/events";

export function trackContentDashboardViewed(payload: Record<string, unknown>) {
  trackEvent("content_dashboard_viewed", payload);
}

export function trackContentItemOpened(payload: Record<string, unknown>) {
  trackEvent("content_item_opened", payload);
}

export function trackContentStatusChanged(payload: Record<string, unknown>) {
  trackEvent("content_status_changed", payload);
}

export function trackContentSentToReview(payload: Record<string, unknown>) {
  trackEvent("content_sent_to_review", payload);
}

export function trackContentApproved(payload: Record<string, unknown>) {
  trackEvent("content_approved", payload);
}

export function trackContentRejected(payload: Record<string, unknown>) {
  trackEvent("content_rejected", payload);
}

export function trackContentQualityIssueViewed(payload: Record<string, unknown>) {
  trackEvent("content_quality_issue_viewed", payload);
}

export function trackContentBulkActionRequested(payload: Record<string, unknown>) {
  trackEvent("content_bulk_action_requested", payload);
}
