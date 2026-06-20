import { NextResponse } from "next/server";
import { contentRoiService } from "@/lib/content-analytics/content-roi-service";
import { buildContentPerformanceSnapshots } from "@/lib/content-analytics/content-performance-snapshot-service";
import { getDateRange } from "@/lib/analytics/date-range";
import type { DateRangeKey } from "@/types/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rangeKey = (searchParams.get("range") ?? "30d") as DateRangeKey;
  const range = getDateRange(rangeKey);
  const period = { from: range.from.toISOString(), to: range.to.toISOString() };
  const snapshots = await buildContentPerformanceSnapshots(period);
  const roiItems = snapshots
    .map((s) => ({
      contentItemId: s.contentItemId,
      url: s.url,
      roi: contentRoiService.calculateContentROI(s),
      revenueRatio: contentRoiService.calculateRevenueReturnRatio(s),
      limitations: contentRoiService.explainROILimitations(s),
    }))
    .slice(0, 50);
  return NextResponse.json({ items: roiItems });
}
