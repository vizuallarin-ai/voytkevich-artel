import type { CMSContentItem } from "@/types/content-cms";
import type { IndexabilityDecision } from "@/types/seo-indexation";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { cmsItemToIndexablePage } from "@/lib/seo-indexation/indexable-page-adapters";
import {
  evaluateIndexability,
  recalculateIndexability,
  explainIndexabilityDecision,
} from "@/lib/seo-indexation/indexability-service";

const decisionCache = new Map<string, IndexabilityDecision>();

export const cmsIndexationIntegration = {
  convertCMSContentItemToIndexablePage(item: CMSContentItem) {
    return cmsItemToIndexablePage(item);
  },

  async attachIndexabilityDecision(
    contentItemId: string,
    decision: IndexabilityDecision,
  ): Promise<CMSContentItem | null> {
    decisionCache.set(contentItemId, decision);
    const item = await contentRepository.getContentById(contentItemId);
    if (!item) return null;

    return contentRepository.updateContent(contentItemId, {
      indexing: {
        ...item.indexing,
        indexable: decision.indexable,
        sitemap: decision.sitemap,
        canonicalUrl: decision.canonicalUrl,
        noindexReason: decision.indexable ? undefined : decision.message,
        robots: decision.robots,
      },
    });
  },

  async recalculateCMSIndexability(contentItemId: string): Promise<IndexabilityDecision | null> {
    const item = await contentRepository.getContentById(contentItemId);
    if (!item) return null;

    const all = await contentRepository.listContent();
    const page = cmsItemToIndexablePage(item);
    const decision = recalculateIndexability(page, { existingItems: all });
    decisionCache.set(contentItemId, decision);
    return decision;
  },

  async recalculateAllCMSIndexability(): Promise<number> {
    const all = await contentRepository.listContent();
    let count = 0;
    for (const item of all) {
      const page = cmsItemToIndexablePage(item);
      const decision = evaluateIndexability(page, { existingItems: all });
      decisionCache.set(item.id, decision);
      count++;
    }
    return count;
  },

  async getCMSItemsByIndexability(indexable: boolean): Promise<CMSContentItem[]> {
    const all = await contentRepository.listContent();
    const result: CMSContentItem[] = [];
    for (const item of all) {
      const page = cmsItemToIndexablePage(item);
      if (evaluateIndexability(page, { existingItems: all }).indexable === indexable) {
        result.push(item);
      }
    }
    return result;
  },

  getCachedDecision(contentItemId: string): IndexabilityDecision | undefined {
    return decisionCache.get(contentItemId);
  },

  explainForCMSItem(item: CMSContentItem, allItems?: CMSContentItem[]): string {
    const page = cmsItemToIndexablePage(item);
    return explainIndexabilityDecision(page, { existingItems: allItems });
  },
};
