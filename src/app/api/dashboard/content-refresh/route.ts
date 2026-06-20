import { NextResponse } from "next/server";
import { getMainRefreshDashboardData } from "@/lib/content-refresh/refresh-dashboard-service";
import type { DateRangeKey } from "@/types/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "30d") as DateRangeKey;
  const data = await getMainRefreshDashboardData(range);
  return NextResponse.json(data);
}
