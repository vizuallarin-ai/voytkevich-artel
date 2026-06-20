import { trackEvent } from "@/lib/analytics/events";

export function trackSeoIndexationDashboardViewed(payload?: Record<string, unknown>) {
  trackEvent("seo_indexation_dashboard_viewed", payload);
}

export function trackIndexabilityEvaluated(payload?: Record<string, unknown>) {
  trackEvent("indexability_evaluated", payload);
}

export function trackIndexabilityRecalculated(payload?: Record<string, unknown>) {
  trackEvent("indexability_recalculated", payload);
}

export function trackSitemapBuilt(payload?: Record<string, unknown>) {
  trackEvent("sitemap_built", payload);
}

export function trackSitemapEntryExcluded(payload?: Record<string, unknown>) {
  trackEvent("sitemap_entry_excluded", payload);
}

export function trackCanonicalConflictDetected(payload?: Record<string, unknown>) {
  trackEvent("canonical_conflict_detected", payload);
}

export function trackCrawlBudgetCalculated(payload?: Record<string, unknown>) {
  trackEvent("crawl_budget_calculated", payload);
}

export function trackCrawlWasteDetected(payload?: Record<string, unknown>) {
  trackEvent("crawl_waste_detected", payload);
}

export function trackIndexationMonitoringChecked(payload?: Record<string, unknown>) {
  trackEvent("indexation_monitoring_checked", payload);
}

export function trackRedirectCreated(payload?: Record<string, unknown>) {
  trackEvent("redirect_created", payload);
}

export function trackUrlLifecycleChanged(payload?: Record<string, unknown>) {
  trackEvent("url_lifecycle_changed", payload);
}

export function trackProgrammaticIndexationBlocked(payload?: Record<string, unknown>) {
  trackEvent("programmatic_indexation_blocked", payload);
}

export function trackCannibalizationIndexationBlocked(payload?: Record<string, unknown>) {
  trackEvent("cannibalization_indexation_blocked", payload);
}

export function trackIndexationMetadataFixed(payload?: Record<string, unknown>) {
  trackEvent("indexation_metadata_fixed", payload);
}

export function trackIndexationAuditLogged(payload?: Record<string, unknown>) {
  trackEvent("indexation_audit_logged", payload);
}

export function trackSitemapValidationFailed(payload?: Record<string, unknown>) {
  trackEvent("sitemap_validation_failed", payload);
}

export function trackInternalLinkAuditRun(payload?: Record<string, unknown>) {
  trackEvent("internal_link_audit_run", payload);
}

export function trackPrioritySitemapDeferred(payload?: Record<string, unknown>) {
  trackEvent("priority_sitemap_deferred", payload);
}

export function trackCalendarIndexationChecked(payload?: Record<string, unknown>) {
  trackEvent("calendar_indexation_checked", payload);
}

export function trackCmsIndexationSynced(payload?: Record<string, unknown>) {
  trackEvent("cms_indexation_synced", payload);
}
