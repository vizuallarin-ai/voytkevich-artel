import { NextResponse } from "next/server";
import { conversionPerformanceService } from "@/lib/content-analytics/conversion-performance-service";
import { buildContentPerformanceSnapshots } from "@/lib/content-analytics/content-performance-snapshot-service";
import { getDateRange } from "@/lib/analytics/date-range";
import type { DateRangeKey } from "@/types/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rangeKey = (searchParams.get("range") ?? "30d") as DateRangeKey;
  const range = getDateRange(rangeKey);
  const period = { from: range.from.toISOString(), to: range.to.toISOString() };
  const snapshots = await buildContentPerformanceSnapshots(period);

  return NextResponse.json({
    byContentType: await conversionPerformanceService.getConversionsByContentType(period),
    highTrafficLowConversion:
      conversionPerformanceService.findHighTrafficLowConversionPages(snapshots),
    lowTrafficHighConversion:
      conversionPerformanceService.findLowTrafficHighConversionPages(snapshots),
  });
}
