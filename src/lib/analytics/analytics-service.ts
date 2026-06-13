import type { AnalyticsReport, DateRangeKey } from "@/types/analytics";
import { GA_ID } from "@/lib/analytics/events";

const YM_ID = process.env.NEXT_PUBLIC_YM_ID ? Number(process.env.NEXT_PUBLIC_YM_ID) : 0;
import { getAllLeads } from "@/lib/leads/lead-repository";
import { getAnalyticsEvents, getAnalyticsStorageStatus } from "./analytics-storage";
import { computeCTAPerformance } from "./cta-performance";
import { computeCRMPerformance } from "./crm-performance";
import { getDateRange, getPreviousDateRange, isInDateRange } from "./date-range";
import { computeFunnels } from "./funnel-metrics";
import { computeKPIs, generateAnalyticsInsights } from "./insights";
import { computePagePerformance } from "./page-performance";
import { computeSourcePerformance } from "./source-performance";
import { computeToolPerformance } from "./tool-performance";

export async function getAnalyticsReport(rangeKey: DateRangeKey = "30d"): Promise<AnalyticsReport> {
  const range = getDateRange(rangeKey);
  const prevRange = getPreviousDateRange(range);

  const [events, allLeads] = await Promise.all([
    getAnalyticsEvents({
      from: range.from.toISOString(),
      to: range.to.toISOString(),
    }),
    getAllLeads(true),
  ]);

  const leads = allLeads.filter((l) => !l.isDemo && isInDateRange(l.meta.createdAt, range));
  const prevLeads = allLeads.filter((l) => !l.isDemo && isInDateRange(l.meta.createdAt, prevRange));

  const pages = computePagePerformance(events, allLeads, range);
  const sources = computeSourcePerformance(events, allLeads, range);
  const ctas = computeCTAPerformance(events, allLeads, range);
  const tools = computeToolPerformance(events, allLeads, range);
  const crm = computeCRMPerformance(allLeads, range);
  const funnels = computeFunnels(events, allLeads, range);

  const storage = getAnalyticsStorageStatus();
  const realEventCount = events.filter((e) => !e.meta?.debug).length;

  const kpis = computeKPIs(events, leads, pages, sources, ctas, crm, prevLeads);

  const report: AnalyticsReport = {
    range,
    kpis,
    funnels,
    pages,
    sources,
    ctas,
    tools,
    crm,
    insights: [],
    meta: {
      eventCount: events.length,
      leadCount: leads.length,
      hasEvents: realEventCount > 0 || events.length > 0,
      isDemo: storage.demoMode && realEventCount === 0,
      storageEnabled: storage.fileStore || storage.supabase,
      externalAnalytics: {
        yandex: Boolean(YM_ID),
        ga: Boolean(GA_ID),
      },
    },
  };

  report.insights = generateAnalyticsInsights(report);
  return report;
}

export { getAnalyticsReport as fetchAnalyticsReport };
