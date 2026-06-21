import { randomUUID } from "crypto";
import { trackEvent } from "@/lib/analytics/events";
import { searchStore } from "@/lib/search/search-store";

const PII_KEYS = new Set(["email", "phone", "name", "contact", "message", "comment"]);
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE = /(?:\+?7|8)\s*\(?\d{3}\)?[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g;

export type SearchAnalyticsEventName =
  | "search_query_submitted"
  | "search_results_returned"
  | "search_result_clicked"
  | "search_suggestion_shown"
  | "search_suggestion_clicked"
  | "search_correction_applied"
  | "search_facet_applied"
  | "search_zero_result_detected"
  | "search_zero_result_recovered"
  | "search_feedback_submitted"
  | "search_index_build_started"
  | "search_index_build_completed"
  | "search_index_build_failed"
  | "search_session_started"
  | "search_session_ended";

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(EMAIL_RE, "[redacted-email]").replace(PHONE_RE, "[redacted-phone]");
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }
  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (PII_KEYS.has(key.toLowerCase())) continue;
      sanitized[key] = sanitizeValue(entry);
    }
    return sanitized;
  }
  return value;
}

function sanitizePayload(payload?: Record<string, unknown>): Record<string, unknown> {
  if (!payload) return {};
  return sanitizeValue(payload) as Record<string, unknown>;
}

function trackSearchEvent(eventName: SearchAnalyticsEventName, payload?: Record<string, unknown>) {
  const safePayload = sanitizePayload(payload);
  const event = {
    eventId: randomUUID(),
    eventName,
    occurredAt: new Date().toISOString(),
    ...safePayload,
  };

  trackEvent(eventName, event);
  searchStore.saveAnalyticsEvent({ eventName, payload: event });
  return event;
}

export const searchAnalytics = {
  trackEvent: trackSearchEvent,

  trackSearchQuerySubmitted(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_query_submitted", payload);
  },

  trackSearchResultsReturned(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_results_returned", payload);
  },

  trackSearchResultClicked(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_result_clicked", payload);
  },

  trackSearchSuggestionShown(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_suggestion_shown", payload);
  },

  trackSearchSuggestionClicked(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_suggestion_clicked", payload);
  },

  trackSearchCorrectionApplied(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_correction_applied", payload);
  },

  trackSearchFacetApplied(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_facet_applied", payload);
  },

  trackSearchZeroResultDetected(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_zero_result_detected", payload);
  },

  trackSearchZeroResultRecovered(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_zero_result_recovered", payload);
  },

  trackSearchFeedbackSubmitted(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_feedback_submitted", payload);
  },

  trackSearchIndexBuildStarted(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_index_build_started", payload);
  },

  trackSearchIndexBuildCompleted(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_index_build_completed", payload);
  },

  trackSearchIndexBuildFailed(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_index_build_failed", payload);
  },

  trackSearchSessionStarted(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_session_started", payload);
  },

  trackSearchSessionEnded(payload?: Record<string, unknown>) {
    return trackSearchEvent("search_session_ended", payload);
  },
};
