import { randomUUID } from "crypto";
import type { ContentVersion } from "@/types/content-version";
import type { PostRefreshMonitoringWindow } from "@/types/post-refresh-monitoring";
import { refreshStore } from "@/lib/content-refresh/refresh-store";
import { refreshAnalytics } from "@/lib/content-refresh/refresh-analytics";

const OBSERVATION_DAYS = 21;

export function createMonitoringWindow(version: ContentVersion): PostRefreshMonitoringWindow {
  const now = new Date();
  const baselineEnd = version.publishedAt ?? now.toISOString();
  const baselineStart = new Date(now.getTime() - OBSERVATION_DAYS * 86400000).toISOString();
  const observationStart = baselineEnd;
  const observationEnd = new Date(now.getTime() + OBSERVATION_DAYS * 86400000).toISOString();

  const brief = version.updateBriefId ? refreshStore.getBrief(version.updateBriefId) : undefined;

  const window: PostRefreshMonitoringWindow = {
    id: randomUUID(),
    contentItemId: version.contentItemId,
    versionId: version.id,
    experimentId: version.experimentId,
    baselinePeriod: { from: baselineStart, to: baselineEnd },
    observationPeriod: { from: observationStart, to: observationEnd },
    primaryMetrics: brief?.successMetrics ?? ["traffic.pageViews", "search.clicks"],
    guardrailMetrics: brief?.guardrailMetrics ?? ["search.indexed", "conversions.qualifiedLeads"],
    status: "waiting",
    createdAt: new Date().toISOString(),
  };

  refreshStore.saveMonitoringWindow(window);
  refreshAnalytics.trackRefreshMonitoringStarted({
    contentItemId: version.contentItemId,
    versionId: version.id,
  });

  return window;
}

export function captureRefreshBaseline(version: ContentVersion): void {
  const windows = refreshStore
    .listMonitoringWindows()
    .filter((w) => w.versionId === version.id);

  for (const window of windows) {
    refreshStore.appendMonitoringMetrics({
      windowId: window.id,
      capturedAt: new Date().toISOString(),
      metrics: {},
      phase: "baseline",
    });
  }
}

export function collectPostRefreshMetrics(
  window: PostRefreshMonitoringWindow,
): Record<string, number | null> {
  const updated = { ...window, status: "collecting" as const };
  refreshStore.saveMonitoringWindow(updated);

  refreshStore.appendMonitoringMetrics({
    windowId: window.id,
    capturedAt: new Date().toISOString(),
    metrics: {},
    phase: "observation",
  });

  return {};
}

export function compareBeforeAfter(window: PostRefreshMonitoringWindow): {
  metrics: Record<string, { before: number | null; after: number | null; changePercent: number | null }>;
  sufficientData: boolean;
} {
  const snapshots = refreshStore.getMonitoringMetrics(window.id);
  const baseline = snapshots.filter((s) => s.phase === "baseline").pop();
  const observation = snapshots.filter((s) => s.phase === "observation").pop();

  const metrics: Record<string, { before: number | null; after: number | null; changePercent: number | null }> = {};

  for (const key of window.primaryMetrics) {
    const before = baseline?.metrics[key] ?? null;
    const after = observation?.metrics[key] ?? null;
    const changePercent =
      before != null && after != null && before !== 0
        ? ((after - before) / before) * 100
        : null;
    metrics[key] = { before, after, changePercent };
  }

  const sufficientData = Boolean(baseline && observation);

  return { metrics, sufficientData };
}

export function detectPostRefreshRegression(window: PostRefreshMonitoringWindow): string[] {
  const comparison = compareBeforeAfter(window);
  const regressions: string[] = [];

  for (const [key, values] of Object.entries(comparison.metrics)) {
    if (values.changePercent != null && values.changePercent < -15) {
      regressions.push(`${key} declined ${values.changePercent.toFixed(1)}%`);
    }
  }

  if (regressions.length > 0) {
    refreshAnalytics.trackRefreshRegressionDetected({
      contentItemId: window.contentItemId,
      versionId: window.versionId,
    });
  }

  return regressions;
}

export function detectPostRefreshImprovement(window: PostRefreshMonitoringWindow): string[] {
  const comparison = compareBeforeAfter(window);
  const improvements: string[] = [];

  for (const [key, values] of Object.entries(comparison.metrics)) {
    if (values.changePercent != null && values.changePercent > 10) {
      improvements.push(`${key} improved ${values.changePercent.toFixed(1)}%`);
    }
  }

  if (improvements.length > 0) {
    refreshAnalytics.trackRefreshImprovementDetected({
      contentItemId: window.contentItemId,
      versionId: window.versionId,
    });
  }

  return improvements;
}

export function validateMonitoringSample(window: PostRefreshMonitoringWindow): {
  valid: boolean;
  reason: string;
} {
  const now = Date.now();
  const obsEnd = new Date(window.observationPeriod.to).getTime();
  const obsStart = new Date(window.observationPeriod.from).getTime();
  const elapsed = now - obsStart;
  const total = obsEnd - obsStart;

  if (elapsed < total * 0.5) {
    return { valid: false, reason: "Observation period incomplete" };
  }

  const snapshots = refreshStore.getMonitoringMetrics(window.id);
  if (snapshots.length < 2) {
    return { valid: false, reason: "Insufficient metric snapshots" };
  }

  return { valid: true, reason: "Sample sufficient for preliminary analysis" };
}

export function buildPostRefreshReport(window: PostRefreshMonitoringWindow): {
  window: PostRefreshMonitoringWindow;
  comparison: ReturnType<typeof compareBeforeAfter>;
  regressions: string[];
  improvements: string[];
  sampleValid: boolean;
} {
  const sample = validateMonitoringSample(window);
  const updated = {
    ...window,
    status: sample.valid ? ("ready-for-analysis" as const) : window.status,
  };
  refreshStore.saveMonitoringWindow(updated);

  return {
    window: updated,
    comparison: compareBeforeAfter(window),
    regressions: detectPostRefreshRegression(window),
    improvements: detectPostRefreshImprovement(window),
    sampleValid: sample.valid,
  };
}

export function recommendKeepImproveOrRollback(
  window: PostRefreshMonitoringWindow,
): "keep" | "continue-monitoring" | "improve" | "investigate" | "rollback" {
  const report = buildPostRefreshReport(window);

  if (!report.sampleValid) return "continue-monitoring";
  if (report.regressions.length >= 2) {
    refreshAnalytics.trackRefreshRollbackRecommended({
      contentItemId: window.contentItemId,
      versionId: window.versionId,
    });
    return "rollback";
  }
  if (report.regressions.length === 1) return "investigate";
  if (report.improvements.length > 0) return "keep";
  return "improve";
}

export const postRefreshMonitoringService = {
  createMonitoringWindow,
  captureRefreshBaseline,
  collectPostRefreshMetrics,
  compareBeforeAfter,
  detectPostRefreshRegression,
  detectPostRefreshImprovement,
  validateMonitoringSample,
  buildPostRefreshReport,
  recommendKeepImproveOrRollback,
};
