import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { recommendationOrchestratorService } from "@/lib/recommendations/recommendation-orchestrator-service";
import { buildContextFromRequest } from "@/lib/recommendations/recommendation-api-helpers";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`recommendations:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const placement = searchParams.get("placement");
  if (!placement) {
    return NextResponse.json({ error: "placement required" }, { status: 400 });
  }

  const context = await buildContextFromRequest(searchParams);
  const items = await recommendationOrchestratorService.getRecommendations(context, placement);

  return NextResponse.json({
    requestId: context.requestId,
    sessionId: context.sessionId,
    placement,
    mode: context.mode,
    items,
    count: items.length,
  });
}
