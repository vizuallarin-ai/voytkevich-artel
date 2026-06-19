import type { KeywordDemandItem } from "@/types/keyword-demand";
import { deduplicateKeywords } from "@/lib/content-prioritization/csv-importer";

const keywords = new Map<string, KeywordDemandItem>();
const importHistory: Array<{ at: string; count: number; source: string }> = [];

export const keywordDemandRepository = {
  async list(): Promise<KeywordDemandItem[]> {
    return [...keywords.values()].sort(
      (a, b) => new Date(b.importedAt ?? 0).getTime() - new Date(a.importedAt ?? 0).getTime(),
    );
  },

  async getById(id: string): Promise<KeywordDemandItem | null> {
    return keywords.get(id) ?? null;
  },

  async findByKeyword(keyword: string): Promise<KeywordDemandItem | null> {
    const normalized = keyword.trim().toLowerCase();
    return [...keywords.values()].find((k) => k.normalizedKeyword === normalized) ?? null;
  },

  async findByCluster(clusterId: string): Promise<KeywordDemandItem[]> {
    return [...keywords.values()].filter((k) => k.mappedTo.clusterId === clusterId);
  },

  async save(item: KeywordDemandItem): Promise<KeywordDemandItem> {
    keywords.set(item.id, { ...item, updatedAt: new Date().toISOString() });
    return keywords.get(item.id)!;
  },

  async importItems(items: KeywordDemandItem[]): Promise<{
    imported: number;
    duplicates: number;
  }> {
    const { unique, duplicates } = deduplicateKeywords(items);
    for (const item of unique) {
      keywords.set(item.id, item);
    }
    importHistory.unshift({
      at: new Date().toISOString(),
      count: unique.length,
      source: "csv-import",
    });
    return { imported: unique.length, duplicates: duplicates.length };
  },

  getImportHistory() {
    return importHistory;
  },

  async getMetrics() {
    const all = await this.list();
    return {
      total: all.length,
      withVolume: all.filter((k) => k.metrics.searchVolume != null).length,
      withoutVolume: all.filter((k) => k.metrics.searchVolume == null).length,
      needsMapping: all.filter((k) => k.status === "needs-mapping").length,
      mapped: all.filter((k) => k.status === "mapped").length,
    };
  },
};
