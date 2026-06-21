import type { SearchChunk } from "@/types/search-chunk";
import type { SearchDocument } from "@/types/search-document";
import type { SearchIndexAdapter, SearchLexicalMatch, SearchVectorMatch } from "@/lib/search/search-index-adapter";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";
import { searchStore } from "@/lib/search/search-store";

function tokenizeRussianText(text: string): string[] {
  const normalized = queryNormalizationService.normalizeYoAndE(text.toLowerCase());
  return normalized
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function removeChunkFromLexicalIndex(chunkId: string): void {
  searchStore.removeLexicalPostingsForChunk(chunkId);
}

function upsertChunkTokens(chunk: SearchChunk): void {
  removeChunkFromLexicalIndex(chunk.id);
  const tokens = tokenizeRussianText(
    [chunk.title, chunk.text, chunk.headingPath.join(" ")].filter(Boolean).join(" "),
  );
  if (tokens.length === 0) return;

  const frequencies = new Map<string, number>();
  for (const token of tokens) {
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  }

  for (const [token, frequency] of frequencies.entries()) {
    searchStore.saveLexicalPosting(token, chunk.id, frequency);
  }
}

function upsertDocumentTokens(document: SearchDocument): void {
  const chunks = searchStore.listChunksByDocument(document.id);
  if (chunks.length > 0) return;

  const syntheticChunk: SearchChunk = {
    id: `search-chunk:doc:${document.id}`,
    documentId: document.id,
    contentItemId: document.contentItemId,
    order: 0,
    text: document.content,
    title: document.title,
    headingPath: document.headings.length > 0 ? [document.headings[0]] : [document.title],
    canonicalUrl: document.canonicalUrl,
    chunkType: "introduction",
    entities: document.entities,
    entityNodeIds: document.entityNodeIds,
    clusterIds: document.clusterIds,
    tokenCount: tokenizeRussianText(document.content).length,
    contentHash: document.source.contentHash ?? "",
    embeddingVersion: undefined,
    status: "indexed",
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };

  searchStore.saveChunk(syntheticChunk);
  upsertChunkTokens(syntheticChunk);
}

function createSnippet(chunk: SearchChunk, matchedTerms: string[]): string {
  const haystack = chunk.text;
  if (!haystack) return "";
  const lower = haystack.toLowerCase();
  let start = 0;

  for (const term of matchedTerms) {
    const index = lower.indexOf(term.toLowerCase());
    if (index >= 0) {
      start = Math.max(0, index - 60);
      break;
    }
  }

  return haystack.slice(start, start + 220).trim();
}

function scoreTokenMatch(
  token: string,
  chunkId: string,
  postingsCount: number,
  totalChunks: number,
): number {
  const posting = searchStore.getLexicalPosting(token);
  const termFrequency = posting.get(chunkId) ?? 0;
  const docFrequency = postingsCount;
  const idf = Math.log((1 + totalChunks) / (1 + docFrequency)) + 1;
  return termFrequency * idf;
}

export function searchLexical(query: string, limit = 20): SearchLexicalMatch[] {
  const queryTokens = tokenizeRussianText(queryNormalizationService.normalizeSearchQuery(query));
  if (queryTokens.length === 0) return [];

  const totalChunks = Math.max(searchStore.listChunks().length, 1);
  const aggregate = new Map<string, { score: number; terms: Set<string> }>();

  for (const token of queryTokens) {
    const posting = searchStore.getLexicalPosting(token);
    const docFrequency = posting.size;
    if (docFrequency === 0) continue;

    for (const chunkId of posting.keys()) {
      const state = aggregate.get(chunkId) ?? { score: 0, terms: new Set<string>() };
      state.score += scoreTokenMatch(token, chunkId, docFrequency, totalChunks);
      state.terms.add(token);
      aggregate.set(chunkId, state);
    }
  }

  const ranked: SearchLexicalMatch[] = [];
  for (const [chunkId, state] of aggregate.entries()) {
    const chunk = searchStore.getChunk(chunkId);
    if (!chunk) continue;
    const normalization = Math.max(1, Math.sqrt(chunk.tokenCount ?? tokenizeRussianText(chunk.text).length));
    const score = state.score / normalization;
    ranked.push({
      chunkId,
      documentId: chunk.documentId,
      score,
      matchedTerms: [...state.terms],
      snippet: createSnippet(chunk, [...state.terms]),
    });
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit);
}

export const lexicalIndexAdapter: SearchIndexAdapter = {
  indexDocument(document) {
    upsertDocumentTokens(document);
  },

  indexChunk(chunk) {
    searchStore.saveChunk(chunk);
    upsertChunkTokens(chunk);
  },

  removeDocument(documentId) {
    const chunks = searchStore.listChunksByDocument(documentId);
    for (const chunk of chunks) {
      removeChunkFromLexicalIndex(chunk.id);
    }
    searchStore.deleteChunksByDocument(documentId);
  },

  searchLexical(query, limit) {
    return searchLexical(query, limit);
  },

  searchVector(_vector: number[], _limit?: number): SearchVectorMatch[] {
    return [];
  },
};

export const lexicalIndexService = {
  tokenizeRussianText,
  indexDocument: lexicalIndexAdapter.indexDocument,
  indexChunk: lexicalIndexAdapter.indexChunk,
  removeDocument: lexicalIndexAdapter.removeDocument,
  searchLexical,
};
