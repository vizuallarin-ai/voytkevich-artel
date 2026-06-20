import { NextResponse } from "next/server";
import { distributionPerformanceService } from "@/lib/content-analytics/distribution-performance-service";
import { getDateRange } from "@/lib/analytics/date-range";
import type { DateRangeKey } from "@/types/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rangeKey = (searchParams.get("range") ?? "30d") as DateRangeKey;
  const range = getDateRange(rangeKey);
  const period = { from: range.from.toISOString(), to: range.to.toISOString() };

  return NextResponse.json({
    byChannel: await distributionPerformanceService.getPerformanceByChannel(period),
    teaserCtr: await distributionPerformanceService.getTeaserCTR(period),
  });
}
