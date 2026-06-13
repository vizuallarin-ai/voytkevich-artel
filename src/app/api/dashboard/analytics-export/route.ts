import { NextResponse } from "next/server";
import { getAnalyticsReport } from "@/lib/analytics/analytics-service";
import { analyticsReportToCsv } from "@/lib/analytics/analytics-export";
import { parseDateRangeKey } from "@/lib/analytics/date-range";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = parseDateRangeKey(searchParams.get("range") ?? undefined);
  const report = await getAnalyticsReport(range);
  const csv = analyticsReportToCsv(report);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
