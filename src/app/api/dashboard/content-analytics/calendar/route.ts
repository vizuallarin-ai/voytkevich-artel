import { NextResponse } from "next/server";
import { calendarFeedbackService } from "@/lib/content-analytics/calendar-feedback-service";
import { publicationPerformanceService } from "@/lib/content-analytics/publication-performance-service";
import { getDateRange } from "@/lib/analytics/date-range";
import type { DateRangeKey } from "@/types/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rangeKey = (searchParams.get("range") ?? "30d") as DateRangeKey;
  const range = getDateRange(rangeKey);
  const period = { from: range.from.toISOString(), to: range.to.toISOString() };

  return NextResponse.json({
    plannedVsPublished: await publicationPerformanceService.comparePlannedVsPublished(period),
    scheduleModes: await calendarFeedbackService.compareScheduleModes(period),
    completionRate: await publicationPerformanceService.calculatePublicationCompletionRate(period),
  });
}
