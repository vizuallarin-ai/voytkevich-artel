import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { recommendationOrchestratorService } from "@/lib/recommendations/recommendation-orchestrator-service";
import { buildContextFromRequest } from "@/lib/recommendations/recommendation-api-helpers";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`recommendations-next-action:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const context = await buildContextFromRequest(searchParams);
  const actions = recommendationOrchestratorService.getNextBestAction(context);

  return NextResponse.json({
    requestId: context.requestId,
    sessionId: context.sessionId,
    actions,
    count: actions.length,
  });
}
