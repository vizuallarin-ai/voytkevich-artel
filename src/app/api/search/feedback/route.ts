import { NextResponse } from "next/server";
import { searchFeedbackService } from "@/lib/search/search-feedback-service";
import { searchAnalytics } from "@/lib/search/search-analytics";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`search-feedback:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = (await request.json()) as {
    requestId?: string;
    documentId?: string;
    rating?: "helpful" | "not-helpful" | "wrong" | "outdated" | "missing-project" | "no-source";
    comment?: string;
  };

  if (!body.requestId || !body.rating) {
    return NextResponse.json({ error: "requestId and rating required" }, { status: 400 });
  }

  const ratingMap: Record<string, "helpful" | "not-helpful" | "wrong-result" | "missing-result" | "other"> = {
    helpful: "helpful",
    "not-helpful": "not-helpful",
    wrong: "wrong-result",
    outdated: "wrong-result",
    "missing-project": "missing-result",
    "no-source": "wrong-result",
  };

  const feedback = searchFeedbackService.submitSearchFeedback({
    queryId: body.requestId,
    documentId: body.documentId,
    feedbackType: ratingMap[body.rating] ?? "other",
    message: body.comment?.slice(0, 500),
  });

  searchAnalytics.trackSearchFeedbackSubmitted({ requestId: body.requestId });

  return NextResponse.json({ ok: true, feedbackId: feedback.id });
}
