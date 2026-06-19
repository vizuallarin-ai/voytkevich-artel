import type { PriorityMetrics } from "@/types/content-prioritization";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { cmsPriorityIntegration } from "@/lib/content-prioritization/cms-priority-integration";
import { keywordDemandRepository } from "@/lib/content-prioritization/keyword-demand-repository";
import { semanticClusterRepository } from "@/lib/content-prioritization/semantic-cluster-service";
import { getPriorityQueueForCalendar } from "@/lib/content-prioritization/queue-sorter";
import {
  parseKeywordCSV,
  validateKeywordCSV,
  mapCSVRowsToKeywordDemandItems,
} from "@/lib/content-prioritization/csv-importer";
import {
  trackKeywordCsvImportCompleted,
  trackKeywordCsvImportFailed,
  trackKeywordCsvImportStarted,
  trackPriorityRecalculated,
} from "@/lib/content-prioritization/priority-analytics";

export const keywordDemandService = {
  list: () => keywordDemandRepository.list(),
  getMetrics: () => keywordDemandRepository.getMetrics(),
  getImportHistory: () => keywordDemandRepository.getImportHistory(),

  async importCSV(text: string) {
    trackKeywordCsvImportStarted({});
    const rows = parseKeywordCSV(text);
    const validation = validateKeywordCSV(rows);
    if (!validation.valid) {
      trackKeywordCsvImportFailed({ errors: validation.errors.length });
      throw new Error(validation.errors.join("; "));
    }
    const items = mapCSVRowsToKeywordDemandItems(rows);
    const result = await keywordDemandRepository.importItems(items);
    trackKeywordCsvImportCompleted({
      imported: result.imported,
      duplicates: result.duplicates,
    });
    return { ...result, warnings: validation.warnings };
  },

  async mapToContent(keywordId: string, contentItemId: string) {
    const kw = await keywordDemandRepository.getById(keywordId);
    if (!kw) throw new Error("Keyword not found");
    kw.mappedTo.contentItemId = contentItemId;
    kw.status = "mapped";
    return keywordDemandRepository.save(kw);
  },
};

export const priorityService = {
  async getDashboardData() {
    const items = await contentRepository.listContent();
    const queue = await getPriorityQueueForCalendar(items);
    const keywordMetrics = await keywordDemandRepository.getMetrics();
    const clusters = await semanticClusterRepository.list();

    const metrics: PriorityMetrics = {
      totalItems: items.length,
      p1: queue.filter((q) => q.score.level === "P1").length,
      p2: queue.filter((q) => q.score.level === "P2").length,
      p3: queue.filter((q) => q.score.level === "P3").length,
      p4: queue.filter((q) => q.score.level === "P4").length,
      p5: queue.filter((q) => q.score.level === "P5").length,
      highConfidence: queue.filter((q) => q.score.confidence === "high").length,
      lowConfidence: queue.filter((q) => q.score.confidence === "low").length,
      needsKeywordData: queue.filter((q) => !q.score.dataAvailability.hasSearchVolume).length,
      highCommercialIntent: queue.filter((q) => q.score.inputs.commercialIntentScore >= 75).length,
      highLeadPotential: queue.filter((q) => q.score.inputs.leadPotentialScore >= 75).length,
      highCannibalizationRisk: queue.filter((q) => q.score.inputs.cannibalizationPenalty >= 15).length,
      readyToSchedule: queue.filter((q) => q.score.inputs.readinessScore >= 80).length,
    };

    return {
      metrics,
      keywordMetrics,
      topP1: queue.filter((q) => q.score.level === "P1").slice(0, 8),
      needsKeywordData: queue.filter((q) => !q.score.dataAvailability.hasSearchVolume).slice(0, 8),
      blocked: queue.filter((q) => q.readinessBlockers.length > 0).slice(0, 8),
      seasonal: queue.filter((q) => q.score.inputs.seasonalityScore >= 60).slice(0, 5),
      clusterCount: clusters.length,
      mode: keywordMetrics.withVolume > 0 ? "data-driven" : "heuristic",
    };
  },

  async getQueue() {
    const items = await contentRepository.listContent();
    return getPriorityQueueForCalendar(items);
  },

  async recalculateAll() {
    const count = await cmsPriorityIntegration.recalculateAllPriorities();
    trackPriorityRecalculated({ count });
    return count;
  },

  async getItemPriority(contentItemId: string) {
    return cmsPriorityIntegration.recalculateCMSContentPriority(contentItemId);
  },
};
