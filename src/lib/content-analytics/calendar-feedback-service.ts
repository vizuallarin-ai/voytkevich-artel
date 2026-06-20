import type { ContentAnalyticsPeriod, ContentPerformanceSnapshot } from "@/types/content-analytics";
import { calendarRepository } from "@/lib/content-calendar/calendar-repository";
import { publicationPerformanceService } from "@/lib/content-analytics/publication-performance-service";
import { buildContentPerformanceSnapshots } from "@/lib/content-analytics/content-performance-snapshot-service";

export type CalendarPerformanceByDay = {
  dayOfWeek: number;
  label: string;
  avgPageViews: number | null;
  avgLeads: number | null;
  publicationCount: number;
};

const DAY_LABELS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export async function compareScheduleModes(period: ContentAnalyticsPeriod) {
  return publicationPerformanceService.comparePublicationModes(period);
}

export function analyzePerformanceByPublicationDay(
  snapshots: ContentPerformanceSnapshot[],
): CalendarPerformanceByDay[] {
  const buckets = new Map<number, { views: number[]; leads: number[]; count: number }>();

  for (const snapshot of snapshots) {
    const publishedAt = snapshot.publication.publishedAt;
    if (!publishedAt) continue;
    const day = new Date(publishedAt).getDay();
    if (!buckets.has(day)) buckets.set(day, { views: [], leads: [], count: 0 });
    const bucket = buckets.get(day)!;
    bucket.count += 1;
    if (snapshot.traffic.pageViews != null) bucket.views.push(snapshot.traffic.pageViews);
    if (snapshot.conversions.leads != null) bucket.leads.push(snapshot.conversions.leads);
  }

  return [...buckets.entries()].map(([dayOfWeek, data]) => ({
    dayOfWeek,
    label: DAY_LABELS[dayOfWeek] ?? String(dayOfWeek),
    avgPageViews: data.views.length
      ? data.views.reduce((a, b) => a + b, 0) / data.views.length
      : null,
    avgLeads: data.leads.length ? data.leads.reduce((a, b) => a + b, 0) / data.leads.length : null,
    publicationCount: data.count,
  }));
}

export function analyzePerformanceByPublicationHour(
  snapshots: ContentPerformanceSnapshot[],
): { hour: number; avgPageViews: number | null; avgLeads: number | null; count: number }[] {
  const buckets = new Map<number, { views: number[]; leads: number[]; count: number }>();

  for (const snapshot of snapshots) {
    const publishedAt = snapshot.publication.publishedAt;
    if (!publishedAt) continue;
    const hour = new Date(publishedAt).getHours();
    if (!buckets.has(hour)) buckets.set(hour, { views: [], leads: [], count: 0 });
    const bucket = buckets.get(hour)!;
    bucket.count += 1;
    if (snapshot.traffic.pageViews != null) bucket.views.push(snapshot.traffic.pageViews);
    if (snapshot.conversions.leads != null) bucket.leads.push(snapshot.conversions.leads);
  }

  return [...buckets.entries()]
    .map(([hour, data]) => ({
      hour,
      avgPageViews: data.views.length
        ? data.views.reduce((a, b) => a + b, 0) / data.views.length
        : null,
      avgLeads: data.leads.length ? data.leads.reduce((a, b) => a + b, 0) / data.leads.length : null,
      count: data.count,
    }))
    .sort((a, b) => a.hour - b.hour);
}

export function analyzePerformanceByContentTypeAndTime(
  snapshots: ContentPerformanceSnapshot[],
): Record<string, CalendarPerformanceByDay[]> {
  const grouped: Record<string, ContentPerformanceSnapshot[]> = {};
  for (const snapshot of snapshots) {
    if (!grouped[snapshot.contentType]) grouped[snapshot.contentType] = [];
    grouped[snapshot.contentType].push(snapshot);
  }

  const result: Record<string, CalendarPerformanceByDay[]> = {};
  for (const [type, items] of Object.entries(grouped)) {
    result[type] = analyzePerformanceByPublicationDay(items);
  }
  return result;
}

export async function analyzeCalendarCompletion(period: ContentAnalyticsPeriod) {
  return publicationPerformanceService.comparePlannedVsPublished(period);
}

export async function detectCalendarOverload(period: ContentAnalyticsPeriod): Promise<boolean> {
  const settings = calendarRepository.getSettings();
  const items = await calendarRepository.getByDateRange(period.from, period.to);
  const byDay = new Map<string, number>();

  for (const item of items) {
    const day = item.scheduledAt.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  return [...byDay.values()].some((count) => count > settings.maxSitePublicationsPerDay);
}

export async function detectCapacityUnderuse(period: ContentAnalyticsPeriod): Promise<boolean> {
  const settings = calendarRepository.getSettings();
  const items = await calendarRepository.getByDateRange(period.from, period.to);
  const days = new Set(items.map((i) => i.scheduledAt.slice(0, 10))).size;
  if (days === 0) return true;
  return items.length / days < settings.maxSitePublicationsPerDay * 0.3;
}

export function recommendPublicationWindows(
  snapshots: ContentPerformanceSnapshot[],
): { dayOfWeek?: number; hour?: number; rationale: string; confidence: "low" | "medium" | "high" }[] {
  const byDay = analyzePerformanceByPublicationDay(snapshots);
  const byHour = analyzePerformanceByPublicationHour(snapshots);

  const recommendations: {
    dayOfWeek?: number;
    hour?: number;
    rationale: string;
    confidence: "low" | "medium" | "high";
  }[] = [];

  const bestDay = byDay
    .filter((d) => d.publicationCount >= 2)
    .sort((a, b) => (b.avgLeads ?? 0) - (a.avgLeads ?? 0))[0];

  if (bestDay) {
    recommendations.push({
      dayOfWeek: bestDay.dayOfWeek,
      rationale: `На ${bestDay.label} зафиксирован более высокий avg leads (${bestDay.avgLeads?.toFixed(1) ?? "n/a"})`,
      confidence: bestDay.publicationCount >= 5 ? "medium" : "low",
    });
  }

  const bestHour = byHour.filter((h) => h.count >= 2).sort((a, b) => (b.avgLeads ?? 0) - (a.avgLeads ?? 0))[0];
  if (bestHour) {
    recommendations.push({
      hour: bestHour.hour,
      rationale: `В ${bestHour.hour}:00 выше средний lead rate (корреляция, не causation)`,
      confidence: "low",
    });
  }

  return recommendations;
}

export function recommendCalendarAdjustments(period: ContentAnalyticsPeriod): Promise<{
  overdue: Awaited<ReturnType<typeof publicationPerformanceService.findOverdueContent>>;
  bottlenecks: Awaited<ReturnType<typeof publicationPerformanceService.findPublicationBottlenecks>>;
  publicationWindows: ReturnType<typeof recommendPublicationWindows>;
}> {
  return (async () => {
    const snapshots = await buildContentPerformanceSnapshots(period);
    const [overdue, bottlenecks] = await Promise.all([
      publicationPerformanceService.findOverdueContent(period),
      publicationPerformanceService.findPublicationBottlenecks(period),
    ]);
    return {
      overdue,
      bottlenecks,
      publicationWindows: recommendPublicationWindows(snapshots),
    };
  })();
}

export const calendarFeedbackService = {
  compareScheduleModes,
  analyzePerformanceByPublicationDay,
  analyzePerformanceByPublicationHour,
  analyzePerformanceByContentTypeAndTime,
  analyzeCalendarCompletion,
  detectCalendarOverload,
  detectCapacityUnderuse,
  recommendPublicationWindows,
  recommendCalendarAdjustments,
};
