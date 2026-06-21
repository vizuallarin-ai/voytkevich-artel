import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { recommendationPrivacyService } from "@/lib/recommendations/recommendation-privacy-service";
import { buildContextFromRequest } from "@/lib/recommendations/recommendation-api-helpers";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`recommendations-reset:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    sessionId?: string;
    contentItemId?: string;
    canonicalUrl?: string;
  };

  const { searchParams } = new URL(request.url);
  if (body.sessionId) searchParams.set("sessionId", body.sessionId);
  if (body.contentItemId) searchParams.set("contentItemId", body.contentItemId);
  if (body.canonicalUrl) searchParams.set("canonicalUrl", body.canonicalUrl);

  const context = await buildContextFromRequest(searchParams);
  recommendationPrivacyService.resetRecommendationProfile(context);

  return NextResponse.json({
    ok: true,
    requestId: context.requestId,
    sessionId: context.sessionId,
  });
}
