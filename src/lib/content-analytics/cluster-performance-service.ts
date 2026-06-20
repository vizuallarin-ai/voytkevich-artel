import type { ContentAnalyticsPeriod, ContentPerformanceSnapshot } from "@/types/content-analytics";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { buildContentPerformanceSnapshots } from "@/lib/content-analytics/content-performance-snapshot-service";

export type ClusterPerformance = {
  clusterId: string;
  pageCount: number;
  totalPageViews: number | null;
  totalLeads: number | null;
  totalQualifiedLeads: number | null;
  totalImpressions: number | null;
  totalClicks: number | null;
  avgConversionRate: number | null;
};

async function snapshotsByCluster(
  period: ContentAnalyticsPeriod,
): Promise<Map<string, ContentPerformanceSnapshot[]>> {
  const items = await contentRepository.listContent();
  const snapshots = await buildContentPerformanceSnapshots(period);
  const snapshotMap = new Map(snapshots.map((s) => [s.contentItemId, s]));
  const grouped = new Map<string, ContentPerformanceSnapshot[]>();

  for (const item of items) {
    const clusterId = item.clusterId ?? "unclustered";
    const snapshot = snapshotMap.get(item.id);
    if (!snapshot) continue;
    if (!grouped.has(clusterId)) grouped.set(clusterId, []);
    grouped.get(clusterId)!.push(snapshot);
  }

  return grouped;
}

function aggregateCluster(snapshots: ContentPerformanceSnapshot[]): Omit<ClusterPerformance, "clusterId"> {
  const sum = (pick: (s: ContentPerformanceSnapshot) => number | null | undefined) => {
    const values = snapshots.map(pick).filter((v): v is number => v != null);
    return values.length ? values.reduce((a, b) => a + b, 0) : null;
  };

  const pageViews = sum((s) => s.traffic.pageViews);
  const leads = sum((s) => s.conversions.leads);

  return {
    pageCount: snapshots.length,
    totalPageViews: pageViews,
    totalLeads: leads,
    totalQualifiedLeads: sum((s) => s.conversions.qualifiedLeads),
    totalImpressions: sum((s) => s.search.impressions),
    totalClicks: sum((s) => s.search.clicks),
    avgConversionRate:
      pageViews != null && pageViews > 0 && leads != null ? leads / pageViews : null,
  };
}

export async function calculateClusterPerformance(
  clusterId: string,
  period: ContentAnalyticsPeriod,
): Promise<ClusterPerformance | null> {
  const grouped = await snapshotsByCluster(period);
  const snapshots = grouped.get(clusterId);
  if (!snapshots?.length) return null;
  return { clusterId, ...aggregateCluster(snapshots) };
}

export async function compareClusters(period: ContentAnalyticsPeriod): Promise<ClusterPerformance[]> {
  const grouped = await snapshotsByCluster(period);
  return [...grouped.entries()]
    .map(([clusterId, snapshots]) => ({ clusterId, ...aggregateCluster(snapshots) }))
    .sort((a, b) => (b.totalLeads ?? 0) - (a.totalLeads ?? 0));
}

export async function getClusterSearchCoverage(clusterId: string): Promise<number | null> {
  const items = await contentRepository.listContent({ clusterId });
  if (items.length === 0) return null;
  const indexed = items.filter((i) => i.indexing.indexable && i.status === "published").length;
  return indexed / items.length;
}

export async function getClusterConversions(
  clusterId: string,
  period: ContentAnalyticsPeriod,
): Promise<number | null> {
  const perf = await calculateClusterPerformance(clusterId, period);
  return perf?.totalLeads ?? null;
}

export async function getClusterQualifiedLeads(
  clusterId: string,
  period: ContentAnalyticsPeriod,
): Promise<number | null> {
  const perf = await calculateClusterPerformance(clusterId, period);
  return perf?.totalQualifiedLeads ?? null;
}

export function findWinningClusters(items: ClusterPerformance[]): ClusterPerformance[] {
  return items.filter(
    (c) => (c.totalQualifiedLeads ?? 0) >= 2 || ((c.totalLeads ?? 0) >= 5 && (c.avgConversionRate ?? 0) > 0.02),
  );
}

export function findWeakClusters(items: ClusterPerformance[]): ClusterPerformance[] {
  return items.filter(
    (c) => c.pageCount >= 3 && (c.totalLeads ?? 0) === 0 && (c.totalPageViews ?? 0) >= 20,
  );
}

export async function findClusterContentGaps(clusterId: string): Promise<string[]> {
  const items = await contentRepository.listContent({ clusterId });
  const gaps: string[] = [];
  const hasPublished = items.some((i) => i.status === "published");
  if (!hasPublished) gaps.push("no-published-pages");
  if (items.length < 3) gaps.push("thin-cluster-coverage");
  return gaps;
}

export async function recommendClusterExpansion(clusterId: string): Promise<string[]> {
  const gaps = await findClusterContentGaps(clusterId);
  if (gaps.includes("thin-cluster-coverage")) {
    return ["Добавить supporting pages для расширения семантического покрытия"];
  }
  return [];
}

export async function recommendClusterConsolidation(clusterId: string): Promise<string[]> {
  const items = await contentRepository.listContent({ clusterId });
  const published = items.filter((i) => i.status === "published");
  if (published.length > 5 && items.some((i) => i.seo.cannibalizationRisk === "high")) {
    return ["Рассмотреть объединение страниц с high cannibalization risk"];
  }
  return [];
}

export const clusterPerformanceService = {
  calculateClusterPerformance,
  compareClusters,
  getClusterSearchCoverage,
  getClusterConversions,
  getClusterQualifiedLeads,
  findWinningClusters,
  findWeakClusters,
  findClusterContentGaps,
  recommendClusterExpansion,
  recommendClusterConsolidation,
};
