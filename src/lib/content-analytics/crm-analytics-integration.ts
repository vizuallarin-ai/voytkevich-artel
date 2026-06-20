import type { ContentAnalyticsPeriod } from "@/types/content-analytics";
import type { StoredLead } from "@/types/lead";
import { getAllLeads } from "@/lib/leads/lead-repository";
import { isInDateRange } from "@/lib/analytics/date-range";
import {
  buildContentPerformanceSnapshots,
  isDealLead,
  isQualifiedLead,
} from "@/lib/content-analytics/content-performance-snapshot-service";
import { leadAttributionService } from "@/lib/content-analytics/lead-attribution-service";

function periodToRange(period: ContentAnalyticsPeriod) {
  return {
    key: "30d" as const,
    from: new Date(period.from),
    to: new Date(period.to),
    label: "custom",
  };
}

function filterLeadsInPeriod(leads: StoredLead[], period: ContentAnalyticsPeriod): StoredLead[] {
  return leads.filter((l) => !l.isDemo && isInDateRange(l.meta.createdAt, periodToRange(period)));
}

export async function mapLeadToContentJourney(leadId: string) {
  const leads = await getAllLeads(true);
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;
  return leadAttributionService.attributeLeadToContent(lead, [], "assisted");
}

export async function getQualifiedLeadsByContent(
  period: ContentAnalyticsPeriod,
): Promise<Record<string, number>> {
  const snapshots = await buildContentPerformanceSnapshots(period);
  const result: Record<string, number> = {};
  for (const snapshot of snapshots) {
    if (snapshot.conversions.qualifiedLeads != null) {
      result[snapshot.contentItemId] = snapshot.conversions.qualifiedLeads;
    }
  }
  return result;
}

export async function getDealsByContent(period: ContentAnalyticsPeriod): Promise<Record<string, number>> {
  const snapshots = await buildContentPerformanceSnapshots(period);
  const result: Record<string, number> = {};
  for (const snapshot of snapshots) {
    if (snapshot.conversions.deals != null) {
      result[snapshot.contentItemId] = snapshot.conversions.deals;
    }
  }
  return result;
}

export async function getWonDealsByContent(period: ContentAnalyticsPeriod): Promise<Record<string, number>> {
  return getDealsByContent(period);
}

export async function getRevenueByContent(
  _period: ContentAnalyticsPeriod,
): Promise<Record<string, number | null>> {
  return {};
}

export async function getLeadStatusesByContent(
  period: ContentAnalyticsPeriod,
): Promise<Record<string, Record<string, number>>> {
  const leads = filterLeadsInPeriod(await getAllLeads(true), period);
  const snapshots = await buildContentPerformanceSnapshots(period);
  const result: Record<string, Record<string, number>> = {};

  for (const snapshot of snapshots) {
    result[snapshot.contentItemId] = {};
  }

  for (const lead of leads) {
    const attribution = await leadAttributionService.getConvertingContent(lead);
    if (!attribution) continue;
    const statusMap = result[attribution.contentItemId] ?? {};
    statusMap[lead.status] = (statusMap[lead.status] ?? 0) + 1;
    result[attribution.contentItemId] = statusMap;
  }

  return result;
}

export async function calculateLeadQualityScore(
  contentItemId: string,
  period: ContentAnalyticsPeriod,
): Promise<number | null> {
  const snapshots = await buildContentPerformanceSnapshots(period, { contentItemIds: [contentItemId] });
  const snapshot = snapshots[0];
  if (!snapshot) return null;

  const leads = snapshot.conversions.leads;
  const qualified = snapshot.conversions.qualifiedLeads;
  if (leads == null || qualified == null || leads === 0) return null;

  return Math.round((qualified / leads) * 100);
}

export async function syncCRMOutcomeToContentAnalytics(lead: StoredLead): Promise<void> {
  await leadAttributionService.attributeLeadToContent(lead, [], "last-touch");
}

export function countQualifiedLeads(leads: StoredLead[]): number {
  return leads.filter((l) => isQualifiedLead(l.status)).length;
}

export function countDeals(leads: StoredLead[]): number {
  return leads.filter((l) => isDealLead(l.status)).length;
}

export const crmAnalyticsIntegration = {
  mapLeadToContentJourney,
  getQualifiedLeadsByContent,
  getDealsByContent,
  getWonDealsByContent,
  getRevenueByContent,
  getLeadStatusesByContent,
  calculateLeadQualityScore,
  syncCRMOutcomeToContentAnalytics,
  countQualifiedLeads,
  countDeals,
};
