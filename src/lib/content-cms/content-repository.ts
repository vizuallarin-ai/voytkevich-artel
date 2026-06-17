import type { CMSContentItem, ContentFilters } from "@/types/content-cms";
import { getSortedProgrammaticQueue } from "@/data/programmatic-seo-initial-queue";
import { getAllTechnicalArticles } from "@/lib/technical-content/technical-page-builder";
import { getAllEditorialContent } from "@/lib/editorial-content/editorial-page-builder";
import {
  mapEditorialToCMS,
  mapProgrammaticToCMS,
  mapTechnicalToCMS,
} from "@/lib/content-cms/content-adapters";
import { applyContentPatches, getContentPatches } from "@/lib/content-cms/content-patch-store";

export type ContentRepository = {
  listContent(filters?: ContentFilters): Promise<CMSContentItem[]>;
  getContentById(id: string): Promise<CMSContentItem | null>;
  getContentBySlug(slug: string): Promise<CMSContentItem | null>;
  createContent(input: Partial<CMSContentItem>): Promise<CMSContentItem>;
  updateContent(id: string, patch: Partial<CMSContentItem>): Promise<CMSContentItem>;
  deleteContent(id: string): Promise<void>;
  archiveContent(id: string): Promise<CMSContentItem>;
};

function loadAllItems(): CMSContentItem[] {
  const programmatic = getSortedProgrammaticQueue().map(mapProgrammaticToCMS);
  const technical = getAllTechnicalArticles().map(mapTechnicalToCMS);
  const editorial = getAllEditorialContent().map(mapEditorialToCMS);
  const merged = [...programmatic, ...technical, ...editorial];
  const patches = getContentPatches();
  return merged.map((item) => applyContentPatches(item, patches.get(item.id)));
}

function matchesFilters(item: CMSContentItem, filters?: ContentFilters): boolean {
  if (!filters) return true;
  if (filters.kind?.length && !filters.kind.includes(item.kind)) return false;
  if (filters.status?.length && !filters.status.includes(item.status)) return false;
  if (filters.qualityLevel?.length && !filters.qualityLevel.includes(item.quality.level)) return false;
  if (filters.priority?.length && item.seo.priority && !filters.priority.includes(item.seo.priority)) {
    return false;
  }
  if (filters.indexable !== undefined && item.indexing.indexable !== filters.indexable) return false;
  if (filters.sitemap !== undefined && item.indexing.sitemap !== filters.sitemap) return false;
  if (filters.requiresHumanReview && !item.quality.requiresHumanReview) return false;
  if (filters.requiresExpertReview && !item.quality.requiresExpertReview) return false;
  if (filters.requiresFactCheck && !item.quality.requiresFactCheck) return false;
  if (filters.requiresSource && !item.quality.requiresSource) return false;
  if (filters.requiresFictionNotice && !item.quality.requiresFictionNotice) return false;
  if (filters.teaserReady !== undefined && item.distribution.teaserReady !== filters.teaserReady) {
    return false;
  }
  if (filters.authorId && item.authorId !== filters.authorId) return false;
  if (filters.rubricId && item.rubricId !== filters.rubricId) return false;
  if (filters.clusterId && item.clusterId !== filters.clusterId) return false;
  if (filters.hasBlockers && item.quality.blockers.length === 0) return false;
  if (filters.hasWarnings && item.quality.warnings.length === 0) return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const hay = `${item.title} ${item.slug} ${item.seo.targetKeyword ?? ""}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

/** Dev/mock repository — aggregates data files. Production: replace with Supabase adapter. */
export const mockContentRepository: ContentRepository = {
  async listContent(filters) {
    return loadAllItems().filter((item) => matchesFilters(item, filters));
  },

  async getContentById(id) {
    return loadAllItems().find((item) => item.id === id) ?? null;
  },

  async getContentBySlug(slug) {
    return loadAllItems().find((item) => item.slug === slug) ?? null;
  },

  async createContent(input) {
    const now = new Date().toISOString().slice(0, 10);
    const item: CMSContentItem = {
      id: input.id ?? `cms:${Date.now()}`,
      kind: input.kind ?? "future-ai-draft",
      slug: input.slug ?? "new-content",
      url: input.url ?? "/blog/new-content",
      title: input.title ?? "Новый материал",
      status: input.status ?? "idea",
      source: input.source ?? { origin: "manual" },
      indexing: input.indexing ?? {
        indexable: false,
        sitemap: false,
        robots: { index: false, follow: true },
      },
      quality: input.quality ?? {
        score: 0,
        level: "poor",
        warnings: [],
        blockers: ["Новый материал без контента"],
        canPublish: false,
        shouldNoindex: true,
        requiresHumanReview: true,
      },
      workflow: input.workflow ?? {},
      seo: input.seo ?? {},
      distribution: input.distribution ?? {
        teaserReady: false,
        allowExternalTeasers: false,
        platforms: [],
      },
      related: input.related ?? {},
      createdAt: now,
      ...input,
    };
    const { saveContentPatch } = await import("@/lib/content-cms/content-patch-store");
    saveContentPatch(item.id, item);
    return item;
  },

  async updateContent(id, patch) {
    const existing = await this.getContentById(id);
    if (!existing) throw new Error(`Content not found: ${id}`);
    const updated = {
      ...existing,
      ...patch,
      workflow: { ...existing.workflow, ...patch.workflow, updatedAt: new Date().toISOString() },
    };
    const { saveContentPatch } = await import("@/lib/content-cms/content-patch-store");
    saveContentPatch(id, updated);
    return updated;
  },

  async deleteContent(id) {
    const { deleteContentPatch } = await import("@/lib/content-cms/content-patch-store");
    deleteContentPatch(id);
  },

  async archiveContent(id) {
    return this.updateContent(id, { status: "archived" });
  },
};

export const contentRepository: ContentRepository = mockContentRepository;
