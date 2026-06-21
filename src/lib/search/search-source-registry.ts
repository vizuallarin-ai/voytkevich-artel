import type { CMSContentKind } from "@/types/content-cms";
import type { SearchDocumentType } from "@/types/search-document";

export type SearchChunkingHint = {
  strategy: "heading" | "faq" | "paragraph";
  targetChunkTokens: number;
  maxChunkTokens: number;
};

export type SearchSourceDefinition = {
  sourceId: string;
  cmsKind: CMSContentKind;
  documentType: SearchDocumentType;
  excludedStatuses: string[];
  excludedUrlPatterns: RegExp[];
  chunkingHint: SearchChunkingHint;
};

const sourceRegistry = new Map<string, SearchSourceDefinition>();

function createDefaultSources(): SearchSourceDefinition[] {
  return [
    {
      sourceId: "cms:programmatic",
      cmsKind: "programmatic-page",
      documentType: "programmatic",
      excludedStatuses: ["draft", "review", "noindex", "archived", "rejected"],
      excludedUrlPatterns: [/\/preview\//i, /\?preview=/i],
      chunkingHint: { strategy: "heading", targetChunkTokens: 220, maxChunkTokens: 500 },
    },
    {
      sourceId: "cms:technical",
      cmsKind: "technical-article",
      documentType: "technical",
      excludedStatuses: ["draft", "review", "noindex", "archived", "rejected"],
      excludedUrlPatterns: [/\/draft\//i],
      chunkingHint: { strategy: "heading", targetChunkTokens: 240, maxChunkTokens: 500 },
    },
    {
      sourceId: "cms:editorial",
      cmsKind: "editorial-content",
      documentType: "editorial",
      excludedStatuses: ["draft", "review", "noindex", "archived", "rejected"],
      excludedUrlPatterns: [/\/internal\//i],
      chunkingHint: { strategy: "paragraph", targetChunkTokens: 180, maxChunkTokens: 420 },
    },
    {
      sourceId: "cms:news",
      cmsKind: "news",
      documentType: "editorial",
      excludedStatuses: ["draft", "review", "noindex", "archived", "rejected"],
      excludedUrlPatterns: [/\/internal\//i],
      chunkingHint: { strategy: "paragraph", targetChunkTokens: 160, maxChunkTokens: 380 },
    },
    {
      sourceId: "cms:digest",
      cmsKind: "digest",
      documentType: "editorial",
      excludedStatuses: ["draft", "review", "noindex", "archived", "rejected"],
      excludedUrlPatterns: [/\/internal\//i],
      chunkingHint: { strategy: "paragraph", targetChunkTokens: 200, maxChunkTokens: 450 },
    },
    {
      sourceId: "cms:landing",
      cmsKind: "landing-page",
      documentType: "service",
      excludedStatuses: ["draft", "review", "noindex", "archived", "rejected"],
      excludedUrlPatterns: [/\/test\//i, /\/sandbox\//i],
      chunkingHint: { strategy: "heading", targetChunkTokens: 200, maxChunkTokens: 450 },
    },
    {
      sourceId: "cms:lead-magnet",
      cmsKind: "lead-magnet",
      documentType: "knowledge",
      excludedStatuses: ["draft", "review", "noindex", "archived", "rejected"],
      excludedUrlPatterns: [/\/private\//i],
      chunkingHint: { strategy: "faq", targetChunkTokens: 180, maxChunkTokens: 360 },
    },
    {
      sourceId: "cms:future",
      cmsKind: "future-ai-draft",
      documentType: "other",
      excludedStatuses: ["draft", "review", "noindex", "archived", "rejected", "planned", "idea"],
      excludedUrlPatterns: [/./],
      chunkingHint: { strategy: "paragraph", targetChunkTokens: 180, maxChunkTokens: 360 },
    },
  ];
}

function ensureSeeded(): void {
  if (sourceRegistry.size > 0) return;
  for (const source of createDefaultSources()) {
    sourceRegistry.set(source.sourceId, source);
  }
}

function isExcludedByUrl(url: string, definition: SearchSourceDefinition): boolean {
  return definition.excludedUrlPatterns.some((pattern) => pattern.test(url));
}

export const searchSourceRegistry = {
  registerSource(definition: SearchSourceDefinition): SearchSourceDefinition {
    sourceRegistry.set(definition.sourceId, definition);
    return definition;
  },

  getSource(sourceId: string): SearchSourceDefinition | undefined {
    ensureSeeded();
    return sourceRegistry.get(sourceId);
  },

  getSourceByCMSKind(kind: CMSContentKind): SearchSourceDefinition | undefined {
    ensureSeeded();
    return [...sourceRegistry.values()].find((source) => source.cmsKind === kind);
  },

  listSources(): SearchSourceDefinition[] {
    ensureSeeded();
    return [...sourceRegistry.values()];
  },

  shouldExclude(kind: CMSContentKind, status: string, url: string): boolean {
    const source = this.getSourceByCMSKind(kind);
    if (!source) return true;
    if (source.excludedStatuses.includes(status)) return true;
    return isExcludedByUrl(url, source);
  },
};
