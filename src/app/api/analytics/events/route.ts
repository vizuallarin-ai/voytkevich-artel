import { NextResponse } from "next/server";
import type { AnalyticsEvent } from "@/types/analytics";
import { buildAnalyticsEvent, legacyEventToAnalyticsName } from "@/lib/analytics/analytics-event";
import { saveAnalyticsEvent } from "@/lib/analytics/analytics-storage";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rate = checkRateLimit(`analytics:${getClientIp(request)}`, {
    limit: Number(process.env.ANALYTICS_RATE_LIMIT ?? 120),
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const raw = body as Partial<AnalyticsEvent> & { eventName?: string; payload?: Record<string, unknown> };

  const name = raw.name ?? (raw.eventName ? legacyEventToAnalyticsName(raw.eventName) : undefined);
  if (!name) {
    return NextResponse.json({ ok: false, error: "missing_name" }, { status: 422 });
  }

  const event = buildAnalyticsEvent({
    name,
    category: raw.category,
    sessionId: raw.sessionId,
    visitorId: raw.visitorId,
    leadId: raw.leadId,
    page: raw.page,
    source: raw.source,
    context: raw.context,
    action: raw.action ?? (raw.payload?.ctaLabel
      ? { ctaLabel: String(raw.payload.ctaLabel), ctaId: raw.payload.ctaId as string | undefined }
      : undefined),
    metrics: raw.metrics,
    meta: {
      userAgent: request.headers.get("user-agent") ?? undefined,
      ...raw.meta,
    },
  });

  await saveAnalyticsEvent(event);
  return NextResponse.json({ ok: true });
}
