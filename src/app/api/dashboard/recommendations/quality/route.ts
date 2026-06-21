import { NextResponse } from "next/server";
import { recommendationQualityService } from "@/lib/recommendations/recommendation-quality-service";

function defaultPeriod(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export async function GET() {
  const period = defaultPeriod();
  const quality = recommendationQualityService.calculateRecommendationQuality(period);
  const actions = recommendationQualityService.recommendQualityActions(period);
  const lowQuality = recommendationQualityService.detectLowQualityRecommendations(period);
  const highDismissal = recommendationQualityService.detectHighDismissalRecommendations(period);
  const repetitionProblems = recommendationQualityService.detectRepetitionProblems(period);
  const coverageGaps = recommendationQualityService.detectCoverageGaps(period);

  return NextResponse.json({
    period,
    quality,
    actions,
    lowQuality,
    highDismissal,
    repetitionProblems,
    coverageGaps,
  });
}
