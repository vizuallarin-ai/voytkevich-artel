import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { explicitPreferenceService } from "@/lib/recommendations/explicit-preference-service";
import { buildContextFromRequest } from "@/lib/recommendations/recommendation-api-helpers";
import type { RecommendationPreference } from "@/types/recommendation-preference";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`recommendations-preferences:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const context = await buildContextFromRequest(searchParams);
  const preferences = explicitPreferenceService.listExplicitPreferences(context);

  return NextResponse.json({
    requestId: context.requestId,
    sessionId: context.sessionId,
    preferences,
    count: preferences.length,
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`recommendations-preferences-post:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = (await request.json()) as {
    sessionId?: string;
    key?: RecommendationPreference["key"];
    value?: string;
    consentPersistent?: boolean;
  };

  if (!body.key || !body.value) {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  try {
    const preference = explicitPreferenceService.setExplicitPreference(
      {
        sessionId: body.sessionId,
        key: body.key,
        value: body.value,
      },
      { persistentPreferences: Boolean(body.consentPersistent) },
    );
    return NextResponse.json({ ok: true, preference });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid preference";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
