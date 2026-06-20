import type { ContentAnalyticsPeriod, ContentPerformanceSnapshot } from "@/types/content-analytics";
import { safeRate } from "@/lib/content-analytics/analytics-normalizer";
import { evaluateConfidenceSignal } from "@/data/content-analytics-confidence-rules";
import {
  buildContentPerformanceSnapshots,
  getSnapshotConfidence,
} from "@/lib/content-analytics/content-performance-snapshot-service";

/** conversionRate = leads / pageViews (null if pageViews is 0 or missing) */
export function calculateContentConversionRate(item: ContentPerformanceSnapshot): number | null {
  return safeRate(item.conversions.leads, item.traffic.pageViews);
}

/** leadRate = leads / sessions (null if sessions is 0 or missing) */
export function calculateLeadRate(item: ContentPerformanceSnapshot): number | null {
  return safeRate(item.conversions.leads, item.traffic.sessions);
}

/** qualifiedLeadRate = qualifiedLeads / leads */
export function calculateQualifiedLeadRate(item: ContentPerformanceSnapshot): number | null {
  return safeRate(item.conversions.qualifiedLeads, item.conversions.leads);
}

/** leadToDealRate = deals / leads */
export function calculateLeadToDealRate(item: ContentPerformanceSnapshot): number | null {
  return safeRate(item.conversions.deals, item.conversions.leads);
}

export function calculateCTAConversionRate(item: ContentPerformanceSnapshot): number | null {
  return safeRate(item.conversions.leads, item.conversions.ctaClicks);
}

export async function getConversionsByContentType(
  period: ContentAnalyticsPeriod,
): Promise<Record<string, ContentPerformanceSnapshot[]>> {
  const snapshots = await buildContentPerformanceSnapshots(period);
  const grouped: Record<string, ContentPerformanceSnapshot[]> = {};
  for (const snapshot of snapshots) {
    if (!grouped[snapshot.contentType]) grouped[snapshot.contentType] = [];
    grouped[snapshot.contentType].push(snapshot);
  }
  return grouped;
}

export async function getConversionsByCluster(
  period: ContentAnalyticsPeriod,
): Promise<Record<string, ContentPerformanceSnapshot[]>> {
  const snapshots = await buildContentPerformanceSnapshots(period);
  const grouped: Record<string, ContentPerformanceSnapshot[]> = {};
  for (const snapshot of snapshots) {
    const key = snapshot.contentItemId;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(snapshot);
  }
  return grouped;
}

export async function getConversionsByLandingPage(
  period: ContentAnalyticsPeriod,
): Promise<ContentPerformanceSnapshot[]> {
  const snapshots = await buildContentPerformanceSnapshots(period);
  return snapshots
    .filter((s) => (s.conversions.leads ?? 0) > 0)
    .sort((a, b) => (b.conversions.leads ?? 0) - (a.conversions.leads ?? 0));
}

export async function getConversionsByTrafficSource(
  _period: ContentAnalyticsPeriod,
): Promise<Record<string, number | null>> {
  return {};
}

export async function getConversionsByRegion(
  _period: ContentAnalyticsPeriod,
): Promise<Record<string, number | null>> {
  return {};
}

export function findHighTrafficLowConversionPages(
  items: ContentPerformanceSnapshot[],
  minViews = 10,
): ContentPerformanceSnapshot[] {
  return items.filter((item) => {
    const views = item.traffic.pageViews ?? 0;
    const rate = calculateContentConversionRate(item);
    return views >= minViews && (rate == null || rate < 0.01);
  });
}

export function findLowTrafficHighConversionPages(
  items: ContentPerformanceSnapshot[],
): ContentPerformanceSnapshot[] {
  return items.filter((item) => {
    const views = item.traffic.pageViews ?? 0;
    const rate = calculateContentConversionRate(item);
    return views < 20 && views > 0 && rate != null && rate >= 0.05;
  });
}

export function findHighValueLandingPages(
  items: ContentPerformanceSnapshot[],
): ContentPerformanceSnapshot[] {
  return items
    .filter((item) => (item.conversions.qualifiedLeads ?? 0) > 0)
    .sort((a, b) => (b.conversions.qualifiedLeads ?? 0) - (a.conversions.qualifiedLeads ?? 0));
}

export function getConversionConfidence(item: ContentPerformanceSnapshot): ReturnType<
  typeof evaluateConfidenceSignal
> {
  return getSnapshotConfidence(item);
}

export const conversionPerformanceService = {
  calculateContentConversionRate,
  calculateCTAConversionRate,
  calculateLeadRate,
  calculateQualifiedLeadRate,
  calculateLeadToDealRate,
  getConversionsByContentType,
  getConversionsByCluster,
  getConversionsByLandingPage,
  getConversionsByTrafficSource,
  getConversionsByRegion,
  findHighTrafficLowConversionPages,
  findLowTrafficHighConversionPages,
  findHighValueLandingPages,
  getConversionConfidence,
};
