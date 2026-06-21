import { NextResponse } from "next/server";
import { searchDashboardService } from "@/lib/search/search-dashboard-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const data = await searchDashboardService.getIndexDashboardData({ page, pageSize: 50 });
  return NextResponse.json(data);
}
