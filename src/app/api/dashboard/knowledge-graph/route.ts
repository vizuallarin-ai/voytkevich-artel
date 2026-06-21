import { NextResponse } from "next/server";
import { knowledgeGraphDashboardService } from "@/lib/knowledge-graph/knowledge-graph-dashboard-service";

export async function GET() {
  const data = await knowledgeGraphDashboardService.getMainKnowledgeGraphDashboardData();
  return NextResponse.json({
    kpis: data.kpis,
    validation: {
      valid: data.validation.valid,
      errorCount: data.validation.errorCount,
      warningCount: data.validation.warningCount,
      issues: data.validation.issues.slice(0, 50),
    },
    subgraph: data.subgraph,
  });
}
