import type { AnalyticsEventName } from "@/types/analytics";
import type { ContentAnalyticsSource, ContentType } from "@/types/content-analytics";

export type ContentAnalyticsEventName =
  | "content_planned"
  | "content_created"
  | "content_sent_to_review"
  | "content_approved"
  | "content_scheduled"
  | "content_published"
  | "content_updated"
  | "content_archived"
  | "content_added_to_sitemap"
  | "content_discovered"
  | "content_crawled"
  | "content_indexed"
  | "content_excluded_from_index"
  | "content_indexation_error"
  | "content_viewed"
  | "content_engaged"
  | "content_scroll_depth_reached"
  | "content_internal_link_clicked"
  | "content_related_content_clicked"
  | "content_project_clicked"
  | "content_service_clicked"
  | "content_cta_viewed"
  | "content_cta_clicked"
  | "content_form_started"
  | "content_form_submitted"
  | "content_chat_started"
  | "content_phone_clicked"
  | "content_messenger_clicked"
  | "content_lead_created"
  | "content_lead_qualified"
  | "content_deal_created"
  | "content_deal_won"
  | "teaser_published"
  | "teaser_clicked"
  | "teaser_landing_viewed"
  | "distribution_conversion_created"
  | "content_performance_recalculated"
  | "content_decay_detected"
  | "content_underperformance_detected"
  | "content_winner_detected"
  | "content_update_recommended"
  | "priority_feedback_generated"
  | "calendar_feedback_generated";

export type ContentAnalyticsEventPayload = {
  eventId: string;
  eventName: string;
  occurredAt: string;

  contentItemId?: string;
  url?: string;
  contentType?: ContentType;
  clusterId?: string;

  priorityLevel?: "P1" | "P2" | "P3" | "P4" | "P5";
  priorityScore?: number;
  priorityConfidence?: "low" | "medium" | "high";

  publicationMode?: string;
  publicationSlot?: string;

  source?: string;
  medium?: string;
  campaign?: string;
  teaserId?: string;
  distributionChannel?: string;

  ctaId?: string;
  ctaType?: string;
  formId?: string;

  sessionId?: string;
  anonymousVisitorId?: string;

  metadata?: Record<string, string | number | boolean | null>;
};

export type ContentEventGroup =
  | "lifecycle"
  | "search"
  | "engagement"
  | "conversion"
  | "distribution"
  | "intelligence";

const EXISTING_TO_CONTENT: Partial<Record<AnalyticsEventName, ContentAnalyticsEventName>> = {
  page_viewed: "content_viewed",
  page_scrolled: "content_scroll_depth_reached",
  page_section_viewed: "content_engaged",
  cta_clicked: "content_cta_clicked",
  form_viewed: "content_cta_viewed",
  form_started: "content_form_started",
  form_submitted: "content_form_submitted",
  form_success: "content_form_submitted",
  lead_created: "content_lead_created",
  lead_qualified: "content_lead_qualified",
  blog_post_viewed: "content_viewed",
  blog_cta_clicked: "content_cta_clicked",
  blog_lead_submitted: "content_lead_created",
  service_page_viewed: "content_viewed",
  service_page_cta_clicked: "content_cta_clicked",
  service_page_lead_submitted: "content_lead_created",
  project_viewed: "content_viewed",
  project_cta_clicked: "content_cta_clicked",
  project_lead_submitted: "content_lead_created",
  related_project_clicked: "content_project_clicked",
  related_article_clicked: "content_related_content_clicked",
};

export const contentAnalyticsEventGroups: Record<ContentAnalyticsEventName, ContentEventGroup> = {
  content_planned: "lifecycle",
  content_created: "lifecycle",
  content_sent_to_review: "lifecycle",
  content_approved: "lifecycle",
  content_scheduled: "lifecycle",
  content_published: "lifecycle",
  content_updated: "lifecycle",
  content_archived: "lifecycle",
  content_added_to_sitemap: "search",
  content_discovered: "search",
  content_crawled: "search",
  content_indexed: "search",
  content_excluded_from_index: "search",
  content_indexation_error: "search",
  content_viewed: "engagement",
  content_engaged: "engagement",
  content_scroll_depth_reached: "engagement",
  content_internal_link_clicked: "engagement",
  content_related_content_clicked: "engagement",
  content_project_clicked: "engagement",
  content_service_clicked: "engagement",
  content_cta_viewed: "conversion",
  content_cta_clicked: "conversion",
  content_form_started: "conversion",
  content_form_submitted: "conversion",
  content_chat_started: "conversion",
  content_phone_clicked: "conversion",
  content_messenger_clicked: "conversion",
  content_lead_created: "conversion",
  content_lead_qualified: "conversion",
  content_deal_created: "conversion",
  content_deal_won: "conversion",
  teaser_published: "distribution",
  teaser_clicked: "distribution",
  teaser_landing_viewed: "distribution",
  distribution_conversion_created: "distribution",
  content_performance_recalculated: "intelligence",
  content_decay_detected: "intelligence",
  content_underperformance_detected: "intelligence",
  content_winner_detected: "intelligence",
  content_update_recommended: "intelligence",
  priority_feedback_generated: "intelligence",
  calendar_feedback_generated: "intelligence",
};

export function mapExistingEventToContentEvent(
  name: AnalyticsEventName | string,
): ContentAnalyticsEventName | null {
  if (name in contentAnalyticsEventGroups) {
    return name as ContentAnalyticsEventName;
  }
  return EXISTING_TO_CONTENT[name as AnalyticsEventName] ?? null;
}

export function isContentAnalyticsEvent(name: string): name is ContentAnalyticsEventName {
  return name in contentAnalyticsEventGroups;
}

export function getContentEventGroup(name: ContentAnalyticsEventName): ContentEventGroup {
  return contentAnalyticsEventGroups[name];
}

export type ContentEventSourceMapping = {
  source: ContentAnalyticsSource;
  events: ContentAnalyticsEventName[];
};

export const intelligenceContentEvents: ContentAnalyticsEventName[] = (
  Object.entries(contentAnalyticsEventGroups) as [ContentAnalyticsEventName, ContentEventGroup][]
)
  .filter(([, group]) => group === "intelligence")
  .map(([name]) => name);

export const PII_BLOCKED_PAYLOAD_KEYS = new Set([
  "name",
  "phone",
  "email",
  "comment",
  "message",
  "address",
  "contactName",
  "contactPhone",
  "contactEmail",
  "crmNotes",
]);

export function sanitizeContentAnalyticsPayload(
  payload: ContentAnalyticsEventPayload,
): ContentAnalyticsEventPayload {
  if (!payload.metadata) return payload;
  const metadata: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(payload.metadata)) {
    if (!PII_BLOCKED_PAYLOAD_KEYS.has(key)) {
      metadata[key] = value;
    }
  }
  return { ...payload, metadata };
}
