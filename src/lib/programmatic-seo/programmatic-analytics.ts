import { trackEvent } from "@/lib/analytics/events";

export function trackProgrammaticPageViewed(payload: Record<string, unknown>) {
  trackEvent("programmatic_page_viewed", payload);
}

export function trackProgrammaticProjectClicked(payload: Record<string, unknown>) {
  trackEvent("programmatic_project_clicked", payload);
}

export function trackProgrammaticFilterUsed(payload: Record<string, unknown>) {
  trackEvent("programmatic_filter_used", payload);
}

export function trackProgrammaticCtaClicked(payload: Record<string, unknown>) {
  trackEvent("programmatic_cta_clicked", payload);
}

export function trackProgrammaticLeadFormStarted(payload: Record<string, unknown>) {
  trackEvent("programmatic_lead_form_started", payload);
}

export function trackProgrammaticLeadSubmitted(payload: Record<string, unknown>) {
  trackEvent("programmatic_lead_submitted", payload);
}

export function trackProgrammaticRelatedPageClicked(payload: Record<string, unknown>) {
  trackEvent("programmatic_related_page_clicked", payload);
}

export function trackProgrammaticLeadMagnetClicked(payload: Record<string, unknown>) {
  trackEvent("programmatic_lead_magnet_clicked", payload);
}
