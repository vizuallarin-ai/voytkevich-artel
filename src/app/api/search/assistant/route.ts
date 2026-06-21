import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { SEARCH_QUERY_MAX_LENGTH } from "@/data/search-synonyms";
import { navigationAssistantService } from "@/lib/ai-navigation/navigation-assistant-service";
import { promptInjectionGuard } from "@/lib/ai-navigation/prompt-injection-guard";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`assistant:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = (await request.json()) as {
    sessionId?: string;
    query?: string;
    messages?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  const query = body.query?.trim() ?? "";
  if (!query || query.length > SEARCH_QUERY_MAX_LENGTH) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  if (promptInjectionGuard.detectPromptInjectionInQuery(query)) {
    return NextResponse.json(promptInjectionGuard.buildSafeInjectionResponse());
  }

  const sessionId = body.sessionId ?? randomUUID();
  const answer = await navigationAssistantService.handleNavigationQuestion(
    sessionId,
    query,
    body.messages,
  );

  return NextResponse.json({ sessionId, ...answer });
}
