import type { IndexabilityDecision } from "@/types/seo-indexation";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";
import { cmsItemToIndexablePage } from "@/lib/seo-indexation/indexable-page-adapters";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";
import { buildSitemapEntries } from "@/lib/seo/build-sitemap";
import { getSitemapStats, metadataEntryToSitemapEntry } from "@/lib/seo-indexation/sitemap-service";
import { detectCanonicalConflicts } from "@/lib/seo-indexation/canonical-conflict-detector";
import { getCrawlBudgetSummary } from "@/lib/seo-indexation/crawl-budget-service";
import { summarizeCrawlWaste } from "@/lib/seo-indexation/crawl-waste-detector";
import { indexationMonitoringService } from "@/lib/seo-indexation/indexation-monitoring-service";
import { deriveUrlLifecycleStatus } from "@/lib/seo-indexation/url-lifecycle-service";

export type IndexationDashboardRow = {
  contentItemId: string;
  title: string;
  url: string;
  kind: string;
  status: string;
  decision: IndexabilityDecision;
};

export const indexationDashboardService = {
  async getDashboardData() {
    const items = await contentRepository.listContent();
    const rows: IndexationDashboardRow[] = items.map((item) => {
      const page = cmsItemToIndexablePage(item);
      const decision = evaluateIndexability(page, { existingItems: items });
      return {
        contentItemId: item.id,
        title: item.title,
        url: item.url,
        kind: item.kind,
        status: item.status,
        decision,
      };
    });

    const indexable = rows.filter((r) => r.decision.indexable);
    const blocked = rows.filter((r) => r.decision.status === "blocked");
    const noindex = rows.filter((r) => !r.decision.indexable);
    const sitemapEligible = rows.filter((r) => r.decision.sitemap);
    const needsReview = rows.filter((r) => r.decision.blockers.length > 0 && r.decision.status === "pending");
    const p1p2Blocked = rows.filter(
      (r) =>
        !r.decision.indexable &&
        (r.decision.priorityLevel === "P1" || r.decision.priorityLevel === "P2"),
    );

    let sitemapStats = {
      totalEntries: 0,
      indexableEntries: 0,
      excludedEntries: 0,
      bySegment: {} as Record<string, number>,
      duplicatesRemoved: 0,
    };
    try {
      const entries = await buildSitemapEntries();
      const allConverted = entries.map(metadataEntryToSitemapEntry);
      sitemapStats = getSitemapStats(allConverted, allConverted);
    } catch {
      // fallback empty stats
    }

    return {
      metrics: {
        totalUrls: rows.length,
        indexable: indexable.length,
        noindex: noindex.length,
        blocked: blocked.length,
        pending: needsReview.length,
        sitemapIncluded: sitemapEligible.length,
        manualNoindex: rows.filter((r) => r.decision.reasons.includes("manual-noindex")).length,
        criticalBlockers: rows.filter((r) => r.decision.blockers.length > 0).length,
        p1p2Blocked: p1p2Blocked.length,
      },
      readyToIndex: indexable.slice(0, 12),
      blocked: rows.filter((r) => r.decision.blockers.length > 0).slice(0, 12),
      highPriorityBlocked: p1p2Blocked.slice(0, 8),
      thinContent: rows.filter((r) => r.decision.reasons.includes("thin-content-high")).slice(0, 8),
      sitemapStats,
    };
  },

  async getSitemapDashboardData() {
    const entries = await buildSitemapEntries();
    const converted = entries.map(metadataEntryToSitemapEntry);
    return { stats: getSitemapStats(converted, converted), entries: converted.slice(0, 100) };
  },

  async getCanonicalDashboardData() {
    const items = await contentRepository.listContent();
    const pages = items.map(cmsItemToIndexablePage);
    const report = detectCanonicalConflicts(pages);
    return {
      total: pages.length,
      selfCanonical: pages.filter((p) => p.canonicalUrl === p.url || !p.canonicalUrl).length,
      conflicts: report.conflicts.slice(0, 50),
      summary: report.summary,
    };
  },

  async getCrawlBudgetDashboardData() {
    const items = await contentRepository.listContent();
    const pages = items.map(cmsItemToIndexablePage);
    const summary = getCrawlBudgetSummary(pages);
    const wasteReport = summarizeCrawlWaste(pages);
    return { summary, waste: wasteReport.items };
  },

  async getLifecycleDashboardData() {
    const items = await contentRepository.listContent();
    return items.map((item) => ({
      contentItemId: item.id,
      title: item.title,
      url: item.url,
      lifecycle: deriveUrlLifecycleStatus(cmsItemToIndexablePage(item)),
      indexable: evaluateIndexability(cmsItemToIndexablePage(item)).indexable,
    }));
  },

  async getMonitoringDashboardData() {
    const items = await contentRepository.listContent();
    const published = items.filter((i) => i.status === "published");
    return {
      records: indexationMonitoringService.buildMonitoringRecords(published),
      dataSourceAvailable: indexationMonitoringService.hasExternalCredentials(),
    };
  },

  async recalculateAll() {
    return cmsIndexationIntegration.recalculateAllCMSIndexability();
  },
};
