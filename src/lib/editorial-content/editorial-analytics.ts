import { trackEvent } from "@/lib/analytics/events";

export function trackEditorialArticleViewed(payload: Record<string, unknown>) {
  trackEvent("editorial_article_viewed", payload);
}

export function trackEditorialAuthorClicked(payload: Record<string, unknown>) {
  trackEvent("editorial_author_clicked", payload);
}

export function trackEditorialCtaClicked(payload: Record<string, unknown>) {
  trackEvent("editorial_cta_clicked", payload);
}

export function trackEditorialLeadMagnetClicked(payload: Record<string, unknown>) {
  trackEvent("editorial_lead_magnet_clicked", payload);
}

export function trackEditorialLeadFormStarted(payload: Record<string, unknown>) {
  trackEvent("editorial_lead_form_started", payload);
}

export function trackEditorialLeadSubmitted(payload: Record<string, unknown>) {
  trackEvent("editorial_lead_submitted", payload);
}

export function trackEditorialRelatedProjectClicked(payload: Record<string, unknown>) {
  trackEvent("editorial_related_project_clicked", payload);
}

export function trackEditorialRelatedTechnicalArticleClicked(payload: Record<string, unknown>) {
  trackEvent("editorial_related_technical_article_clicked", payload);
}

export function trackEditorialFictionNoticeViewed(payload: Record<string, unknown>) {
  trackEvent("editorial_fiction_notice_viewed", payload);
}

export function trackEditorialSourceClicked(payload: Record<string, unknown>) {
  trackEvent("editorial_source_clicked", payload);
}

export function buildEditorialAnalyticsPayload(
  item: {
    slug: string;
    type: string;
    rubricId: string;
    authorId: string;
    url: string;
    storyMeta: { isFictionalized: boolean };
    cta: { sourceCTA: string; leadMagnetId?: string };
  },
  extra?: Record<string, unknown>,
) {
  return {
    contentSlug: item.slug,
    contentType: item.type,
    rubricId: item.rubricId,
    authorId: item.authorId,
    isFictionalized: item.storyMeta.isFictionalized,
    sourceCTA: item.cta.sourceCTA,
    leadMagnetId: item.cta.leadMagnetId,
    currentUrl: item.url,
    ...extra,
  };
}
