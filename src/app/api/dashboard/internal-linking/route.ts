import { NextResponse } from "next/server";
import { knowledgeGraphDashboardService } from "@/lib/knowledge-graph/knowledge-graph-dashboard-service";
import { linkReviewService } from "@/lib/internal-linking/link-review-service";

export async function GET() {
  const data = await knowledgeGraphDashboardService.getInternalLinkingDashboardData();
  return NextResponse.json({
    summary: data.summary,
    sampleOpportunities: data.sampleOpportunities,
    recommendations: data.recommendations.slice(0, 100),
    batches: data.batches,
    inventoryCount: data.inventory.length,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: string;
    recommendationId?: string;
    recommendationIds?: string[];
    actor?: string;
    reason?: string;
    batchId?: string;
  };

  switch (body.action) {
    case "approve": {
      if (!body.recommendationId) {
        return NextResponse.json({ error: "recommendationId required" }, { status: 400 });
      }
      const rec = linkReviewService.approveLinkRecommendation(body.recommendationId, body.actor);
      return NextResponse.json({ recommendation: rec });
    }
    case "reject": {
      if (!body.recommendationId || !body.reason) {
        return NextResponse.json({ error: "recommendationId and reason required" }, { status: 400 });
      }
      const rec = linkReviewService.rejectLinkRecommendation(
        body.recommendationId,
        body.actor,
        body.reason,
      );
      return NextResponse.json({ recommendation: rec });
    }
    case "approve-batch": {
      if (!body.recommendationIds?.length) {
        return NextResponse.json({ error: "recommendationIds required" }, { status: 400 });
      }
      const result = linkReviewService.approveLinkRecommendationBatch(body.recommendationIds, body.actor);
      return NextResponse.json(result);
    }
    case "preview-batch": {
      if (!body.recommendationIds?.length) {
        return NextResponse.json({ error: "recommendationIds required" }, { status: 400 });
      }
      const preview = linkReviewService.previewLinkBatch(body.recommendationIds);
      return NextResponse.json(preview);
    }
    case "apply-batch": {
      if (!body.batchId) {
        return NextResponse.json({ error: "batchId required" }, { status: 400 });
      }
      const result = linkReviewService.applyApprovedLinkBatch(body.batchId, body.actor);
      return NextResponse.json(result);
    }
    case "verify-batch": {
      if (!body.batchId) {
        return NextResponse.json({ error: "batchId required" }, { status: 400 });
      }
      const result = linkReviewService.verifyAppliedLinkBatch(body.batchId);
      return NextResponse.json(result);
    }
    case "rollback-batch": {
      if (!body.batchId) {
        return NextResponse.json({ error: "batchId required" }, { status: 400 });
      }
      const result = linkReviewService.rollbackLinkBatch(body.batchId, body.actor);
      return NextResponse.json(result);
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
