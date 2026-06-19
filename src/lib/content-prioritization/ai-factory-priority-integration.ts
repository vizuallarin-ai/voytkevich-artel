import type { CMSContentItem } from "@/types/content-cms";
import { getTopPriorityItems, excludeBlockedItems } from "@/lib/content-prioritization/queue-sorter";

export async function recommendTopicsForAIGeneration(items: CMSContentItem[]) {
  const safe = excludeBlockedItems(items).filter(
    (i) =>
      !i.quality.requiresSource ||
      (i.factCheck?.sourceIds?.length ?? 0) > 0,
  );
  return getTopPriorityItems(safe, 10);
}

export async function buildAIContentGenerationQueueByPriority(items: CMSContentItem[]) {
  const topics = await recommendTopicsForAIGeneration(items);
  return topics.map((item) => ({
    contentItemId: item.id,
    title: item.title,
    kind: item.kind,
    clusterId: item.clusterId,
    reason: "High priority + safe for AI generation",
  }));
}

export async function selectNextAIContentBriefs(items: CMSContentItem[], limit = 3) {
  const queue = await buildAIContentGenerationQueueByPriority(items);
  return queue.slice(0, limit);
}

export function excludeUnsafeAIItems(items: CMSContentItem[]): CMSContentItem[] {
  return items.filter((i) => {
    if (i.ethics?.fakeClaimRisk === "high") return false;
    if (i.quality.requiresFactCheck && i.factCheck?.status !== "passed") return false;
    if (i.kind === "news" && !i.factCheck?.sourceIds?.length) return false;
    return true;
  });
}
