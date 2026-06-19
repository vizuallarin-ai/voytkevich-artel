import type { CMSContentItem } from "@/types/content-cms";
import type { PriorityQueueItem } from "@/types/content-prioritization";
import { getPriorityQueueForCalendar } from "@/lib/content-prioritization/queue-sorter";
import { calendarRepository } from "@/lib/content-calendar/calendar-repository";
import { getCapacityRules } from "@/data/content-capacity-rules";

export async function recommendCalendarQueueByPriority(
  contentItems: CMSContentItem[],
  dateRange: { start: string; end: string },
): Promise<PriorityQueueItem[]> {
  void dateRange;
  return getPriorityQueueForCalendar(contentItems);
}

export async function suggestScheduleFromPriorityQueue(
  contentItems: CMSContentItem[],
  mode = calendarRepository.getSettings().mode,
): Promise<PriorityQueueItem[]> {
  const queue = await getPriorityQueueForCalendar(contentItems);
  const cap = getCapacityRules(mode);
  const p1p2 = queue.filter((q) => q.score.level === "P1" || q.score.level === "P2");
  return p1p2.slice(0, cap.maxSitePublicationsPerDay);
}

export async function applyPriorityToContentCalendar(contentItems: CMSContentItem[]) {
  const queue = await suggestScheduleFromPriorityQueue(contentItems);
  return {
    recommended: queue,
    note: "P4/P5 не рекомендуются раньше P1/P2 при готовности",
  };
}

export function explainCalendarRecommendation(item: PriorityQueueItem): string {
  if (item.score.level === "P1" || item.score.level === "P2") {
    return `Рекомендуется в календарь: ${item.score.level}${item.score.heuristic ? " (heuristic)" : ""} — ${item.score.recommendedAction}`;
  }
  return `Отложить: ${item.score.level} — сначала закрыть P1/P2`;
}
