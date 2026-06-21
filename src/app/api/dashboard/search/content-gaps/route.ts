import { NextResponse } from "next/server";
import { searchDashboardService } from "@/lib/search/search-dashboard-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const data = await searchDashboardService.getContentGapsDashboardData({ page, pageSize });
  return NextResponse.json(data);
}
