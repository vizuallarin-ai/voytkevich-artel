import type { ContentAnalyticsPeriod } from "@/types/content-analytics";
import type { DateRangeKey } from "@/types/analytics";
import { getDateRange } from "@/lib/analytics/date-range";
import { buildContentPerformanceSnapshots } from "@/lib/content-analytics/content-performance-snapshot-service";
import { publicationPerformanceService } from "@/lib/content-analytics/publication-performance-service";
import { indexationPerformanceService } from "@/lib/content-analytics/indexation-performance-service";
import { searchPerformanceService } from "@/lib/content-analytics/search-performance-service";
import { conversionPerformanceService } from "@/lib/content-analytics/conversion-performance-service";
import { contentDecayService } from "@/lib/content-analytics/content-decay-service";
import { contentUnderperformanceService } from "@/lib/content-analytics/content-underperformance-service";
import { contentWinnerService } from "@/lib/content-analytics/content-winner-service";
import { contentIntelligenceService } from "@/lib/content-analytics/content-intelligence-service";
import { priorityFeedbackService } from "@/lib/content-analytics/priority-feedback-service";
import { dataQualityService } from "@/lib/content-analytics/data-quality-service";
import { getAnalyticsIngestionSummary } from "@/lib/content-analytics/analytics-ingestion-service";
import { analyticsSourceRegistry } from "@/lib/content-analytics/analytics-source-registry";
import { contentRoiService } from "@/lib/content-analytics/content-roi-service";
import { cmsItemToIndexablePage } from "@/lib/seo-indexation/indexable-page-adapters";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";
import { contentRepository } from "@/lib/content-cms/content-repository";

export type ContentAnalyticsDashboardData = {
  period: ContentAnalyticsPeriod;
  kpis: {
    planned: number | null;
    created: number | null;
    approved: number | null;
    published: number | null;
    indexed: number | null;
    sessions: number | null;
    searchImpressions: number | null;
    searchClicks: number | null;
    leads: number | null;
    qualifiedLeads: number | null;
    deals: number | null;
    attributedRevenue: number | null;
    contentCost: number | null;
    roi: number | null;
    dataCompleteness: string;
  };
  funnel: {
    planned: number | null;
    created: number | null;
    approved: number | null;
    published: number | null;
    indexed: number | null;
    traffic: number | null;
    cta: number | null;
    leads: number | null;
    qualifiedLeads: number | null;
    deals: number | null;
  };
  panels: {
    topPerforming: Awaited<ReturnType<typeof buildContentPerformanceSnapshots>>;
    underperforming: ReturnType<typeof contentUnderperformanceService.classifyUnderperformance>[];
    decay: ReturnType<typeof contentDecayService.detectContentDecay>[];
    highPriorityBlocked: Awaited<ReturnType<typeof getHighPriorityBlocked>>;
    publishedNotIndexed: ReturnType<typeof indexationPerformanceService.findPublishedNotIndexed>;
    highImpressionLowCtr: ReturnType<typeof searchPerformanceService.detectHighImpressionLowCTR>;
    highTrafficLowConversion: ReturnType<typeof conversionPerformanceService.findHighTrafficLowConversionPages>;
    lowTrafficHighConversion: ReturnType<typeof conversionPerformanceService.findLowTrafficHighConversionPages>;
    winningClusters: string[];
    recommendedActions: Awaited<ReturnType<typeof contentIntelligenceService.generateContentInsights>>;
    dataQualityWarnings: Awaited<ReturnType<typeof dataQualityService.runDataQualityAudit>>["issues"];
  };
  meta: {
    sources: ReturnType<typeof analyticsSourceRegistry.list>;
    ingestionSummary: ReturnType<typeof getAnalyticsIngestionSummary>;
    searchDataAvailable: boolean;
  };
};

function periodFromRangeKey(rangeKey: DateRangeKey = "30d"): ContentAnalyticsPeriod {
  const range = getDateRange(rangeKey);
  return { from: range.from.toISOString(), to: range.to.toISOString() };
}

async function getHighPriorityBlocked() {
  const items = await contentRepository.listContent();
  return items
    .filter((item) => {
      const page = cmsItemToIndexablePage(item);
      const decision = evaluateIndexability(page, { existingItems: items });
      return (
        !decision.indexable &&
        (item.seo.priority === "P1" || item.seo.priority === "P2")
      );
    })
    .slice(0, 12)
    .map((item) => ({ contentItemId: item.id, title: item.title, url: item.url, priority: item.seo.priority }));
}

function sumNullable(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => v != null);
  return nums.length ? nums.reduce((a, b) => a + b, 0) : null;
}

