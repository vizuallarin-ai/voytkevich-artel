import { trackEvent } from "@/lib/analytics/events";

export function trackTechnicalArticleViewed(payload: Record<string, unknown>) {
  trackEvent("technical_article_viewed", payload);
}

export function trackTechnicalCtaClicked(payload: Record<string, unknown>) {
  trackEvent("technical_cta_clicked", payload);
}

export function trackTechnicalLeadMagnetClicked(payload: Record<string, unknown>) {
  trackEvent("technical_lead_magnet_clicked", payload);
}

export function trackTechnicalLeadFormStarted(payload: Record<string, unknown>) {
  trackEvent("technical_lead_form_started", payload);
}

export function trackTechnicalLeadSubmitted(payload: Record<string, unknown>) {
  trackEvent("technical_lead_submitted", payload);
}

export function trackTechnicalRelatedProjectClicked(payload: Record<string, unknown>) {
  trackEvent("technical_related_project_clicked", payload);
}

export function trackTechnicalRelatedArticleClicked(payload: Record<string, unknown>) {
  trackEvent("technical_related_article_clicked", payload);
}

export function trackTechnicalFaqOpened(payload: Record<string, unknown>) {
  trackEvent("technical_faq_opened", payload);
}
