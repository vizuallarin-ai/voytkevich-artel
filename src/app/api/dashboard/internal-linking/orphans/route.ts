import { NextResponse } from "next/server";
import { knowledgeGraphDashboardService } from "@/lib/knowledge-graph/knowledge-graph-dashboard-service";

export async function GET() {
  const data = await knowledgeGraphDashboardService.getOrphanPagesDashboardData();
  return NextResponse.json(data);
}