export async function getMainDashboardData(
  rangeKey: DateRangeKey = "30d",
): Promise<ContentAnalyticsDashboardData> {
  const period = periodFromRangeKey(rangeKey);

  const [
    snapshots,
    publication,
    indexationComparison,
    indexationItems,
    searchByPage,
    dataQuality,
    recommendations,
    priorityComparisons,
  ] = await Promise.all([
    buildContentPerformanceSnapshots(period),
    publicationPerformanceService.comparePlannedVsCreated(period),
    indexationPerformanceService.comparePublishedVsIndexed(period),
    indexationPerformanceService.getIndexationPerformanceItems(),
    searchPerformanceService.getSearchPerformanceByPage(period),
    dataQualityService.runDataQualityAudit(),
    contentIntelligenceService.generateContentInsights(period),
    priorityFeedbackService.comparePriorityWithPerformance(
      await buildContentPerformanceSnapshots(period),
    ),
  ]);

  const underperforming = snapshots
    .map((s) => contentUnderperformanceService.classifyUnderperformance(s))
    .filter((u) => u.category !== "too-early" && u.category !== "unknown")
    .slice(0, 12);

  const decay = snapshots.slice(0, 20).map((s) => contentDecayService.detectContentDecay(s));

  const topPerforming = [...snapshots]
    .sort((a, b) => (b.conversions.leads ?? 0) - (a.conversions.leads ?? 0))
    .slice(0, 12);

  const highImpressionLowCtr = searchPerformanceService.detectHighImpressionLowCTR(searchByPage);
  const highTrafficLowConversion = conversionPerformanceService.findHighTrafficLowConversionPages(snapshots);
  const lowTrafficHighConversion = conversionPerformanceService.findLowTrafficHighConversionPages(snapshots);
  const publishedNotIndexed = indexationPerformanceService.findPublishedNotIndexed(indexationItems);

  const totalSessions = sumNullable(snapshots.map((s) => s.traffic.sessions));
  const totalImpressions = sumNullable(snapshots.map((s) => s.search.impressions));
  const totalClicks = sumNullable(snapshots.map((s) => s.search.clicks));
  const totalLeads = sumNullable(snapshots.map((s) => s.conversions.leads));
  const totalQualified = sumNullable(snapshots.map((s) => s.conversions.qualifiedLeads));
  const totalDeals = sumNullable(snapshots.map((s) => s.conversions.deals));
  const totalCta = sumNullable(snapshots.map((s) => s.conversions.ctaClicks));
  const totalViews = sumNullable(snapshots.map((s) => s.traffic.pageViews));

  const roiValues = snapshots
    .map((s) => contentRoiService.calculateContentROI(s))
    .filter((v): v is number => v != null);
  const avgRoi = roiValues.length ? roiValues.reduce((a, b) => a + b, 0) / roiValues.length : null;

  const completeness = snapshots[0]?.dataCompleteness ?? "none";

  return {
    period,
    kpis: {
      planned: publication.planned || null,
      created: publication.created || null,
      approved: publication.approved || null,
      published: publication.published || null,
      indexed: indexationComparison.externallyIndexed,
      sessions: totalSessions,
      searchImpressions: searchPerformanceService.isSearchDataAvailable() ? totalImpressions : null,
      searchClicks: searchPerformanceService.isSearchDataAvailable() ? totalClicks : null,
      leads: totalLeads,
      qualifiedLeads: totalQualified,
      deals: totalDeals,
      attributedRevenue: null,
      contentCost: null,
      roi: avgRoi,
      dataCompleteness: completeness,
    },
    funnel: {
      planned: publication.planned || null,
      created: publication.created || null,
      approved: publication.approved || null,
      published: publication.published || null,
      indexed: indexationComparison.externallyIndexed,
      traffic: totalViews,
      cta: totalCta,
      leads: totalLeads,
      qualifiedLeads: totalQualified,
      deals: totalDeals,
    },
    panels: {
      topPerforming,
      underperforming,
      decay: decay.filter((d) => d.detected).slice(0, 8),
      highPriorityBlocked: await getHighPriorityBlocked(),
      publishedNotIndexed: publishedNotIndexed.slice(0, 12),
      highImpressionLowCtr: highImpressionLowCtr.slice(0, 12),
      highTrafficLowConversion: highTrafficLowConversion.slice(0, 12),
      lowTrafficHighConversion: lowTrafficHighConversion.slice(0, 12),
      winningClusters: priorityComparisons
        .filter((c) => c.performanceTier === "overperforming")
        .map((c) => c.contentItemId)
        .slice(0, 8),
      recommendedActions: recommendations.slice(0, 12),
      dataQualityWarnings: dataQuality.issues.filter((i) => i.severity !== "low").slice(0, 12),
    },
    meta: {
      sources: analyticsSourceRegistry.list(),
      ingestionSummary: getAnalyticsIngestionSummary(),
      searchDataAvailable: searchPerformanceService.isSearchDataAvailable(),
    },
  };
}

export const contentAnalyticsDashboardService = {
  getMainDashboardData,
};
