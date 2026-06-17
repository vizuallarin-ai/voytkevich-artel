import type { CMSContentItem, ContentFilters } from "@/types/content-cms";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { computeContentDashboardMetrics } from "@/lib/content-cms/content-dashboard-metrics";
import { buildContentPreview } from "@/lib/content-cms/content-preview";
import { getUnifiedContentQualityScore } from "@/lib/content-cms/content-quality-aggregator";
import { resolveContentIndexing } from "@/lib/content-cms/content-indexing-service";
import { getContentAuditLog } from "@/lib/content-cms/content-audit-log";
import type { ContentSource } from "@/types/content-source";

const mockSources: ContentSource[] = [];

export const contentService = {
  async list(filters?: ContentFilters): Promise<CMSContentItem[]> {
    return contentRepository.listContent(filters);
  },

  async getById(id: string): Promise<CMSContentItem | null> {
    return contentRepository.getContentById(id);
  },

  async getMetrics() {
    const items = await contentRepository.listContent();
    return computeContentDashboardMetrics(items);
  },

  async getPreview(id: string) {
    const item = await contentRepository.getContentById(id);
    if (!item) return null;
    return buildContentPreview(item);
  },

  getQuality(item: CMSContentItem) {
    return getUnifiedContentQualityScore(item);
  },

  getIndexing(item: CMSContentItem) {
    return resolveContentIndexing(item);
  },

  getAuditLog(contentId: string) {
    return getContentAuditLog(contentId);
  },

  async listSources(): Promise<ContentSource[]> {
    return mockSources;
  },
};
