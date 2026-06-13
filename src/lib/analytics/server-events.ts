import type { AnalyticsEvent } from "@/types/analytics";
import { buildAnalyticsEvent } from "./analytics-event";
import { saveAnalyticsEvent } from "./analytics-storage";
import type { StoredLead } from "@/types/lead";

export async function recordServerAnalyticsEvent(
  event: Omit<AnalyticsEvent, "timestamp"> & { timestamp?: string },
): Promise<void> {
  try {
    await saveAnalyticsEvent(buildAnalyticsEvent(event));
  } catch {
    /* silent */
  }
}

export async function recordLeadCreatedEvent(lead: StoredLead): Promise<void> {
  await recordServerAnalyticsEvent({
    name: "lead_created",
    category: "lead",
    leadId: lead.id,
    page: {
      pageType: lead.source.sourceType,
      pageSlug: lead.source.pageSlug,
      path: lead.meta.currentUrl,
    },
    source: {
      utmSource: lead.analytics.utm?.source,
      utmMedium: lead.analytics.utm?.medium,
      utmCampaign: lead.analytics.utm?.campaign,
    },
    context: {
      projectSlug: lead.context.project?.slug,
      leadMagnetId: lead.context.leadMagnet?.id,
      blogPostSlug: lead.context.blog?.slug,
      serviceSlug: lead.context.service?.slug,
      clusterId: lead.context.blog?.clusterId,
    },
    action: {
      ctaLabel: lead.request.selectedCTA,
      formName: lead.source.formName,
    },
    metrics: {
      leadScore: lead.qualification.leadScore,
      readiness: lead.qualification.readiness,
    },
  });
}

export async function recordCrmStatusChanged(lead: StoredLead, newStatus: string): Promise<void> {
  await recordServerAnalyticsEvent({
    name: "crm_status_changed",
    category: "crm",
    leadId: lead.id,
    action: { value: newStatus },
  });
}
