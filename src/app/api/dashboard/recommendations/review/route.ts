import { NextResponse } from "next/server";
import { recommendationStore } from "@/lib/recommendations/recommendation-store";
import { recommendationQualityService } from "@/lib/recommendations/recommendation-quality-service";

function defaultPeriod(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export async function GET() {
  const period = defaultPeriod();
  const feedback = recommendationStore.listFeedback(100);
  const queued = feedback.filter((f) => f.status === "queued");
  const highDismissal = recommendationQualityService.detectHighDismissalRecommendations(period);
  const lowQuality = recommendationQualityService.detectLowQualityRecommendations(period);

  return NextResponse.json({
    period,
    feedback: queued,
    totalQueued: queued.length,
    highDismissal,
    lowQuality,
    recentAudit: recommendationStore.listAudit(20),
  });
}
