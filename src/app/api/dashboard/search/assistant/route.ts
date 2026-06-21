import { NextResponse } from "next/server";
import { searchDashboardService } from "@/lib/search/search-dashboard-service";

export async function GET() {
  const data = await searchDashboardService.getAssistantDashboardData();
  return NextResponse.json(data);
}
