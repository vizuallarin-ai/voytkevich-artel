import type { PagePerformance, StoredAnalyticsEvent } from "@/types/analytics";
import type { StoredLead } from "@/types/lead";
import type { DateRange } from "@/types/analytics";
import { isInDateRange } from "./date-range";

function pageKey(path?: string, pageType?: string, slug?: string): string {
  return path ?? `/${pageType ?? "unknown"}${slug ? `/${slug}` : ""}`;
}

export function computePagePerformance(
  events: StoredAnalyticsEvent[],
  leads: StoredLead[],
  range: DateRange,
): PagePerformance[] {
  const ev = events.filter((e) => isInDateRange(e.timestamp, range));
  const ld = leads.filter((l) => !l.isDemo && isInDateRange(l.meta.createdAt, range));

  const map = new Map<string, PagePerformance & { sessions: Set<string> }>();

  for (const e of ev) {
    if (e.name === "page_viewed" || e.page?.path) {
      const path = e.page?.path ?? e.page?.currentUrl ?? "/";
      const key = pageKey(path, e.page?.pageType, e.page?.pageSlug);
      if (!map.has(key)) {
        map.set(key, {
          pageType: e.page?.pageType ?? "unknown",
          pageSlug: e.page?.pageSlug,
          path,
          title: e.page?.pageTitle,
          views: 0,
          uniqueSessions: 0,
          ctaClicks: 0,
          formStarts: 0,
          formSubmits: 0,
          leads: 0,
          conversionRate: null,
          leadQualityAvg: 0,
          hotLeads: 0,
          warmLeads: 0,
          coldLeads: 0,
          topCTAs: [],
          sessions: new Set(),
        });
      }
      const row = map.get(key)!;
      if (e.name === "page_viewed") {
        row.views += 1;
        if (e.sessionId) row.sessions.add(e.sessionId);
      }
    }

    if (e.name === "cta_clicked" && e.page?.path) {
      const key = pageKey(e.page.path, e.page.pageType, e.page.pageSlug);
      const row = map.get(key);
      if (row) row.ctaClicks += 1;
    }
    if (e.name === "form_started" && e.page?.path) {
      const key = pageKey(e.page.path, e.page.pageType, e.page.pageSlug);
      const row = map.get(key);
      if (row) row.formStarts += 1;
    }
    if (["form_submitted", "form_success"].includes(e.name) && e.page?.path) {
      const key = pageKey(e.page.path, e.page.pageType, e.page.pageSlug);
      const row = map.get(key);
      if (row) row.formSubmits += 1;
    }
  }

  for (const lead of ld) {
    const path = lead.meta.currentUrl ?? lead.source.currentUrl ?? `/${lead.source.sourceType}`;
    let key = path;
    try {
      if (path.startsWith("http")) key = new URL(path).pathname;
    } catch {
      /* keep */
    }
    if (!map.has(key)) {
      map.set(key, {
        pageType: lead.source.sourceType,
        pageSlug: lead.source.pageSlug,
        path: key,
        views: 0,
        uniqueSessions: 0,
        ctaClicks: 0,
        formStarts: 0,
        formSubmits: 0,
        leads: 0,
        conversionRate: null,
        leadQualityAvg: 0,
        hotLeads: 0,
        warmLeads: 0,
        coldLeads: 0,
        topCTAs: [],
        sessions: new Set(),
      });
    }
    const row = map.get(key)!;
    row.leads += 1;
    const score = lead.qualification.leadScore ?? 0;
    row.leadQualityAvg = ((row.leadQualityAvg * (row.leads - 1)) + score) / row.leads;
    if (lead.qualification.readiness === "hot") row.hotLeads += 1;
    if (lead.qualification.readiness === "warm") row.warmLeads += 1;
    if (lead.qualification.readiness === "cold") row.coldLeads += 1;
    if (lead.context.blog?.clusterId) row.relatedClusterId = lead.context.blog.clusterId;
  }

  return [...map.values()]
    .map(({ sessions, ...row }) => ({
      ...row,
      uniqueSessions: sessions.size,
      conversionRate: row.views > 0 ? row.leads / row.views : null,
    }))
    .sort((a, b) => b.leads - a.leads || b.views - a.views);
}

export function pagesWithViewsNoLeads(pages: PagePerformance[], minViews = 3): PagePerformance[] {
  return pages.filter((p) => p.views >= minViews && p.leads === 0);
}
