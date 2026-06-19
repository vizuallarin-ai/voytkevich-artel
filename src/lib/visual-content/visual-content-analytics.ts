import { trackEvent } from "@/lib/analytics/events";

export function trackVisualDashboardViewed(payload?: Record<string, unknown>) {
  trackEvent("visual_dashboard_viewed", payload);
}

export function trackVisualAssetCreated(payload?: Record<string, unknown>) {
  trackEvent("visual_asset_created", payload);
}

export function trackVisualAssetUploaded(payload?: Record<string, unknown>) {
  trackEvent("visual_asset_uploaded", payload);
}

export function trackVisualPromptGenerated(payload?: Record<string, unknown>) {
  trackEvent("visual_prompt_generated", payload);
}

export function trackVisualGenerationStarted(payload?: Record<string, unknown>) {
  trackEvent("visual_generation_started", payload);
}

export function trackVisualGenerationCompleted(payload?: Record<string, unknown>) {
  trackEvent("visual_generation_completed", payload);
}

export function trackVisualGenerationFailed(payload?: Record<string, unknown>) {
  trackEvent("visual_generation_failed", payload);
}

export function trackVisualAssetApproved(payload?: Record<string, unknown>) {
  trackEvent("visual_asset_approved", payload);
}

export function trackVisualAssetRejected(payload?: Record<string, unknown>) {
  trackEvent("visual_asset_rejected", payload);
}

export function trackVisualAssetAttachedToContent(payload?: Record<string, unknown>) {
  trackEvent("visual_asset_attached_to_content", payload);
}

export function trackVisualAssetAttachedToPublication(payload?: Record<string, unknown>) {
  trackEvent("visual_asset_attached_to_publication", payload);
}

export function trackVisualAltUpdated(payload?: Record<string, unknown>) {
  trackEvent("visual_alt_updated", payload);
}

export function trackVisualTemplatePreviewed(payload?: Record<string, unknown>) {
  trackEvent("visual_template_previewed", payload);
}

export function trackVisualFormatVariantCreated(payload?: Record<string, unknown>) {
  trackEvent("visual_format_variant_created", payload);
}
