import { NextResponse } from "next/server";
import { indexationDashboardService } from "@/lib/seo-indexation/indexation-dashboard-service";

export async function GET() {
  const data = await indexationDashboardService.getCrawlBudgetDashboardData();
  return NextResponse.json(data);
}
