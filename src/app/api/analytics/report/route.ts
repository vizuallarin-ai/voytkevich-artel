import { NextResponse } from "next/server";
import { getAnalyticsReport } from "@/lib/analytics/analytics-service";
import { parseDateRangeKey } from "@/lib/analytics/date-range";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = parseDateRangeKey(searchParams.get("range"));
  const report = await getAnalyticsReport(range);
  return NextResponse.json(report);
}
