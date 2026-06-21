import { randomUUID } from "crypto";
import type { SearchIndexingJob } from "@/types/search-index";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { searchDocumentService } from "@/lib/search/search-document-service";
import { searchChunkingService } from "@/lib/search/search-chunking-service";
import { lexicalIndexService } from "@/lib/search/lexical-index-service";
import { vectorIndexService } from "@/lib/search/vector-index-service";
import { searchStore } from "@/lib/search/search-store";

function createJob(contentItemId: string, action: SearchIndexingJob["action"]): SearchIndexingJob {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    contentItemId,
    action,
    status: "pending",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function getOrCreateJob(contentItemId: string, action: SearchIndexingJob["action"]): SearchIndexingJob {
  const existing = searchStore.findIndexingJob(contentItemId, action);
  if (existing) return existing;
  const job = createJob(contentItemId, action);
  return searchStore.saveIndexingJob(job);
}

function removeContentItem(contentItemId: string): void {
  const documents = searchStore.listDocuments().filter((document) => document.contentItemId === contentItemId);
  for (const document of documents) {
    lexicalIndexService.removeDocument(document.id);
    searchStore.deleteChunkEmbeddingsByDocument(document.id);
    searchStore.deleteChunksByDocument(document.id);
    searchStore.deleteDocument(document.id);
  }
}

async function indexContentItemInternal(contentItemId: string): Promise<void> {
  const item = await contentRepository.getContentById(contentItemId);
  if (!item) {
    removeContentItem(contentItemId);
    return;
  }

  const existingItems = await contentRepository.listContent();
  const document = await searchDocumentService.buildSearchDocument(item, existingItems);
  if (!document) {
    removeContentItem(contentItemId);
    return;
  }

  removeContentItem(contentItemId);
  searchStore.saveDocument(document);
  lexicalIndexService.indexDocument(document);

  const chunks = searchChunkingService.buildSearchChunks(document);
  for (const chunk of chunks) {
    const indexedChunk = { ...chunk, status: "indexed" as const, updatedAt: new Date().toISOString() };
    searchStore.saveChunk(indexedChunk);
    lexicalIndexService.indexChunk(indexedChunk);
    vectorIndexService.indexChunkEmbedding(indexedChunk);
  }
}

async function runJob(job: SearchIndexingJob): Promise<SearchIndexingJob> {
  const processing: SearchIndexingJob = {
    ...job,
    status: "processing",
    attempts: job.attempts + 1,
    updatedAt: new Date().toISOString(),
  };
  searchStore.saveIndexingJob(processing);

  try {
    if (processing.action === "remove") {
      removeContentItem(processing.contentItemId);
    } else {
      await indexContentItemInternal(processing.contentItemId);
    }

    const completed: SearchIndexingJob = {
      ...processing,
      status: "completed",
      error: undefined,
      updatedAt: new Date().toISOString(),
    };
    searchStore.saveIndexingJob(completed);
    return completed;
  } catch (error) {
    const failed: SearchIndexingJob = {
      ...processing,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown indexing error",
      updatedAt: new Date().toISOString(),
    };
    searchStore.saveIndexingJob(failed);
    return failed;
  }
}

export async function indexContentItem(contentItemId: string): Promise<SearchIndexingJob> {
  const job = getOrCreateJob(contentItemId, "index");
  return runJob(job);
}

export async function reindexContentItem(contentItemId: string): Promise<SearchIndexingJob> {
  const job = getOrCreateJob(contentItemId, "reindex");
  return runJob(job);
}

export async function removeContentItemFromIndex(contentItemId: string): Promise<SearchIndexingJob> {
  const job = getOrCreateJob(contentItemId, "remove");
  return runJob(job);
}

export async function processSearchIndexingQueue(limit = 50): Promise<SearchIndexingJob[]> {
  const queue = searchStore.listIndexingJobs("pending").slice(0, limit);
  const results: SearchIndexingJob[] = [];
  for (const job of queue) {
    results.push(await runJob(job));
  }
  return results;
}

export const incrementalIndexingService = {
  indexContentItem,
  reindexContentItem,
  removeContentItemFromIndex,
  processSearchIndexingQueue,
};
