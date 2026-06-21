import { NextResponse } from "next/server";
import { recommendationDashboardService } from "@/lib/recommendations/recommendation-dashboard-service";

export async function GET() {
  const data = recommendationDashboardService.getRulesDashboardSummary();
  return NextResponse.json(data);
}
