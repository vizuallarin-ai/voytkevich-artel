import { trackEvent } from "@/lib/analytics/events";

export function trackPriorityDashboardViewed(payload?: Record<string, unknown>) {
  trackEvent("priority_dashboard_viewed", payload);
}

export function trackKeywordCsvImportStarted(payload?: Record<string, unknown>) {
  trackEvent("keyword_csv_import_started", payload);
}

export function trackKeywordCsvImportCompleted(payload?: Record<string, unknown>) {
  trackEvent("keyword_csv_import_completed", payload);
}

export function trackKeywordCsvImportFailed(payload?: Record<string, unknown>) {
  trackEvent("keyword_csv_import_failed", payload);
}

export function trackPriorityRecalculated(payload?: Record<string, unknown>) {
  trackEvent("priority_recalculated", payload);
}

export function trackPriorityQueueViewed(payload?: Record<string, unknown>) {
  trackEvent("priority_queue_viewed", payload);
}

export function trackPriorityItemSentToCalendar(payload?: Record<string, unknown>) {
  trackEvent("priority_item_sent_to_calendar", payload);
}

export function trackPriorityItemSentToAIFactory(payload?: Record<string, unknown>) {
  trackEvent("priority_item_sent_to_ai_factory", payload);
}

export function trackKeywordMappedToContent(payload?: Record<string, unknown>) {
  trackEvent("keyword_mapped_to_content", payload);
}

export function trackSemanticClusterCreated(payload?: Record<string, unknown>) {
  trackEvent("semantic_cluster_created", payload);
}

export function trackPriorityFilterUsed(payload?: Record<string, unknown>) {
  trackEvent("priority_filter_used", payload);
}
