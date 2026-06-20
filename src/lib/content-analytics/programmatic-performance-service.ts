import type { ContentAnalyticsPeriod, ContentPerformanceSnapshot } from "@/types/content-analytics";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { buildContentPerformanceSnapshots } from "@/lib/content-analytics/content-performance-snapshot-service";
import { getActiveConfidencePreset } from "@/data/content-analytics-confidence-rules";

export type ProgrammaticPerformanceSummary = {
  totalPages: number;
  publishedPages: number;
  indexedPages: number | null;
  totalPageViews: number | null;
  totalLeads: number | null;
  totalImpressions: number | null;
};

async function getProgrammaticSnapshots(period: ContentAnalyticsPeriod): Promise<ContentPerformanceSnapshot[]> {
  const items = await contentRepository.listContent({ kind: ["programmatic-page"] });
  const ids = items.map((i) => i.id);
  const snapshots = await buildContentPerformanceSnapshots(period, { contentItemIds: ids });
  return snapshots;
}

export async function getProgrammaticCoverage(period: ContentAnalyticsPeriod): Promise<{
  total: number;
  published: number;
  indexable: number;
}> {
  const items = await contentRepository.listContent({ kind: ["programmatic-page"] });
  return {
    total: items.length,
    published: items.filter((i) => i.status === "published").length,
    indexable: items.filter((i) => i.indexing.indexable).length,
  };
}

export async function getIndexedProgrammaticPages(
  _period: ContentAnalyticsPeriod,
): Promise<number | null> {
  return null;
}

export async function getProgrammaticTraffic(period: ContentAnalyticsPeriod): Promise<number | null> {
  const snapshots = await getProgrammaticSnapshots(period);
  const views = snapshots.map((s) => s.traffic.pageViews).filter((v): v is number => v != null);
  return views.length ? views.reduce((a, b) => a + b, 0) : null;
}

export async function getProgrammaticConversions(period: ContentAnalyticsPeriod): Promise<number | null> {
  const snapshots = await getProgrammaticSnapshots(period);
  const leads = snapshots.map((s) => s.conversions.leads).filter((v): v is number => v != null);
  return leads.length ? leads.reduce((a, b) => a + b, 0) : null;
}

export async function compareTaxonomyCombinations(
  period: ContentAnalyticsPeriod,
): Promise<Record<string, ProgrammaticPerformanceSummary>> {
  const items = await contentRepository.listContent({ kind: ["programmatic-page"] });
  const snapshots = await getProgrammaticSnapshots(period);
  const snapshotMap = new Map(snapshots.map((s) => [s.contentItemId, s]));
  const grouped: Record<string, ProgrammaticPerformanceSummary> = {};

  for (const item of items) {
    const key = item.contentType ?? "unknown";
    if (!grouped[key]) {
      grouped[key] = {
        totalPages: 0,
        publishedPages: 0,
        indexedPages: null,
        totalPageViews: null,
        totalLeads: null,
        totalImpressions: null,
      };
    }

    const row = grouped[key];
    row.totalPages += 1;
    if (item.status === "published") row.publishedPages += 1;

    const snapshot = snapshotMap.get(item.id);
    if (snapshot) {
      if (snapshot.traffic.pageViews != null) {
        row.totalPageViews = (row.totalPageViews ?? 0) + snapshot.traffic.pageViews;
      }
      if (snapshot.conversions.leads != null) {
        row.totalLeads = (row.totalLeads ?? 0) + snapshot.conversions.leads;
      }
      if (snapshot.search.impressions != null) {
        row.totalImpressions = (row.totalImpressions ?? 0) + snapshot.search.impressions;
      }
    }
  }

  return grouped;
}

export function findThinUnderperformingCombinations(
  summaries: Record<string, ProgrammaticPerformanceSummary>,
): string[] {
  return Object.entries(summaries)
    .filter(([, s]) => s.totalPages >= 5 && (s.totalLeads ?? 0) === 0 && (s.totalPageViews ?? 0) < 10)
    .map(([key]) => key);
}

export function findPromisingTaxonomyPatterns(
  summaries: Record<string, ProgrammaticPerformanceSummary>,
): string[] {
  const preset = getActiveConfidencePreset();
  return Object.entries(summaries)
    .filter(
      ([, s]) =>
        s.totalPages >= preset.minimumComparableItems &&
        (s.totalLeads ?? 0) >= preset.minimumLeads,
    )
    .map(([key]) => key);
}

export async function findProgrammaticCannibalization(): Promise<string[]> {
  const items = await contentRepository.listContent({ kind: ["programmatic-page"] });
  return items
    .filter((i) => i.seo.cannibalizationRisk === "high")
    .map((i) => i.id);
}

export async function recommendProgrammaticExpansion(
  summaries: Record<string, ProgrammaticPerformanceSummary>,
): Promise<string[]> {
  const promising = findPromisingTaxonomyPatterns(summaries);
  if (promising.length === 0) return [];
  return promising.map((p) => `Рассмотреть расширение шаблона «${p}» при достаточной выборке`);
}

export async function recommendProgrammaticConsolidation(
  summaries: Record<string, ProgrammaticPerformanceSummary>,
): Promise<string[]> {
  const thin = findThinUnderperformingCombinations(summaries);
  if (thin.length === 0) return [];
  return thin.map((t) => `Рассмотреть консолидацию thin-комбинации «${t}»`);
}

export const programmaticPerformanceService = {
  getProgrammaticCoverage,
  getIndexedProgrammaticPages,
  getProgrammaticTraffic,
  getProgrammaticConversions,
  compareTaxonomyCombinations,
  findThinUnderperformingCombinations,
  findPromisingTaxonomyPatterns,
  findProgrammaticCannibalization,
  recommendProgrammaticExpansion,
  recommendProgrammaticConsolidation,
};
