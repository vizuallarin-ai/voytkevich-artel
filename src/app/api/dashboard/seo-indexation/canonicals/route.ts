import { NextResponse } from "next/server";
import { indexationDashboardService } from "@/lib/seo-indexation/indexation-dashboard-service";

export async function GET() {
  const data = await indexationDashboardService.getCanonicalDashboardData();
  return NextResponse.json(data);
}
