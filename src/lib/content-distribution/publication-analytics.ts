import { trackEvent } from "@/lib/analytics/events";

type Payload = Record<string, unknown>;

export function trackDistributionDashboardViewed(payload: Payload) {
  trackEvent("distribution_dashboard_viewed", payload);
}

export function trackPublicationDraftCreated(payload: Payload) {
  trackEvent("publication_draft_created", payload);
}

export function trackPublicationValidated(payload: Payload) {
  trackEvent("publication_validated", payload);
}

export function trackPublicationApproved(payload: Payload) {
  trackEvent("publication_approved", payload);
}

export function trackPublicationScheduled(payload: Payload) {
  trackEvent("publication_scheduled", payload);
}

export function trackPublicationPublishStarted(payload: Payload) {
  trackEvent("publication_publish_started", payload);
}

export function trackPublicationPublished(payload: Payload) {
  trackEvent("publication_published", payload);
}

export function trackPublicationFailed(payload: Payload) {
  trackEvent("publication_failed", payload);
}

export function trackPublicationManualExportOpened(payload: Payload) {
  trackEvent("publication_manual_export_opened", payload);
}

export function trackPublicationManualExportCopied(payload: Payload) {
  trackEvent("publication_manual_export_copied", payload);
}

export function trackPublicationMarkedPublishedManually(payload: Payload) {
  trackEvent("publication_marked_published_manually", payload);
}

export function trackPublicationCancelled(payload: Payload) {
  trackEvent("publication_cancelled", payload);
}

export function trackTeaserClick(payload: Payload) {
  trackEvent("teaser_click", payload);
}

export function trackFullArticleViewFromTeaser(payload: Payload) {
  trackEvent("full_article_view_from_teaser", payload);
}

export function trackLeadFromTeaser(payload: Payload) {
  trackEvent("lead_from_teaser", payload);
}

export function trackPlatformConversion(payload: Payload) {
  trackEvent("platform_conversion", payload);
}
