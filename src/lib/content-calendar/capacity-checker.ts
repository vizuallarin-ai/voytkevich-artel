import type { ContentCalendarItem } from "@/types/content-calendar";
import type { ContentCapacityRules } from "@/types/content-scheduling";
import { getCapacityRules } from "@/data/content-capacity-rules";
import type { ContentScheduleMode } from "@/types/content-calendar";

export type CapacityCheckResult = {
  passed: boolean;
  warnings: string[];
  blockers: string[];
  counts: {
    siteToday: number;
    externalToday: number;
    programmaticToday: number;
    technicalToday: number;
    editorialToday: number;
    newsToday: number;
    digestThisWeek: number;
  };
};

function sameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

function sameWeek(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  const weekA = getWeekNumber(da);
  const weekB = getWeekNumber(db);
  return da.getFullYear() === db.getFullYear() && weekA === weekB;
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function checkCapacity(
  scheduledItems: ContentCalendarItem[],
  targetDate: string,
  contentKind: string,
  publicationType: ContentCalendarItem["publicationType"],
  mode: ContentScheduleMode,
): CapacityCheckResult {
  const rules = getCapacityRules(mode);
  const warnings: string[] = [];
  const blockers: string[] = [];

  const dayItems = scheduledItems.filter(
    (i) => i.status === "scheduled" && sameDay(i.scheduledAt, targetDate),
  );

  const siteToday = dayItems.filter((i) => i.publicationType === "site-full-article").length;
  const externalToday = dayItems.filter((i) => i.publicationType === "external-teaser").length;
  const programmaticToday = dayItems.filter(
    (i) => i.contentKind === "programmatic-page" && i.publicationType === "site-full-article",
  ).length;
  const technicalToday = dayItems.filter(
    (i) => i.contentKind === "technical-article" && i.publicationType === "site-full-article",
  ).length;
  const editorialToday = dayItems.filter(
    (i) => i.contentKind === "editorial-content" && i.publicationType === "site-full-article",
  ).length;
  const newsToday = dayItems.filter(
    (i) => i.contentKind === "news" && i.publicationType === "site-full-article",
  ).length;
  const digestThisWeek = scheduledItems.filter(
    (i) => i.contentKind === "digest" && sameWeek(i.scheduledAt, targetDate),
  ).length;

  const counts = {
    siteToday,
    externalToday,
    programmaticToday,
    technicalToday,
    editorialToday,
    newsToday,
    digestThisWeek,
  };

  if (publicationType === "site-full-article" && siteToday >= rules.maxSitePublicationsPerDay) {
    blockers.push(`Лимит site publications: ${rules.maxSitePublicationsPerDay}/day`);
  }
  if (publicationType === "external-teaser" && externalToday >= rules.maxExternalPublicationsPerDay) {
    blockers.push(`Лимит external publications: ${rules.maxExternalPublicationsPerDay}/day`);
  }
  if (contentKind === "programmatic-page" && programmaticToday >= rules.maxProgrammaticPagesPerDay) {
    blockers.push(`Лимит programmatic pages: ${rules.maxProgrammaticPagesPerDay}/day`);
  }
  if (contentKind === "technical-article" && technicalToday >= rules.maxTechnicalArticlesPerDay) {
    blockers.push(`Лимит technical articles: ${rules.maxTechnicalArticlesPerDay}/day`);
  }
  if (contentKind === "editorial-content" && editorialToday >= rules.maxEditorialItemsPerDay) {
    blockers.push(`Лимит editorial: ${rules.maxEditorialItemsPerDay}/day`);
  }
  if (contentKind === "news" && newsToday >= rules.maxNewsItemsPerDay) {
    blockers.push(`Лимит news: ${rules.maxNewsItemsPerDay}/day`);
  }
  if (contentKind === "digest" && digestThisWeek >= rules.maxDigestItemsPerWeek) {
    blockers.push(`Лимит digest: ${rules.maxDigestItemsPerWeek}/week`);
  }

  if (siteToday >= rules.warnings.sitePublicationWarningThreshold) {
    warnings.push("Приближение к лимиту site publications");
  }
  if (externalToday >= rules.warnings.externalPublicationWarningThreshold) {
    warnings.push("Приближение к лимиту external publications");
  }

  if (mode === "aggressive") {
    warnings.push("Агрессивный режим — повышенный SEO-риск");
  }

  return { passed: blockers.length === 0, warnings, blockers, counts };
}

export function getCapacityRulesForMode(mode: ContentScheduleMode): ContentCapacityRules {
  return getCapacityRules(mode);
}
