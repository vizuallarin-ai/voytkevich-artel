import type { CMSContentItem } from "@/types/content-cms";
import type { ContentPriorityScore } from "@/types/content-prioritization";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { calculateContentPriorityScore } from "@/lib/content-prioritization/priority-score-calculator";
import { keywordDemandRepository } from "@/lib/content-prioritization/keyword-demand-repository";

const priorityCache = new Map<string, ContentPriorityScore>();
const needsKeywordData = new Set<string>();
const reviewed = new Set<string>();

export const cmsPriorityIntegration = {
  async attachPriorityScoreToCMSItem(
    contentItemId: string,
    score: ContentPriorityScore,
  ): Promise<void> {
    priorityCache.set(contentItemId, score);
    await contentRepository.updateContent(contentItemId, {
      seo: {
        ...(await contentRepository.getContentById(contentItemId))?.seo,
        priority: score.level,
        searchDemand: score.dataAvailability.hasSearchVolume ? "high" : "unknown",
      },
    });
  },

  async recalculateCMSContentPriority(contentItemId: string): Promise<ContentPriorityScore | null> {
    const item = await contentRepository.getContentById(contentItemId);
    if (!item) return null;
    const all = await contentRepository.listContent();
    const kw = item.seo.targetKeyword
      ? await keywordDemandRepository.findByKeyword(item.seo.targetKeyword)
      : null;
    const score = await calculateContentPriorityScore(item, { keywordData: kw, allItems: all });
    priorityCache.set(contentItemId, score);
    return score;
  },

  async recalculateAllPriorities(): Promise<number> {
    const all = await contentRepository.listContent();
    let count = 0;
    for (const item of all) {
      await this.recalculateCMSContentPriority(item.id);
      count++;
    }
    return count;
  },

  async getCMSItemsByPriority(level: ContentPriorityScore["level"]): Promise<CMSContentItem[]> {
    const all = await contentRepository.listContent();
    const result: CMSContentItem[] = [];
    for (const item of all) {
      const score = priorityCache.get(item.id) ?? (await this.recalculateCMSContentPriority(item.id));
      if (score?.level === level) result.push(item);
    }
    return result;
  },

  markItemNeedsKeywordData(contentItemId: string): void {
    needsKeywordData.add(contentItemId);
  },

  markItemPriorityReviewed(contentItemId: string): void {
    reviewed.add(contentItemId);
  },

  getCachedScore(contentItemId: string): ContentPriorityScore | undefined {
    return priorityCache.get(contentItemId);
  },

  isNeedsKeywordData(contentItemId: string): boolean {
    return needsKeywordData.has(contentItemId);
  },
};
