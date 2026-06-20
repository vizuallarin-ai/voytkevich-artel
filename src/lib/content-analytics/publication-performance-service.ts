import type { ContentAnalyticsPeriod } from "@/types/content-analytics";
import { calendarRepository } from "@/lib/content-calendar/calendar-repository";
import { contentRepository } from "@/lib/content-cms/content-repository";
import type { CMSContentItem } from "@/types/content-cms";
import type { ContentCalendarItem } from "@/types/content-calendar";

export type PublicationComparison = {
  planned: number;
  created: number;
  approved: number;
  published: number;
  cancelled: number;
  rescheduled: number;
  rejected: number;
  completionRate: number | null;
};

function countByStatus(items: CMSContentItem[], statuses: string[]): number {
  return items.filter((i) => statuses.includes(i.status)).length;
}

function calendarInPeriod(items: ContentCalendarItem[], period: ContentAnalyticsPeriod): ContentCalendarItem[] {
  const from = new Date(period.from).getTime();
  const to = new Date(period.to).getTime();
  return items.filter((i) => {
    const t = new Date(i.scheduledAt).getTime();
    return t >= from && t <= to;
  });
}

export async function comparePlannedVsCreated(period: ContentAnalyticsPeriod): Promise<PublicationComparison> {
  const [cmsItems, calendarItems] = await Promise.all([
    contentRepository.listContent(),
    calendarRepository.list(),
  ]);

  const scheduled = calendarInPeriod(calendarItems, period);
  const planned = scheduled.length;
  const created = countByStatus(cmsItems, ["draft", "review", "approved", "scheduled", "published", "archived"]);

  return {
    planned,
    created,
    approved: countByStatus(cmsItems, ["approved", "scheduled", "published"]),
    published: countByStatus(cmsItems, ["published"]),
    cancelled: scheduled.filter((s) => s.status === "cancelled").length,
    rescheduled: scheduled.filter((s) => s.status === "rescheduled").length,
    rejected: countByStatus(cmsItems, ["rejected"]),
    completionRate: planned > 0 ? countByStatus(cmsItems, ["published"]) / planned : null,
  };
}

export async function comparePlannedVsApproved(period: ContentAnalyticsPeriod): Promise<{
  planned: number;
  approved: number;
  gap: number;
}> {
  const comparison = await comparePlannedVsCreated(period);
  return {
    planned: comparison.planned,
    approved: comparison.approved,
    gap: comparison.planned - comparison.approved,
  };
}

export async function comparePlannedVsPublished(period: ContentAnalyticsPeriod): Promise<{
  planned: number;
  published: number;
  gap: number;
}> {
  const comparison = await comparePlannedVsCreated(period);
  return {
    planned: comparison.planned,
    published: comparison.published,
    gap: comparison.planned - comparison.published,
  };
}

export async function calculatePublicationCompletionRate(
  period: ContentAnalyticsPeriod,
): Promise<number | null> {
  const comparison = await comparePlannedVsCreated(period);
  return comparison.completionRate;
}

function daysBetween(from?: string | null, to?: string | null): number | null {
  if (!from || !to) return null;
  return Math.round(
    (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24),
  );
}

export async function calculateAverageProductionTime(period: ContentAnalyticsPeriod): Promise<number | null> {
  const items = await contentRepository.listContent();
  const durations: number[] = [];

  for (const item of items) {
    if (!item.workflow.publishedAt) continue;
    if (new Date(item.workflow.publishedAt) < new Date(period.from)) continue;
    const days = daysBetween(item.createdAt, item.workflow.publishedAt);
    if (days != null && days >= 0) durations.push(days);
  }

  if (durations.length === 0) return null;
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
}

export async function calculateAverageReviewTime(period: ContentAnalyticsPeriod): Promise<number | null> {
  const items = await contentRepository.listContent();
  const durations: number[] = [];

  for (const item of items) {
    if (!item.workflow.reviewedBy || !item.workflow.updatedAt) continue;
    const days = daysBetween(item.createdAt, item.workflow.updatedAt);
    if (days != null && days >= 0) durations.push(days);
  }

  if (durations.length === 0) return null;
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
}

export async function calculateAverageScheduleDelay(period: ContentAnalyticsPeriod): Promise<number | null> {
  const calendarItems = await calendarRepository.list();
  const scheduled = calendarInPeriod(calendarItems, period);
  const delays: number[] = [];

  for (const entry of scheduled) {
    if (entry.status !== "published") continue;
    const item = await contentRepository.getContentById(entry.contentItemId);
    if (!item?.workflow.publishedAt) continue;
    const delay = daysBetween(entry.scheduledAt, item.workflow.publishedAt);
    if (delay != null) delays.push(Math.abs(delay));
  }

  if (delays.length === 0) return null;
  return Math.round(delays.reduce((a, b) => a + b, 0) / delays.length);
}

export async function findOverdueContent(period: ContentAnalyticsPeriod): Promise<ContentCalendarItem[]> {
  const calendarItems = await calendarRepository.list();
  const now = Date.now();
  return calendarInPeriod(calendarItems, period).filter((entry) => {
    if (entry.status === "cancelled" || entry.status === "published") return false;
    return new Date(entry.scheduledAt).getTime() < now;
  });
}

export async function findPublicationBottlenecks(period: ContentAnalyticsPeriod): Promise<string[]> {
  const items = await contentRepository.listContent();
  const bottlenecks: string[] = [];

  const reviewQueue = items.filter((i) => i.status === "review" && i.quality.requiresHumanReview);
  if (reviewQueue.length > 5) bottlenecks.push("review-queue-overload");

  const blocked = items.filter((i) => i.quality.blockers.length > 0 && i.status !== "published");
  if (blocked.length > 10) bottlenecks.push("quality-blockers");

  const overdue = await findOverdueContent(period);
  if (overdue.length > 0) bottlenecks.push("schedule-overdue");

  return bottlenecks;
}

export async function comparePublicationModes(period: ContentAnalyticsPeriod): Promise<
  Record<string, { planned: number; published: number; completionRate: number | null }>
> {
  const settings = calendarRepository.getSettings();
  const comparison = await comparePlannedVsCreated(period);
  return {
    [settings.mode]: {
      planned: comparison.planned,
      published: comparison.published,
      completionRate: comparison.completionRate,
    },
  };
}

export const publicationPerformanceService = {
  comparePlannedVsCreated,
  comparePlannedVsApproved,
  comparePlannedVsPublished,
  calculatePublicationCompletionRate,
  calculateAverageProductionTime,
  calculateAverageReviewTime,
  calculateAverageScheduleDelay,
  findOverdueContent,
  findPublicationBottlenecks,
  comparePublicationModes,
};
