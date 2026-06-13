import type { Metadata } from "next";
import { AnalyticsDashboardClient } from "@/components/dashboard/analytics/analytics-dashboard-client";
import { getAnalyticsReport } from "@/lib/analytics/analytics-service";
import { parseDateRangeKey } from "@/lib/analytics/date-range";

export const metadata: Metadata = {
  title: "CRM — аналитика",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ range?: string; tab?: string }> };

export default async function AnalyticsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const range = parseDateRangeKey(sp.range);
  const report = await getAnalyticsReport(range);

  return <AnalyticsDashboardClient initial={report} />;
}
