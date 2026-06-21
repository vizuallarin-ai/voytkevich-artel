import type { RAGContextFragment } from "@/types/ai-navigation";
import { entityRegistry } from "@/lib/knowledge-graph/entity-registry";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { hybridRetrievalService } from "@/lib/search/hybrid-retrieval-service";
import { searchStore } from "@/lib/search/search-store";
import type { SearchResult } from "@/types/search-result";

const DEFAULT_BASE_LIMIT = 24;
const DEFAULT_EXPANSION_LIMIT = 8;
const DEFAULT_TOKEN_BUDGET = 3000;
const MIN_RELEVANCE = 0.05;

function approximateTokens(value: string): number {
  return Math.ceil(value.length / 4);
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function toRelevance(score: number): number {
  if (!Number.isFinite(score)) return 0.3;
  return Math.max(MIN_RELEVANCE, Math.min(1, score));
}

function mapSearchResultToFragment(result: SearchResult): RAGContextFragment {
  const document = searchStore.getDocument(result.documentId);
  const headingPath = document?.headings?.length ? document.headings.slice(0, 4) : result.breadcrumbs;
  const text = document?.content?.trim() || result.snippet || result.description || result.title;

  return {
    sourceId: result.documentId,
    contentItemId: result.contentItemId,
    title: result.title,
    canonicalUrl: result.canonicalUrl,
    headingPath,
    text,
    contentType: result.type,
    relevance: toRelevance(result.score),
    publishedAt: document?.source?.publishedAt,
    updatedAt: document?.source?.updatedAt ?? document?.updatedAt,
  };
}

async function searchHybrid(query: string, limit: number): Promise<RAGContextFragment[]> {
  const results = hybridRetrievalService.searchHybrid(query, { limit, applyRerank: true });
  return results.map(mapSearchResultToFragment);
}

function expandQueryByEntities(query: string): string[] {
  const normalized = query.toLowerCase();
  const expansions = new Set<string>();
  const entities = entityRegistry.listEntities();

  for (const entity of entities) {
    const terms = [entity.canonicalName, ...entity.aliases]
      .map((term) => term.trim().toLowerCase())
      .filter(Boolean);
    if (!terms.some((term) => normalized.includes(term))) continue;

    expansions.add(entity.canonicalName);
    for (const relatedId of entity.relatedEntityIds.slice(0, 2)) {
      const related = entityRegistry.getEntity(relatedId);
      if (related?.canonicalName) expansions.add(related.canonicalName);
    }
  }

  return [...expansions].slice(0, 5);
}

export function mergeRAGContext(chunks: RAGContextFragment[][]): RAGContextFragment[] {
  const merged = new Map<string, RAGContextFragment>();

  for (const list of chunks) {
    for (const fragment of list) {
      const key = `${fragment.sourceId}::${fragment.contentItemId}::${fragment.canonicalUrl}::${fragment.headingPath.join(">")}`;
      const existing = merged.get(key);
      if (!existing) {
        merged.set(key, fragment);
        continue;
      }
      merged.set(key, {
        ...existing,
        relevance: Math.max(existing.relevance, fragment.relevance),
        text: existing.text.length >= fragment.text.length ? existing.text : fragment.text,
      });
    }
  }

  return [...merged.values()];
}

export function rerankRAGContext(query: string, fragments: RAGContextFragment[]): RAGContextFragment[] {
  const queryTokens = new Set(tokenize(query));

  return [...fragments]
    .map((fragment) => {
      const haystack = `${fragment.title} ${fragment.headingPath.join(" ")} ${fragment.text}`.toLowerCase();
      const overlap = [...queryTokens].reduce((count, token) => (haystack.includes(token) ? count + 1 : count), 0);
      const overlapBoost = queryTokens.size > 0 ? overlap / queryTokens.size : 0;
      const recencyBoost = fragment.updatedAt
        ? Math.min(0.1, Math.max(0, 1 - (Date.now() - new Date(fragment.updatedAt).getTime()) / (1000 * 60 * 60 * 24 * 365)))
        : 0;
      return {
        ...fragment,
        relevance: Math.max(MIN_RELEVANCE, Math.min(1, fragment.relevance * 0.7 + overlapBoost * 0.25 + recencyBoost * 0.05)),
      };
    })
    .sort((a, b) => b.relevance - a.relevance);
}

export function limitRAGContextByTokenBudget(
  fragments: RAGContextFragment[],
  tokenBudget = DEFAULT_TOKEN_BUDGET,
): RAGContextFragment[] {
  const picked: RAGContextFragment[] = [];
  let used = 0;

  for (const fragment of fragments) {
    const fragmentTokens = approximateTokens(fragment.title) + approximateTokens(fragment.text) + 40;
    if (used + fragmentTokens > tokenBudget) continue;
    picked.push(fragment);
    used += fragmentTokens;
  }

  return picked;
}

function resolveIndexableFromStore(fragment: RAGContextFragment): boolean | null {
  const document = searchStore.getDocument(fragment.sourceId);
  if (!document) return null;
  return Boolean(document.indexability.indexable && document.indexability.published);
}

function heuristicIndexable(fragment: RAGContextFragment): boolean {
  const url = fragment.canonicalUrl.toLowerCase();
  if (!url.startsWith("/") && !url.startsWith("http")) return false;
  if (url.includes("/admin") || url.includes("/private") || url.includes("preview")) return false;
  if (url.includes("draft") || url.includes("noindex")) return false;
  return true;
}

export async function validateRAGContext(fragments: RAGContextFragment[]): Promise<RAGContextFragment[]> {
  const validated: RAGContextFragment[] = [];

  for (const fragment of fragments) {
    if (!fragment.text.trim() || !fragment.title.trim()) continue;
    if (!heuristicIndexable(fragment)) continue;

    const storeDecision = resolveIndexableFromStore(fragment);
    if (storeDecision === false) continue;

    if (storeDecision === null) {
      const content = await contentRepository.getContentById(fragment.contentItemId).catch(() => null);
      if (content && !content.indexing.indexable) continue;
    }

    validated.push(fragment);
  }

  return validated;
}

export async function retrieveRAGContext(
  query: string,
  options?: { limit?: number; expansionLimit?: number; tokenBudget?: number },
): Promise<RAGContextFragment[]> {
  const limit = options?.limit ?? DEFAULT_BASE_LIMIT;
  const expansionLimit = options?.expansionLimit ?? DEFAULT_EXPANSION_LIMIT;
  const tokenBudget = options?.tokenBudget ?? DEFAULT_TOKEN_BUDGET;

  const primary = await searchHybrid(query, limit);
  const expandedQueries = expandQueryByEntities(query);
  const expandedResults = await Promise.all(expandedQueries.map((expanded) => searchHybrid(expanded, expansionLimit)));

  const merged = mergeRAGContext([primary, ...expandedResults]);
  const validated = await validateRAGContext(merged);
  const reranked = rerankRAGContext(query, validated);
  return limitRAGContextByTokenBudget(reranked, tokenBudget);
}

export const ragRetrievalService = {
  retrieveRAGContext,
  mergeRAGContext,
  rerankRAGContext,
  limitRAGContextByTokenBudget,
  validateRAGContext,
};
