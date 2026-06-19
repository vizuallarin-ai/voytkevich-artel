import type { CMSContentItem } from "@/types/content-cms";
import type { ContentPriorityScore, PriorityQueueItem } from "@/types/content-prioritization";
import { calculateContentPriorityScore } from "@/lib/content-prioritization/priority-score-calculator";
import { keywordDemandRepository } from "@/lib/content-prioritization/keyword-demand-repository";

const BLOCKED_STATUSES = ["rejected", "archived"];

export async function scoreContentItems(items: CMSContentItem[]): Promise<Map<string, ContentPriorityScore>> {
  const scores = new Map<string, ContentPriorityScore>();
  for (const item of items) {
    const kw = item.seo.targetKeyword
      ? await keywordDemandRepository.findByKeyword(item.seo.targetKeyword)
      : null;
    const score = await calculateContentPriorityScore(item, {
      keywordData: kw,
      allItems: items,
    });
    scores.set(item.id, score);
  }
  return scores;
}

export async function sortContentQueueByPriority(items: CMSContentItem[]): Promise<CMSContentItem[]> {
  const scores = await scoreContentItems(items);
  return [...items].sort((a, b) => {
    const sa = scores.get(a.id)?.score ?? 0;
    const sb = scores.get(b.id)?.score ?? 0;
    if (sb !== sa) return sb - sa;
    const pa = a.seo.priority ?? "P5";
    const pb = b.seo.priority ?? "P5";
    return pa.localeCompare(pb);
  });
}

export async function groupQueueByPriority(
  items: CMSContentItem[],
): Promise<Record<string, CMSContentItem[]>> {
  const scores = await scoreContentItems(items);
  const groups: Record<string, CMSContentItem[]> = {
    P1: [],
    P2: [],
    P3: [],
    P4: [],
    P5: [],
  };
  for (const item of items) {
    const level = scores.get(item.id)?.level ?? "P5";
    groups[level].push(item);
  }
  return groups;
}

export async function getTopPriorityItems(items: CMSContentItem[], limit = 10): Promise<CMSContentItem[]> {
  const sorted = await sortContentQueueByPriority(items);
  return excludeBlockedItems(sorted).slice(0, limit);
}

export function excludeBlockedItems(items: CMSContentItem[]): CMSContentItem[] {
  return items.filter(
    (i) =>
      !BLOCKED_STATUSES.includes(i.status) &&
      !i.quality.blockers.length &&
      i.status !== "ai-generated",
  );
}

export async function getPriorityQueueForCalendar(
  items: CMSContentItem[],
  _dateRange?: { start: string; end: string },
): Promise<PriorityQueueItem[]> {
  const filtered = excludeBlockedItems(items);
  const sorted = await sortContentQueueByPriority(filtered);
  const scores = await scoreContentItems(sorted);

  return sorted.map((item) => {
    const score = scores.get(item.id)!;
    return {
      contentItemId: item.id,
      title: item.title,
      kind: item.kind,
      slug: item.slug,
      status: item.status,
      score,
      readinessBlockers: score.warnings.filter((w) => w.includes("blocker")),
      scheduleSuggestion:
        score.level === "P1" || score.level === "P2"
          ? "Рекомендуется в ближайший слот календаря"
          : undefined,
    };
  });
}

export async function recommendNextContentToCreate(items: CMSContentItem[]): Promise<CMSContentItem[]> {
  const candidates = items.filter((i) =>
    ["idea", "planned", "draft", "approved"].includes(i.status),
  );
  return getTopPriorityItems(candidates, 5);
}
