import type { SourcePerformance, StoredAnalyticsEvent } from "@/types/analytics";
import type { StoredLead } from "@/types/lead";
import type { DateRange } from "@/types/analytics";
import { isInDateRange } from "./date-range";

function sourceKey(source?: string, medium?: string, campaign?: string): string {
  return [source ?? "unknown", medium ?? "-", campaign ?? "-"].join("|");
}

export function computeSourcePerformance(
  events: StoredAnalyticsEvent[],
  leads: StoredLead[],
  range: DateRange,
): SourcePerformance[] {
  const ld = leads.filter((l) => !l.isDemo && isInDateRange(l.meta.createdAt, range));
  const ev = events.filter((e) => isInDateRange(e.timestamp, range));

  const map = new Map<string, SourcePerformance & { scores: number[]; pages: Map<string, number>; ctas: Map<string, number>; sessionSet: Set<string> }>();

  for (const lead of ld) {
    const utm = lead.analytics.utm;
    const source = utm?.source ?? inferSourceFromReferrer(lead.analytics.traffic?.referrer) ?? "direct";
    const medium = utm?.medium ?? (source === "direct" ? "none" : undefined);
    const campaign = utm?.campaign;
    const key = sourceKey(source, medium, campaign);

    if (!map.has(key)) {
      map.set(key, {
        source,
        medium,
        campaign,
        leads: 0,
        hotLeads: 0,
        averageLeadScore: 0,
        topPages: [],
        topCTAs: [],
        scores: [],
        pages: new Map(),
        ctas: new Map(),
        sessionSet: new Set(),
      });
    }
    const row = map.get(key)!;
    row.leads += 1;
    if (lead.qualification.readiness === "hot") row.hotLeads += 1;
    row.scores.push(lead.qualification.leadScore ?? 0);
    const page = lead.meta.currentUrl ?? lead.source.sourceType;
    row.pages.set(page, (row.pages.get(page) ?? 0) + 1);
    if (lead.request.selectedCTA) {
      row.ctas.set(lead.request.selectedCTA, (row.ctas.get(lead.request.selectedCTA) ?? 0) + 1);
    }
  }

  for (const e of ev) {
    if (e.name !== "page_viewed" || !e.sessionId) continue;
    const source = e.source?.utmSource ?? "unknown";
    const key = sourceKey(source, e.source?.utmMedium, e.source?.utmCampaign);
    if (!map.has(key)) {
      map.set(key, {
        source,
        medium: e.source?.utmMedium,
        campaign: e.source?.utmCampaign,
        leads: 0,
        hotLeads: 0,
        averageLeadScore: 0,
        topPages: [],
        topCTAs: [],
        scores: [],
        pages: new Map(),
        ctas: new Map(),
        sessionSet: new Set(),
      });
    }
    map.get(key)!.sessionSet.add(e.sessionId);
  }

  return [...map.values()]
    .map(({ scores, pages, ctas, sessionSet, ...row }) => ({
      ...row,
      sessions: sessionSet.size || undefined,
      averageLeadScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      conversionRate: sessionSet.size > 0 ? row.leads / sessionSet.size : null,
      topPages: topN(pages, 3),
      topCTAs: topN(ctas, 3),
    }))
    .sort((a, b) => b.leads - a.leads);
}

function topN(map: Map<string, number>, n: number): string[] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
}

function inferSourceFromReferrer(referrer?: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname;
    if (host.includes("yandex")) return "yandex";
    if (host.includes("google")) return "google";
    if (host.includes("vk.com")) return "vk";
    if (host.includes("t.me")) return "telegram";
    return "referral";
  } catch {
    return null;
  }
}

export function hasUtmData(sources: SourcePerformance[]): boolean {
  return sources.some((s) => s.source !== "direct" && s.source !== "unknown");
}
