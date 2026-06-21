import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { recommendationFeedbackService } from "@/lib/recommendations/recommendation-feedback-service";
import type { RecommendationFeedbackRecord } from "@/lib/recommendations/recommendation-store";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`recommendations-feedback:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = (await request.json()) as {
    sessionId?: string;
    recommendationId?: string;
    contentItemId?: string;
    placement?: string;
    feedbackType?: RecommendationFeedbackRecord["feedbackType"];
    message?: string;
  };

  if (!body.recommendationId || !body.feedbackType) {
    return NextResponse.json({ error: "recommendationId and feedbackType required" }, { status: 400 });
  }

  try {
    const feedback = recommendationFeedbackService.submitRecommendationFeedback({
      sessionId: body.sessionId,
      recommendationId: body.recommendationId,
      contentItemId: body.contentItemId,
      placement: body.placement,
      feedbackType: body.feedbackType,
      message: body.message?.slice(0, 500),
    });
    return NextResponse.json({ ok: true, feedbackId: feedback.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid feedback";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
