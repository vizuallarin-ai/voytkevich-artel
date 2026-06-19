import type { CMSContentItem } from "@/types/content-cms";
import type { RecommendedDate } from "@/types/content-scheduling";
import type { ContentScheduleMode } from "@/types/content-calendar";
import { getAvailableSlots } from "@/lib/content-calendar/publication-slot-builder";
import { calendarRepository } from "@/lib/content-calendar/calendar-repository";

const PRIORITY_SCORE: Record<string, number> = {
  P1: 100,
  P2: 80,
  P3: 60,
  P4: 40,
  P5: 20,
};

export function recommendPublicationDates(
  contentItem: CMSContentItem,
  options: { mode?: ContentScheduleMode; count?: number; startDate?: string } = {},
): RecommendedDate[] {
  const mode = options.mode ?? "cautious";
  const count = options.count ?? 5;
  const start = options.startDate ?? new Date().toISOString().slice(0, 10);
  const end = new Date(start);
  end.setDate(end.getDate() + 14);
  const slots = getAvailableSlots(start, end.toISOString().slice(0, 10), mode, {
    publicationType: "site-full-article",
  });

  const priority = contentItem.seo.priority ?? "P3";
  const baseScore = PRIORITY_SCORE[priority] ?? 50;

  return slots.slice(0, count).map((slot) => {
    const reasons: string[] = [];
    let score = baseScore;

    if (contentItem.kind === "programmatic-page") {
      reasons.push("Commercial/programmatic — приоритет слота");
      score += 10;
    }
    if (contentItem.kind === "technical-article") {
      reasons.push("Technical article разбавляет programmatic");
      score += 5;
    }
    if (contentItem.kind === "digest") {
      reasons.push("Digest лучше в конце недели");
      const day = new Date(slot.date).getDay();
      if (day === 5) score += 15;
    }
    if (contentItem.kind === "news") {
      reasons.push("News — быстрее, при наличии source");
      score += 20;
    }

    return {
      date: slot.date,
      time: slot.time,
      score,
      reasons,
    };
  });
}

export function recommendTeaserDates(
  contentItem: CMSContentItem,
  platforms: string[],
  fullArticleAt: string,
  delayHours = 2,
): RecommendedDate[] {
  const base = new Date(fullArticleAt);
  return platforms.map((platformId, i) => {
    const at = new Date(base);
    at.setHours(at.getHours() + delayHours + i);
    return {
      date: at.toISOString().slice(0, 10),
      time: `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`,
      score: 70 - i * 5,
      reasons: [`Teaser ${platformId} через ${delayHours + i}ч после full article`],
    };
  });
}

export async function recommendNextAvailableSlot(
  contentItem: CMSContentItem,
  mode: ContentScheduleMode = "cautious",
): Promise<RecommendedDate | null> {
  const dates = recommendPublicationDates(contentItem, { mode, count: 1 });
  return dates[0] ?? null;
}

export function explainRecommendedDate(contentItem: CMSContentItem, date: RecommendedDate): string {
  return [
    `Рекомендация для «${contentItem.title}»`,
    `Дата: ${date.date} ${date.time}`,
    `Score: ${date.score}`,
    ...date.reasons,
  ].join(". ");
}

export async function recommendBalancedWeek(
  contentItems: CMSContentItem[],
  startDate: string,
  mode: ContentScheduleMode,
): Promise<Array<{ contentItemId: string; recommended: RecommendedDate }>> {
  const scheduled = await calendarRepository.list();
  const kindsThisWeek = new Map<string, number>();

  return contentItems.map((item) => {
    const kindCount = kindsThisWeek.get(item.kind) ?? 0;
    const dates = recommendPublicationDates(item, { mode, count: 3, startDate });
    const pick =
      item.kind === "programmatic-page" && kindCount >= 2
        ? dates.find((d) => d.score < 80) ?? dates[0]
        : dates[0];

    kindsThisWeek.set(item.kind, kindCount + 1);
    void scheduled;
    return { contentItemId: item.id, recommended: pick! };
  });
}
