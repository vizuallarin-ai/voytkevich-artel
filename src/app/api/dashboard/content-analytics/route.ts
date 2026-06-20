import { NextResponse } from "next/server";
import { getMainDashboardData } from "@/lib/content-analytics/content-analytics-dashboard-service";
import type { DateRangeKey } from "@/types/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "30d") as DateRangeKey;
  const data = await getMainDashboardData(range);
  return NextResponse.json(data);
}
