import { NextResponse } from "next/server";
import { clusterPerformanceService } from "@/lib/content-analytics/cluster-performance-service";
import { getDateRange } from "@/lib/analytics/date-range";
import type { DateRangeKey } from "@/types/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rangeKey = (searchParams.get("range") ?? "30d") as DateRangeKey;
  const range = getDateRange(rangeKey);
  const period = { from: range.from.toISOString(), to: range.to.toISOString() };
  const clusters = await clusterPerformanceService.compareClusters(period);
  return NextResponse.json({
    clusters,
    winners: clusterPerformanceService.findWinningClusters(clusters),
  });
}
