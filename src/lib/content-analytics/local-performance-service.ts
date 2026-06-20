import type { ContentAnalyticsPeriod } from "@/types/content-analytics";
import { localDemandRules } from "@/data/local-demand-rules";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { buildContentPerformanceSnapshots } from "@/lib/content-analytics/content-performance-snapshot-service";
import { getAllLeads } from "@/lib/leads/lead-repository";
import { isInDateRange } from "@/lib/analytics/date-range";

export type LocalPerformance = {
  location: string;
  pageCount: number;
  pageViews: number | null;
  impressions: number | null;
  leads: number | null;
  qualifiedLeads: number | null;
};

function periodRange(period: ContentAnalyticsPeriod) {
  return {
    key: "30d" as const,
    from: new Date(period.from),
    to: new Date(period.to),
    label: "custom",
  };
}

function detectLocation(text: string): string | null {
  for (const rule of localDemandRules) {
    if (rule.pattern.test(text)) return rule.label;
  }
  return null;
}

export async function getPerformanceByLocation(
  period: ContentAnalyticsPeriod,
): Promise<LocalPerformance[]> {
  const items = await contentRepository.listContent();
  const snapshots = await buildContentPerformanceSnapshots(period);
  const snapshotMap = new Map(snapshots.map((s) => [s.contentItemId, s]));
  const grouped = new Map<string, LocalPerformance>();

  for (const item of items) {
    const location = detectLocation(`${item.title} ${item.url} ${item.seo.targetKeyword ?? ""}`);
    if (!location) continue;

    if (!grouped.has(location)) {
      grouped.set(location, {
        location,
        pageCount: 0,
        pageViews: null,
        impressions: null,
        leads: null,
        qualifiedLeads: null,
      });
    }

    const row = grouped.get(location)!;
    row.pageCount += 1;
    const snapshot = snapshotMap.get(item.id);
    if (!snapshot) continue;

    if (snapshot.traffic.pageViews != null) {
      row.pageViews = (row.pageViews ?? 0) + snapshot.traffic.pageViews;
    }
    if (snapshot.search.impressions != null) {
      row.impressions = (row.impressions ?? 0) + snapshot.search.impressions;
    }
    if (snapshot.conversions.leads != null) {
      row.leads = (row.leads ?? 0) + snapshot.conversions.leads;
    }
    if (snapshot.conversions.qualifiedLeads != null) {
      row.qualifiedLeads = (row.qualifiedLeads ?? 0) + snapshot.conversions.qualifiedLeads;
    }
  }

  return [...grouped.values()].sort((a, b) => (b.leads ?? 0) - (a.leads ?? 0));
}

export async function getLocalSearchPerformance(
  location: string,
  period: ContentAnalyticsPeriod,
): Promise<{ impressions: number | null; clicks: number | null }> {
  const all = await getPerformanceByLocation(period);
  const match = all.find((l) => l.location === location);
  return { impressions: match?.impressions ?? null, clicks: null };
}

export async function getLocalLeads(location: string, period: ContentAnalyticsPeriod): Promise<number | null> {
  const all = await getPerformanceByLocation(period);
  return all.find((l) => l.location === location)?.leads ?? null;
}

export async function getQualifiedLocalLeads(
  location: string,
  period: ContentAnalyticsPeriod,
): Promise<number | null> {
  const all = await getPerformanceByLocation(period);
  return all.find((l) => l.location === location)?.qualifiedLeads ?? null;
}

export function findLocalDemandGaps(locations: LocalPerformance[]): string[] {
  return locations
    .filter((l) => l.pageCount >= 2 && (l.leads ?? 0) === 0)
    .map((l) => l.location);
}

export function findHighDemandLowCoverageLocations(locations: LocalPerformance[]): string[] {
  return locations
    .filter((l) => (l.leads ?? 0) >= 3 && l.pageCount <= 1)
    .map((l) => l.location);
}

export function recommendLocalContentActions(locations: LocalPerformance[]): string[] {
  const actions: string[] = [];
  for (const loc of findHighDemandLowCoverageLocations(locations)) {
    actions.push(`Расширить локальное покрытие: ${loc}`);
  }
  for (const loc of findLocalDemandGaps(locations)) {
    actions.push(`Проверить качество локальных страниц: ${loc}`);
  }
  return actions;
}

export async function getLocalLeadsFromCrm(
  location: string,
  period: ContentAnalyticsPeriod,
): Promise<number | null> {
  const leads = await getAllLeads(true);
  const matched = leads.filter((l) => {
    if (l.isDemo || !isInDateRange(l.meta.createdAt, periodRange(period))) return false;
    const text = `${l.qualification.landLocation ?? ""} ${l.meta.currentUrl ?? ""}`;
    return detectLocation(text) === location;
  });
  return matched.length > 0 ? matched.length : null;
}

export const localPerformanceService = {
  getPerformanceByLocation,
  getLocalSearchPerformance,
  getLocalLeads,
  getQualifiedLocalLeads,
  findLocalDemandGaps,
  findHighDemandLowCoverageLocations,
  recommendLocalContentActions,
  detectLocation,
};
