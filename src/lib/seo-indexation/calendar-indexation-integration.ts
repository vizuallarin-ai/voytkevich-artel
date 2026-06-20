import type { CMSContentItem } from "@/types/content-cms";
import type { ContentCalendarItem } from "@/types/content-calendar";
import { cmsItemToIndexablePage } from "@/lib/seo-indexation/indexable-page-adapters";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";

export type CalendarIndexationCheck = {
  contentItemId: string;
  scheduledAt?: string;
  canSchedule: boolean;
  indexableAfterPublish: boolean;
  sitemapAfterPublish: boolean;
  blockers: string[];
  warnings: string[];
};

export function checkCalendarItemIndexation(item: CMSContentItem): CalendarIndexationCheck {
  const page = cmsItemToIndexablePage(item);
  const decision = evaluateIndexability(page);

  const publishedPage = { ...page, status: "published" as const, explicitNoindex: false };
  const publishedDecision = evaluateIndexability(publishedPage);

  return {
    contentItemId: item.id,
    scheduledAt: item.workflow.scheduledAt,
    canSchedule: decision.blockers.length === 0 || item.status === "approved" || item.status === "scheduled",
    indexableAfterPublish: publishedDecision.indexable,
    sitemapAfterPublish: publishedDecision.sitemap,
    blockers: decision.blockers,
    warnings: decision.warnings,
  };
}

export function validateCalendarPublicationIndexation(
  calendarItem: ContentCalendarItem,
  cmsItem: CMSContentItem,
): { ok: boolean; reason?: string } {
  const check = checkCalendarItemIndexation(cmsItem);

  if (calendarItem.status === "published" && !check.indexableAfterPublish) {
    return { ok: false, reason: "После публикации страница не будет indexable" };
  }

  if (cmsItem.status === "noindex") {
    return { ok: false, reason: "CMS status noindex" };
  }

  return { ok: true };
}

export function explainCalendarIndexation(item: CMSContentItem): string {
  const check = checkCalendarItemIndexation(item);
  return [
    `Can schedule: ${check.canSchedule ? "yes" : "no"}`,
    `Indexable after publish: ${check.indexableAfterPublish ? "yes" : "no"}`,
    `Sitemap after publish: ${check.sitemapAfterPublish ? "yes" : "no"}`,
    check.blockers.length ? `Blockers: ${check.blockers.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}
