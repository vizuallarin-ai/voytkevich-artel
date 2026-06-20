import { NextResponse } from "next/server";
import { crmAnalyticsIntegration } from "@/lib/content-analytics/crm-analytics-integration";
import { getDateRange } from "@/lib/analytics/date-range";
import type { DateRangeKey } from "@/types/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rangeKey = (searchParams.get("range") ?? "30d") as DateRangeKey;
  const range = getDateRange(rangeKey);
  const period = { from: range.from.toISOString(), to: range.to.toISOString() };

  return NextResponse.json({
    leadsByContent: await crmAnalyticsIntegration.getQualifiedLeadsByContent(period),
    dealsByContent: await crmAnalyticsIntegration.getDealsByContent(period),
    crmAvailable: true,
  });
}
