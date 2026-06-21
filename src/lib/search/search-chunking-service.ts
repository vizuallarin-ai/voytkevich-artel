import { createHash, randomUUID } from "crypto";
import type { SearchChunk } from "@/types/search-chunk";
import type { SearchDocument } from "@/types/search-document";

const DEFAULT_MAX_CHUNK_TOKENS = 500;
const DEFAULT_MIN_CHUNK_TOKENS = 80;

type DraftChunk = Pick<SearchChunk, "title" | "text" | "headingPath" | "chunkType">;

function estimateTokenCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function calculateChunkHash(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function chunkByHeading(content: string, fallbackTitle = "Секция"): DraftChunk[] {
  const lines = content.split(/\n+/);
  const chunks: DraftChunk[] = [];
  let currentTitle = fallbackTitle;
  let currentBuffer: string[] = [];
  const headingPath: string[] = [];

  const flush = () => {
    const text = currentBuffer.join("\n").trim();
    if (!text) return;
    chunks.push({
      title: currentTitle,
      text,
      headingPath: headingPath.length > 0 ? [...headingPath] : [currentTitle],
      chunkType: headingPath.length === 0 ? "introduction" : "section",
    });
    currentBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^#{1,6}\s+/.test(trimmed)) {
      flush();
      currentTitle = trimmed.replace(/^#{1,6}\s+/, "").trim();
      headingPath.push(currentTitle);
      if (headingPath.length > 4) headingPath.shift();
      continue;
    }
    currentBuffer.push(trimmed);
  }

  flush();
  return chunks.length > 0 ? chunks : [{ title: fallbackTitle, text: content, headingPath: [fallbackTitle], chunkType: "other" }];
}

export function chunkFAQ(content: string, fallbackTitle = "FAQ"): DraftChunk[] {
  const lines = content.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const chunks: DraftChunk[] = [];
  let question = "";
  const answer: string[] = [];

  const flush = () => {
    if (!question || answer.length === 0) return;
    chunks.push({
      title: question,
      text: answer.join(" ").trim(),
      headingPath: [fallbackTitle, question],
      chunkType: "faq",
    });
  };

  for (const line of lines) {
    if (line.endsWith("?") || /^q[:\s]/i.test(line)) {
      flush();
      question = line.replace(/^q[:\s]*/i, "");
      answer.length = 0;
      continue;
    }
    if (question) answer.push(line.replace(/^a[:\s]*/i, ""));
  }

  flush();
  return chunks;
}

export function splitLargeChunks(chunks: DraftChunk[], maxTokens = DEFAULT_MAX_CHUNK_TOKENS): DraftChunk[] {
  const result: DraftChunk[] = [];

  for (const chunk of chunks) {
    if (estimateTokenCount(chunk.text) <= maxTokens) {
      result.push(chunk);
      continue;
    }

    const sentences = chunk.text.split(/(?<=[.!?])\s+/);
    let buffer: string[] = [];
    let tokenCounter = 0;
    let part = 1;

    for (const sentence of sentences) {
      const sentenceTokens = estimateTokenCount(sentence);
      if (tokenCounter + sentenceTokens > maxTokens && buffer.length > 0) {
        result.push({
          ...chunk,
          title: `${chunk.title} (${part})`,
          text: buffer.join(" ").trim(),
        });
        part += 1;
        buffer = [];
        tokenCounter = 0;
      }
      buffer.push(sentence);
      tokenCounter += sentenceTokens;
    }

    if (buffer.length > 0) {
      result.push({
        ...chunk,
        title: `${chunk.title} (${part})`,
        text: buffer.join(" ").trim(),
      });
    }
  }

  return result;
}

export function mergeSmallChunks(chunks: DraftChunk[], minTokens = DEFAULT_MIN_CHUNK_TOKENS): DraftChunk[] {
  if (chunks.length <= 1) return chunks;
  const merged: DraftChunk[] = [];
  let buffer: DraftChunk | null = null;

  const pushBuffer = () => {
    if (!buffer) return;
    merged.push(buffer);
    buffer = null;
  };

  for (const chunk of chunks) {
    if (!buffer) {
      buffer = { ...chunk };
      continue;
    }

    const combinedTokens = estimateTokenCount(buffer.text) + estimateTokenCount(chunk.text);
    if (estimateTokenCount(buffer.text) < minTokens || combinedTokens <= minTokens) {
      buffer = {
        ...buffer,
        text: `${buffer.text}\n${chunk.text}`.trim(),
        headingPath: [...new Set([...buffer.headingPath, ...chunk.headingPath])],
      };
      continue;
    }

    pushBuffer();
    buffer = { ...chunk };
  }

  pushBuffer();
  return merged;
}

export function validateSearchChunks(chunks: SearchChunk[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const chunk of chunks) {
    if (ids.has(chunk.id)) errors.push(`Duplicate chunk id: ${chunk.id}`);
    ids.add(chunk.id);
    if (!chunk.text.trim()) errors.push(`Chunk has empty text: ${chunk.id}`);
    if (chunk.tokenCount != null && chunk.tokenCount > DEFAULT_MAX_CHUNK_TOKENS * 2) {
      errors.push(`Chunk too large: ${chunk.id}`);
    }
    if (!chunk.contentHash) errors.push(`Chunk hash missing: ${chunk.id}`);
  }

  return { valid: errors.length === 0, errors };
}

export function buildSearchChunks(document: SearchDocument, maxTokens = DEFAULT_MAX_CHUNK_TOKENS): SearchChunk[] {
  const headingChunks = chunkByHeading(document.content, document.title);
  const faqChunks = chunkFAQ(document.content, "FAQ");
  const combined = mergeSmallChunks(splitLargeChunks([...headingChunks, ...faqChunks], maxTokens));
  const now = new Date().toISOString();

  return combined.map((chunk, index) => {
    const contentHash = calculateChunkHash(`${document.id}:${chunk.title}:${chunk.text}`);
    return {
      id: `search-chunk:${document.id}:${index}:${randomUUID().slice(0, 8)}`,
      documentId: document.id,
      contentItemId: document.contentItemId,
      order: index,
      text: chunk.text,
      title: chunk.title,
      headingPath: chunk.headingPath,
      canonicalUrl: document.canonicalUrl,
      chunkType: chunk.chunkType,
      entities: document.entities,
      entityNodeIds: document.entityNodeIds,
      clusterIds: document.clusterIds,
      tokenCount: estimateTokenCount(chunk.text),
      contentHash,
      embeddingVersion: undefined,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    } satisfies SearchChunk;
  });
}

export const searchChunkingService = {
  chunkByHeading,
  chunkFAQ,
  mergeSmallChunks,
  splitLargeChunks,
  validateSearchChunks,
  calculateChunkHash,
  buildSearchChunks,
};
