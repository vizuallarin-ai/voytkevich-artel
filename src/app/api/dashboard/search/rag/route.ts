import { NextResponse } from "next/server";
import { searchDashboardService } from "@/lib/search/search-dashboard-service";

export async function GET() {
  const data = await searchDashboardService.getRAGDashboardData();
  return NextResponse.json(data);
}
