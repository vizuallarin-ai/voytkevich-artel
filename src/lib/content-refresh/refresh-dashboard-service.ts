import { contentRepository } from "@/lib/content-cms/content-repository";
import { buildContentPerformanceSnapshots } from "@/lib/content-analytics/content-performance-snapshot-service";
import { getDateRange } from "@/lib/analytics/date-range";
import type { DateRangeKey } from "@/types/analytics";
import { refreshQueueService } from "@/lib/content-refresh/refresh-queue-service";
import { refreshStore } from "@/lib/content-refresh/refresh-store";
import { experimentStore } from "@/lib/content-experiments/experiment-store";
import { postRefreshMonitoringService } from "@/lib/content-refresh/post-refresh-monitoring-service";
import type { ContentRefreshCandidate } from "@/types/content-refresh";

export type RefreshDashboardData = {
  kpis: {
    detected: number;
    critical: number;
    high: number;
    needsDiagnosis: number;
    readyForBrief: number;
    inReview: number;
    monitoring: number;
    activeExperiments: number;
  };
  queue: ContentRefreshCandidate[];
  urgent: ContentRefreshCandidate[];
  byStatus: ReturnType<typeof refreshQueueService.groupRefreshQueueByStatus>;
  meta: {
    period: { from: string; to: string };
    queueBuiltAt: string;
  };
};

export async function getMainRefreshDashboardData(
  rangeKey: DateRangeKey = "30d",
): Promise<RefreshDashboardData> {
  const range = getDateRange(rangeKey);
  const period = { from: range.from.toISOString(), to: range.to.toISOString() };
  const [items, snapshots] = await Promise.all([
    contentRepository.listContent(),
    buildContentPerformanceSnapshots(period),
  ]);

  const queue = refreshQueueService.buildContentRefreshQueue(items, { snapshots, period });
  const byStatus = refreshQueueService.groupRefreshQueueByStatus(queue);

  const countLevel = (level: string) =>
    queue.filter((c) => c.priority.level === level && c.status !== "cancelled").length;

  const experiments = experimentStore.list();
  const activeExperiments = experiments.filter((e) =>
    ["running", "scheduled", "approved"].includes(e.status),
  ).length;

  const monitoring = refreshStore.listMonitoringWindows();
  const monitoringActive = monitoring.filter((w) =>
    ["collecting", "waiting", "alert"].includes(w.status),
  ).length;

  return {
    kpis: {
      detected: queue.length,
      critical: countLevel("critical"),
      high: countLevel("high"),
      needsDiagnosis: byStatus["needs-diagnosis"]?.length ?? 0,
      readyForBrief: byStatus["ready-for-brief"]?.length ?? 0,
      inReview: (byStatus["editorial-review"]?.length ?? 0) +
        (byStatus["seo-review"]?.length ?? 0) +
        (byStatus["expert-review"]?.length ?? 0),
      monitoring: monitoringActive,
      activeExperiments,
    },
    queue: queue.slice(0, 50),
    urgent: queue.filter((c) => c.priority.level === "critical" || c.priority.level === "high").slice(0, 10),
    byStatus,
    meta: {
      period,
      queueBuiltAt: new Date().toISOString(),
    },
  };
}

export async function getRefreshQueueData(rangeKey: DateRangeKey = "30d") {
  const data = await getMainRefreshDashboardData(rangeKey);
  return {
    queue: data.queue,
    next: refreshQueueService.getNextRefreshCandidates(20),
    stored: refreshStore.listCandidates(),
  };
}

export function getRefreshBriefsData() {
  return { briefs: refreshStore.listBriefs() };
}

export function getRefreshReviewsData() {
  return {
    reviews: refreshStore.listReviews(),
    pending: refreshStore.listReviews().filter((r) => r.status === "pending"),
  };
}

export function getRefreshVersionsData() {
  return { versions: refreshStore.listVersions() };
}

export function getRefreshMonitoringData() {
  return {
    windows: refreshStore.listMonitoringWindows(),
    reports: refreshStore.listMonitoringWindows().map((w) => ({
      windowId: w.id,
      recommendation: postRefreshMonitoringService.recommendKeepImproveOrRollback(w),
    })),
  };
}

export function getExperimentsDashboardData() {
  const experiments = experimentStore.list();
  return {
    experiments,
    active: experiments.filter((e) => e.status === "running"),
    awaitingReview: experiments.filter((e) => e.status === "review"),
    completed: experiments.filter((e) => ["completed", "inconclusive", "stopped"].includes(e.status)),
  };
}

export const refreshDashboardService = {
  getMainRefreshDashboardData,
  getRefreshQueueData,
  getRefreshBriefsData,
  getRefreshReviewsData,
  getRefreshVersionsData,
  getRefreshMonitoringData,
  getExperimentsDashboardData,
};
