import type { ContentAnalyticsPeriod } from "@/types/content-analytics";
import type { StoredLead } from "@/types/lead";
import { getAllLeads } from "@/lib/leads/lead-repository";
import { isInDateRange } from "@/lib/analytics/date-range";
import { isQualifiedLead } from "@/lib/content-analytics/content-performance-snapshot-service";

export type TeaserPerformance = {
  teaserId: string;
  platformId?: string;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  landingSessions: number | null;
  leads: number | null;
  qualifiedLeads: number | null;
  dataAvailable: boolean;
};

export type ChannelPerformance = {
  channel: string;
  source?: string;
  medium?: string;
  clicks: number | null;
  leads: number | null;
  qualifiedLeads: number | null;
  assistedConversions: number | null;
};

function periodRange(period: ContentAnalyticsPeriod) {
  return {
    key: "30d" as const,
    from: new Date(period.from),
    to: new Date(period.to),
    label: "custom",
  };
}

function normalizeUtm(value?: string): string | undefined {
  if (!value) return undefined;
  return value.trim().toLowerCase();
}

function leadsInPeriod(period: ContentAnalyticsPeriod): Promise<StoredLead[]> {
  return getAllLeads(true).then((leads) =>
    leads.filter((l) => !l.isDemo && isInDateRange(l.meta.createdAt, periodRange(period))),
  );
}

export async function getTeaserPerformance(teaserId: string): Promise<TeaserPerformance> {
  return {
    teaserId,
    impressions: null,
    clicks: null,
    ctr: null,
    landingSessions: null,
    leads: null,
    qualifiedLeads: null,
    dataAvailable: false,
  };
}

export async function getPerformanceByChannel(period: ContentAnalyticsPeriod): Promise<ChannelPerformance[]> {
  const leads = await leadsInPeriod(period);
  const channels = new Map<string, ChannelPerformance>();

  for (const lead of leads) {
    const source = normalizeUtm(lead.analytics.utm?.source) ?? "direct";
    const medium = normalizeUtm(lead.analytics.utm?.medium);
    const key = `${source}:${medium ?? "none"}`;

    if (!channels.has(key)) {
      channels.set(key, {
        channel: key,
        source,
        medium,
        clicks: null,
        leads: 0,
        qualifiedLeads: 0,
        assistedConversions: null,
      });
    }

    const row = channels.get(key)!;
    row.leads = (row.leads ?? 0) + 1;
    if (isQualifiedLead(lead.status)) {
      row.qualifiedLeads = (row.qualifiedLeads ?? 0) + 1;
    }

    if (lead.context.contentDistribution?.sourcePlatform) {
      row.channel = lead.context.contentDistribution.sourcePlatform;
    }
  }

  return [...channels.values()].map((row) => ({
    ...row,
    leads: row.leads && row.leads > 0 ? row.leads : null,
    qualifiedLeads: row.qualifiedLeads && row.qualifiedLeads > 0 ? row.qualifiedLeads : null,
  }));
}

export async function getTeaserCTR(_period: ContentAnalyticsPeriod): Promise<number | null> {
  return null;
}

export async function getLandingConversionsByTeaser(
  _period: ContentAnalyticsPeriod,
): Promise<Record<string, number | null>> {
  return {};
}

export async function getQualifiedLeadsByChannel(
  period: ContentAnalyticsPeriod,
): Promise<Record<string, number>> {
  const channels = await getPerformanceByChannel(period);
  const result: Record<string, number> = {};
  for (const ch of channels) {
    if (ch.qualifiedLeads != null) result[ch.channel] = ch.qualifiedLeads;
  }
  return result;
}

export async function compareDistributionChannels(period: ContentAnalyticsPeriod): Promise<ChannelPerformance[]> {
  return getPerformanceByChannel(period);
}

export function findHighCTRLowConversionTeasers(items: TeaserPerformance[]): TeaserPerformance[] {
  return items.filter(
    (i) => i.dataAvailable && i.ctr != null && i.ctr > 0.05 && (i.leads ?? 0) === 0,
  );
}

export function findLowCTRHighQualityChannels(channels: ChannelPerformance[]): ChannelPerformance[] {
  return channels.filter(
    (c) => (c.clicks ?? 0) < 10 && (c.qualifiedLeads ?? 0) >= 2,
  );
}

export async function calculateDistributionAssistedConversions(
  period: ContentAnalyticsPeriod,
): Promise<number | null> {
  const leads = await leadsInPeriod(period);
  const assisted = leads.filter(
    (l) =>
      l.context.contentDistribution?.sourcePlatform &&
      l.analytics.traffic?.landingPage &&
      l.analytics.traffic.landingPage !== l.meta.currentUrl,
  );
  return assisted.length > 0 ? assisted.length : null;
}

export const distributionPerformanceService = {
  getTeaserPerformance,
  getPerformanceByChannel,
  getTeaserCTR,
  getLandingConversionsByTeaser,
  getQualifiedLeadsByChannel,
  compareDistributionChannels,
  findHighCTRLowConversionTeasers,
  findLowCTRHighQualityChannels,
  calculateDistributionAssistedConversions,
  normalizeUtm,
};
