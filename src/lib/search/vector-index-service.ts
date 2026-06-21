import { createHash } from "crypto";
import { EMBEDDING_DIMENSION, EMBEDDING_MODEL_LOCAL } from "@/data/search-synonyms";
import type { ChunkEmbedding, SearchChunk } from "@/types/search-chunk";
import type { SearchDocument } from "@/types/search-document";
import type { SearchIndexAdapter, SearchLexicalMatch, SearchVectorMatch } from "@/lib/search/search-index-adapter";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";
import { searchStore } from "@/lib/search/search-store";

function tokenizeForEmbedding(text: string): string[] {
  return queryNormalizationService
    .normalizeSearchQuery(text)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function hashTokenToIndex(token: string, dimension: number): number {
  const digest = createHash("sha256").update(token).digest();
  const value = digest.readUInt32BE(0);
  return value % dimension;
}

function hashTokenSign(token: string): number {
  const digest = createHash("sha256").update(`${token}:sign`).digest();
  return digest[0] % 2 === 0 ? 1 : -1;
}

function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (norm === 0) return vector;
  return vector.map((value) => value / norm);
}

export function createSearchEmbedding(text: string, dimension = EMBEDDING_DIMENSION): number[] {
  const vector = Array.from({ length: dimension }, () => 0);
  const tokens = tokenizeForEmbedding(text);
  for (const token of tokens) {
    const index = hashTokenToIndex(token, dimension);
    vector[index] += hashTokenSign(token);
  }
  return normalizeVector(vector);
}

function cosineSimilarity(left: number[], right: number[]): number {
  const size = Math.min(left.length, right.length);
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < size; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }

  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

export function indexChunkEmbedding(chunk: SearchChunk): ChunkEmbedding {
  const vector = createSearchEmbedding([chunk.title, chunk.text, chunk.headingPath.join(" ")].join(" "));
  const embedding: ChunkEmbedding = {
    chunkId: chunk.id,
    version: EMBEDDING_MODEL_LOCAL,
    vector,
    contentHash: chunk.contentHash,
    createdAt: new Date().toISOString(),
  };
  searchStore.saveChunkEmbedding(embedding);
  return embedding;
}

export function searchSemantic(query: string, limit = 20): SearchVectorMatch[] {
  const queryEmbedding = createSearchEmbedding(query);
  const candidates = searchStore.listChunkEmbeddings(EMBEDDING_MODEL_LOCAL);

  const ranked = candidates
    .map((embedding) => {
      const similarity = cosineSimilarity(queryEmbedding, embedding.vector);
      const chunk = searchStore.getChunk(embedding.chunkId);
      if (!chunk) return null;
      return {
        chunkId: embedding.chunkId,
        documentId: chunk.documentId,
        score: similarity,
      } satisfies SearchVectorMatch;
    })
    .filter((entry): entry is SearchVectorMatch => Boolean(entry))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
}

export const vectorIndexAdapter: SearchIndexAdapter = {
  indexDocument(_document: SearchDocument) {
    // Embeddings are generated at chunk granularity.
  },

  indexChunk(chunk: SearchChunk) {
    searchStore.saveChunk(chunk);
    indexChunkEmbedding(chunk);
  },

  removeDocument(documentId: string) {
    searchStore.deleteChunkEmbeddingsByDocument(documentId);
  },

  searchLexical(_query: string, _limit?: number): SearchLexicalMatch[] {
    return [];
  },

  searchVector(vector: number[], limit = 20): SearchVectorMatch[] {
    const candidates = searchStore.listChunkEmbeddings(EMBEDDING_MODEL_LOCAL);
    return candidates
      .map((embedding) => {
        const chunk = searchStore.getChunk(embedding.chunkId);
        if (!chunk) return null;
        return {
          chunkId: embedding.chunkId,
          documentId: chunk.documentId,
          score: cosineSimilarity(vector, embedding.vector),
        } satisfies SearchVectorMatch;
      })
      .filter((entry): entry is SearchVectorMatch => Boolean(entry))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },
};

export const vectorIndexService = {
  createSearchEmbedding,
  indexChunkEmbedding,
  searchSemantic,
  cosineSimilarity,
  embeddingVersion: EMBEDDING_MODEL_LOCAL,
};
