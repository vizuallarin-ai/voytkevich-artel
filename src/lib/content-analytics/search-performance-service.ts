import type { ContentAnalyticsPeriod } from "@/types/content-analytics";
import type { ContentPerformanceSnapshot } from "@/types/content-analytics";
import { analyticsSourceRegistry } from "@/lib/content-analytics/analytics-source-registry";
import { getIngestedRecords } from "@/lib/content-analytics/analytics-ingestion-service";
import { safeRate } from "@/lib/content-analytics/analytics-normalizer";
import {
  buildContentPerformanceSnapshots,
  contentPerformanceSnapshotService,
} from "@/lib/content-analytics/content-performance-snapshot-service";

export type SearchPerformanceMetrics = {
  contentItemId: string;
  url: string;
  clusterId?: string;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  averagePosition: number | null;
  indexed: boolean | null;
  dataAvailable: boolean;
};

function gscAvailable(): boolean {
  const def = analyticsSourceRegistry.get("google-search-console");
  return def?.status === "configured";
}

function yandexAvailable(): boolean {
  const def = analyticsSourceRegistry.get("yandex-webmaster");
  return def?.status === "configured";
}

function searchDataAvailable(): boolean {
  return gscAvailable() || yandexAvailable() || getIngestedRecords().some((r) => r.metrics.impressions != null);
}

function snapshotToSearchMetrics(snapshot: ContentPerformanceSnapshot): SearchPerformanceMetrics {
  const hasExternal = searchDataAvailable();
  return {
    contentItemId: snapshot.contentItemId,
    url: snapshot.url,
    impressions: hasExternal ? (snapshot.search.impressions ?? null) : null,
    clicks: hasExternal ? (snapshot.search.clicks ?? null) : null,
    ctr: hasExternal ? (snapshot.search.ctr ?? null) : null,
    averagePosition: hasExternal ? (snapshot.search.averagePosition ?? null) : null,
    indexed: hasExternal ? (snapshot.search.indexed ?? null) : null,
    dataAvailable: hasExternal,
  };
}

export async function getSearchPerformance(
  contentItemId: string,
  period: ContentAnalyticsPeriod,
): Promise<SearchPerformanceMetrics | null> {
  const snapshots = await buildContentPerformanceSnapshots(period, { contentItemIds: [contentItemId] });
  const snapshot = snapshots[0];
  if (!snapshot) return null;
  return snapshotToSearchMetrics(snapshot);
}

export async function getSearchPerformanceByPage(
  period: ContentAnalyticsPeriod,
): Promise<SearchPerformanceMetrics[]> {
  const snapshots = await contentPerformanceSnapshotService.buildSnapshots(period);
  return snapshots.map(snapshotToSearchMetrics);
}

export async function getSearchPerformanceByCluster(
  period: ContentAnalyticsPeriod,
): Promise<Record<string, SearchPerformanceMetrics[]>> {
  const snapshots = await contentPerformanceSnapshotService.buildSnapshots(period);
  const grouped: Record<string, SearchPerformanceMetrics[]> = {};

  for (const snapshot of snapshots) {
    const clusterId = snapshot.contentType === "programmatic" ? "programmatic" : snapshot.contentItemId;
    if (!grouped[clusterId]) grouped[clusterId] = [];
    grouped[clusterId].push(snapshotToSearchMetrics(snapshot));
  }

  return grouped;
}

export async function getSearchPerformanceByContentType(
  period: ContentAnalyticsPeriod,
): Promise<Record<string, SearchPerformanceMetrics[]>> {
  const snapshots = await contentPerformanceSnapshotService.buildSnapshots(period);
  const grouped: Record<string, SearchPerformanceMetrics[]> = {};

  for (const snapshot of snapshots) {
    const type = snapshot.contentType;
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(snapshotToSearchMetrics(snapshot));
  }

  return grouped;
}

export function compareSearchPeriods(
  current: SearchPerformanceMetrics[],
  previous: SearchPerformanceMetrics[],
): {
  impressionsChange: number | null;
  clicksChange: number | null;
  ctrChange: number | null;
} {
  const sum = (items: SearchPerformanceMetrics[], key: "impressions" | "clicks") =>
    items.reduce((acc, i) => acc + (i[key] ?? 0), 0);

  const currImp = sum(current, "impressions");
  const prevImp = sum(previous, "impressions");
  const currClicks = sum(current, "clicks");
  const prevClicks = sum(previous, "clicks");

  return {
    impressionsChange: prevImp > 0 ? (currImp - prevImp) / prevImp : null,
    clicksChange: prevClicks > 0 ? (currClicks - prevClicks) / prevClicks : null,
    ctrChange:
      safeRate(currClicks, currImp) != null && safeRate(prevClicks, prevImp) != null
        ? (safeRate(currClicks, currImp)! - safeRate(prevClicks, prevImp)!)
        : null,
  };
}

export function detectSearchGrowth(items: SearchPerformanceMetrics[]): SearchPerformanceMetrics[] {
  return items.filter((i) => i.clicks != null && i.clicks > 0 && i.dataAvailable);
}

export function detectSearchDecline(
  current: SearchPerformanceMetrics[],
  previous: SearchPerformanceMetrics[],
): SearchPerformanceMetrics[] {
  const prevMap = new Map(previous.map((p) => [p.contentItemId, p.clicks ?? 0]));
  return current.filter((c) => {
    const prev = prevMap.get(c.contentItemId);
    return prev != null && c.clicks != null && c.clicks < prev;
  });
}

export function detectHighImpressionLowCTR(items: SearchPerformanceMetrics[]): SearchPerformanceMetrics[] {
  return items.filter(
    (i) =>
      i.dataAvailable &&
      (i.impressions ?? 0) >= 100 &&
      i.ctr != null &&
      i.ctr < 0.02,
  );
}

export function detectGoodPositionLowCTR(items: SearchPerformanceMetrics[]): SearchPerformanceMetrics[] {
  return items.filter(
    (i) =>
      i.dataAvailable &&
      i.averagePosition != null &&
      i.averagePosition <= 10 &&
      i.ctr != null &&
      i.ctr < 0.03,
  );
}

export function detectIndexedWithoutDemand(items: SearchPerformanceMetrics[]): SearchPerformanceMetrics[] {
  return items.filter(
    (i) => i.dataAvailable && i.indexed === true && (i.impressions ?? 0) === 0,
  );
}

export function detectDemandWithoutLandingPage(items: SearchPerformanceMetrics[]): string[] {
  if (!searchDataAvailable()) return [];
  return items
    .filter((i) => (i.impressions ?? 0) > 0 && !i.url)
    .map((i) => i.contentItemId);
}

export const searchPerformanceService = {
  getSearchPerformance,
  getSearchPerformanceByPage,
  getSearchPerformanceByCluster,
  getSearchPerformanceByContentType,
  compareSearchPeriods,
  detectSearchGrowth,
  detectSearchDecline,
  detectHighImpressionLowCTR,
  detectGoodPositionLowCTR,
  detectIndexedWithoutDemand,
  detectDemandWithoutLandingPage,
  isSearchDataAvailable: searchDataAvailable,
};
