import type { CTAPerformance, StoredAnalyticsEvent } from "@/types/analytics";
import type { StoredLead } from "@/types/lead";
import type { DateRange } from "@/types/analytics";
import { isInDateRange } from "./date-range";

export function computeCTAPerformance(
  events: StoredAnalyticsEvent[],
  leads: StoredLead[],
  range: DateRange,
): CTAPerformance[] {
  const ev = events.filter((e) => isInDateRange(e.timestamp, range));
  const ld = leads.filter((l) => !l.isDemo && isInDateRange(l.meta.createdAt, range));

  const map = new Map<string, CTAPerformance & { scores: number[] }>();

  for (const e of ev) {
    if (e.name !== "cta_clicked" && !e.name.includes("cta_clicked")) continue;
    const label = e.action?.ctaLabel ?? e.action?.ctaId ?? "unknown";
    const key = `${label}|${e.page?.pageType ?? ""}|${e.page?.pageSlug ?? ""}`;
    if (!map.has(key)) {
      map.set(key, {
        ctaId: e.action?.ctaId,
        ctaLabel: label,
        ctaPosition: e.action?.ctaPosition,
        pageType: e.page?.pageType,
        pageSlug: e.page?.pageSlug,
        clicks: 0,
        formStarts: 0,
        leads: 0,
        clickToLeadRate: null,
        averageLeadScore: 0,
        hotLeads: 0,
        scores: [],
      });
    }
    map.get(key)!.clicks += 1;
  }

  for (const lead of ld) {
    const label = lead.request.selectedCTA ?? lead.source.ctaLabel;
    if (!label) continue;
    const key = `${label}|${lead.source.sourceType}|${lead.source.pageSlug ?? ""}`;
    if (!map.has(key)) {
      map.set(key, {
        ctaLabel: label,
        pageType: lead.source.sourceType,
        pageSlug: lead.source.pageSlug,
        clicks: 0,
        formStarts: 0,
        leads: 0,
        clickToLeadRate: null,
        averageLeadScore: 0,
        hotLeads: 0,
        scores: [],
      });
    }
    const row = map.get(key)!;
    row.leads += 1;
    row.scores.push(lead.qualification.leadScore ?? 0);
    if (lead.qualification.readiness === "hot") row.hotLeads += 1;
  }

  return [...map.values()]
    .map(({ scores, ...row }) => ({
      ...row,
      averageLeadScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      clickToLeadRate: row.clicks > 0 ? row.leads / row.clicks : null,
    }))
    .sort((a, b) => b.leads - a.leads || b.clicks - a.clicks);
}
