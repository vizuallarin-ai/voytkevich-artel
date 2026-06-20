import type { ContentAnalyticsPeriod } from "@/types/content-analytics";
import { buildContentPerformanceSnapshots } from "@/lib/content-analytics/content-performance-snapshot-service";
import { searchPerformanceService } from "@/lib/content-analytics/search-performance-service";
import { publicationPerformanceService } from "@/lib/content-analytics/publication-performance-service";
import { priorityFeedbackService } from "@/lib/content-analytics/priority-feedback-service";
import { dataQualityService } from "@/lib/content-analytics/data-quality-service";
import { contentIntelligenceService } from "@/lib/content-analytics/content-intelligence-service";

export type ContentReport = {
  id: string;
  type: string;
  period: ContentAnalyticsPeriod;
  generatedAt: string;
  summary: Record<string, string | number | null>;
  sections: Record<string, unknown>;
};

const PII_FIELD_PATTERN =
  /^(name|phone|email|contact|comment|message|address|messenger|password|token)$/i;

function sanitizeForExport(value: unknown): unknown {
  if (value == null) return null;
  if (Array.isArray(value)) return value.map(sanitizeForExport);
  if (typeof value === "object") {
    const obj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (PII_FIELD_PATTERN.test(key)) continue;
      obj[key] = sanitizeForExport(val);
    }
    return obj;
  }
  return value;
}

export function exportAnalyticsTableToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const sanitized = data.map((row) => sanitizeForExport(row) as Record<string, unknown>);
  const headers = [...new Set(sanitized.flatMap((row) => Object.keys(row)))];
  const lines = [headers.join(",")];

  for (const row of sanitized) {
    const cells = headers.map((h) => {
      const val = row[h];
      if (val == null) return "";
      const str = String(val).replace(/"/g, '""');
      return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
    });
    lines.push(cells.join(","));
  }

  return lines.join("\n");
}

export function exportReportToCSV(report: ContentReport): string {
  const rows: Record<string, unknown>[] = [];

  for (const [key, value] of Object.entries(report.summary)) {
    rows.push({ section: "summary", metric: key, value });
  }

  for (const [section, content] of Object.entries(report.sections)) {
    if (Array.isArray(content)) {
      for (const item of content) {
        rows.push({ section, ...(sanitizeForExport(item) as Record<string, unknown>) });
      }
    } else if (typeof content === "object" && content) {
      rows.push({ section, ...(sanitizeForExport(content) as Record<string, unknown>) });
    }
  }

  return exportAnalyticsTableToCSV(rows);
}

async function baseReport(type: string, period: ContentAnalyticsPeriod): Promise<ContentReport> {
  const snapshots = await buildContentPerformanceSnapshots(period);
  return {
    id: `${type}-${period.from}-${period.to}`,
    type,
    period,
    generatedAt: new Date().toISOString(),
    summary: {
      contentItems: snapshots.length,
      totalPageViews: snapshots.reduce((a, s) => a + (s.traffic.pageViews ?? 0), 0) || null,
      totalLeads: snapshots.reduce((a, s) => a + (s.conversions.leads ?? 0), 0) || null,
      searchDataAvailable: searchPerformanceService.isSearchDataAvailable() ? 1 : 0,
    },
    sections: {},
  };
}

export async function generateWeeklyContentReport(period: ContentAnalyticsPeriod): Promise<ContentReport> {
  const report = await baseReport("weekly-content", period);
  report.sections.publication = await publicationPerformanceService.comparePlannedVsPublished(period);
  report.sections.recommendations = await contentIntelligenceService.recommendContentToInvestigate(period);
  return report;
}

export async function generateMonthlyContentReport(period: ContentAnalyticsPeriod): Promise<ContentReport> {
  const report = await baseReport("monthly-content", period);
  report.sections.publication = await publicationPerformanceService.comparePlannedVsCreated(period);
  report.sections.winners = await contentIntelligenceService.recommendContentToPromote(period);
  report.sections.updates = await contentIntelligenceService.recommendContentToUpdate(period);
  return report;
}

export async function generateSEOReport(period: ContentAnalyticsPeriod): Promise<ContentReport> {
  const report = await baseReport("seo", period);
  const search = await searchPerformanceService.getSearchPerformanceByPage(period);
  report.sections.search = search;
  report.sections.highImpressionLowCtr = searchPerformanceService.detectHighImpressionLowCTR(search);
  report.summary.searchDataAvailable = searchPerformanceService.isSearchDataAvailable() ? 1 : 0;
  return report;
}

export async function generateConversionReport(period: ContentAnalyticsPeriod): Promise<ContentReport> {
  const report = await baseReport("conversion", period);
  const snapshots = await buildContentPerformanceSnapshots(period);
  report.sections.byContentType = snapshots.reduce(
    (acc, s) => {
      if (!acc[s.contentType]) acc[s.contentType] = { leads: 0, views: 0 };
      acc[s.contentType].leads += s.conversions.leads ?? 0;
      acc[s.contentType].views += s.traffic.pageViews ?? 0;
      return acc;
    },
    {} as Record<string, { leads: number; views: number }>,
  );
  return report;
}

export async function generateROIReport(period: ContentAnalyticsPeriod): Promise<ContentReport> {
  const report = await baseReport("roi", period);
  report.summary.roiCalculable = null;
  report.sections.note = "ROI requires content cost and business outcome — both nullable until imported";
  return report;
}

export async function generatePriorityAccuracyReport(period: ContentAnalyticsPeriod): Promise<ContentReport> {
  const snapshots = await buildContentPerformanceSnapshots(period);
  const comparisons = await priorityFeedbackService.comparePriorityWithPerformance(snapshots);
  const report = await baseReport("priority-accuracy", period);
  report.sections.feedback = priorityFeedbackService.buildPriorityFeedbackReport(comparisons);
  report.summary.accuracy = priorityFeedbackService.calculatePriorityPredictionAccuracy(comparisons);
  return report;
}

export async function generateCalendarPerformanceReport(period: ContentAnalyticsPeriod): Promise<ContentReport> {
  const report = await baseReport("calendar-performance", period);
  report.sections.plannedVsPublished = await publicationPerformanceService.comparePlannedVsPublished(period);
  report.sections.overdue = (await publicationPerformanceService.findOverdueContent(period)).length;
  return report;
}

export async function generateDataQualityReport(): Promise<ContentReport> {
  const audit = await dataQualityService.runDataQualityAudit();
  return {
    id: `data-quality-${Date.now()}`,
    type: "data-quality",
    period: { from: "", to: "" },
    generatedAt: new Date().toISOString(),
    summary: {
      issueCount: audit.issues.length,
      highSeverity: audit.issues.filter((i) => i.severity === "high").length,
    },
    sections: audit,
  };
}

export const reportService = {
  generateWeeklyContentReport,
  generateMonthlyContentReport,
  generateSEOReport,
  generateConversionReport,
  generateROIReport,
  generatePriorityAccuracyReport,
  generateCalendarPerformanceReport,
  generateDataQualityReport,
  exportReportToCSV,
  exportAnalyticsTableToCSV,
};
