import { NextResponse } from "next/server";
import { recommendationDashboardService } from "@/lib/recommendations/recommendation-dashboard-service";

export async function GET() {
  const data = recommendationDashboardService.getRecommendationDashboardOverview();
  return NextResponse.json(data);
}
