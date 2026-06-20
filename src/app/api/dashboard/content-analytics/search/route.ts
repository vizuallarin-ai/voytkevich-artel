import { NextResponse } from "next/server";
import { searchPerformanceService } from "@/lib/content-analytics/search-performance-service";
import { getDateRange } from "@/lib/analytics/date-range";
import type { DateRangeKey } from "@/types/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rangeKey = (searchParams.get("range") ?? "30d") as DateRangeKey;
  const range = getDateRange(rangeKey);
  const period = { from: range.from.toISOString(), to: range.to.toISOString() };

  return NextResponse.json({
    byPage: await searchPerformanceService.getSearchPerformanceByPage(period),
    dataAvailable: searchPerformanceService.isSearchDataAvailable(),
  });
}
