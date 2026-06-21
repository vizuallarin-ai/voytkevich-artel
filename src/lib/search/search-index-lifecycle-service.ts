import { randomUUID } from "crypto";
import type { SearchChunk } from "@/types/search-chunk";
import type { SearchDocument } from "@/types/search-document";
import type { SearchIndexVersion } from "@/types/search-index";
import { EMBEDDING_MODEL_LOCAL } from "@/data/search-synonyms";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";
import { searchDocumentService } from "@/lib/search/search-document-service";
import { searchChunkingService } from "@/lib/search/search-chunking-service";
import { lexicalIndexService } from "@/lib/search/lexical-index-service";
import { vectorIndexService } from "@/lib/search/vector-index-service";
import { searchStore } from "@/lib/search/search-store";

type SearchIndexSnapshot = {
  documents: SearchDocument[];
  chunks: SearchChunk[];
};

const snapshots = new Map<string, SearchIndexSnapshot>();

function createVersionLabel(): string {
  return `search-${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

function persistVersion(version: SearchIndexVersion): SearchIndexVersion {
  searchStore.saveIndexVersion(version);
  return version;
}

function clearIndexedContent(): void {
  const existingDocuments = searchStore.listDocuments();
  searchStore.clearLexicalIndex();
  for (const document of existingDocuments) {
    searchStore.deleteChunkEmbeddingsByDocument(document.id);
    searchStore.deleteChunksByDocument(document.id);
    searchStore.deleteDocument(document.id);
  }
}

function activateSnapshot(snapshot: SearchIndexSnapshot): void {
  for (const document of snapshot.documents) {
    searchStore.saveDocument({
      ...document,
      status: "indexed",
      updatedAt: new Date().toISOString(),
      source: {
        ...document.source,
        indexedAt: new Date().toISOString(),
      },
    });
    lexicalIndexService.indexDocument(document);
  }

  for (const chunk of snapshot.chunks) {
    const indexedChunk: SearchChunk = {
      ...chunk,
      status: "indexed",
      embeddingVersion: EMBEDDING_MODEL_LOCAL,
      updatedAt: new Date().toISOString(),
    };
    searchStore.saveChunk(indexedChunk);
    lexicalIndexService.indexChunk(indexedChunk);
    vectorIndexService.indexChunkEmbedding(indexedChunk);
  }
}

export async function createSearchIndexVersion(): Promise<SearchIndexVersion> {
  const now = new Date().toISOString();
  const version: SearchIndexVersion = {
    id: randomUUID(),
    version: createVersionLabel(),
    status: "building",
    documentCount: 0,
    chunkCount: 0,
    embeddingModel: EMBEDDING_MODEL_LOCAL,
    createdAt: now,
  };
  return persistVersion(version);
}

export async function buildSearchIndex(versionId?: string): Promise<SearchIndexVersion> {
  const baseVersion = versionId
    ? searchStore.getIndexVersion(versionId)
    : await createSearchIndexVersion();

  if (!baseVersion) {
    throw new Error(`Search index version not found: ${versionId}`);
  }

  const workingVersion: SearchIndexVersion = { ...baseVersion, status: "building" };
  persistVersion(workingVersion);

  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const documents = (
    await Promise.all(items.map((item) => searchDocumentService.buildSearchDocument(item, items)))
  ).filter((document): document is SearchDocument => Boolean(document));

  const chunks = documents.flatMap((document) => searchChunkingService.buildSearchChunks(document));
  snapshots.set(workingVersion.id, { documents, chunks });

  const updatedVersion: SearchIndexVersion = {
    ...workingVersion,
    status: "validating",
    documentCount: documents.length,
    chunkCount: chunks.length,
  };
  return persistVersion(updatedVersion);
}

export async function validateSearchIndex(versionId: string): Promise<{ valid: boolean; errors: string[] }> {
  const version = searchStore.getIndexVersion(versionId);
  if (!version) {
    return { valid: false, errors: [`Search index version not found: ${versionId}`] };
  }

  const snapshot = snapshots.get(versionId);
  if (!snapshot) {
    return { valid: false, errors: [`Search index snapshot not found: ${versionId}`] };
  }

  const errors: string[] = [];
  if (snapshot.documents.length === 0) errors.push("No documents built");
  if (snapshot.chunks.length === 0) errors.push("No chunks built");

  const documentIds = new Set(snapshot.documents.map((document) => document.id));
  for (const chunk of snapshot.chunks) {
    if (!documentIds.has(chunk.documentId)) {
      errors.push(`Chunk references unknown document: ${chunk.id}`);
    }
  }

  const chunkValidation = searchChunkingService.validateSearchChunks(snapshot.chunks);
  errors.push(...chunkValidation.errors);

  const status: SearchIndexVersion["status"] = errors.length === 0 ? "ready" : "failed";
  persistVersion({ ...version, status });
  return { valid: errors.length === 0, errors };
}

export async function activateSearchIndex(versionId: string): Promise<SearchIndexVersion> {
  const version = searchStore.getIndexVersion(versionId);
  if (!version) {
    throw new Error(`Search index version not found: ${versionId}`);
  }
  if (version.status !== "ready") {
    throw new Error(`Search index version must be ready before activation: ${versionId}`);
  }

  const snapshot = snapshots.get(versionId);
  if (!snapshot) {
    throw new Error(`Search index snapshot not found: ${versionId}`);
  }

  const current = searchStore.getActiveIndexVersion();
  if (current) {
    persistVersion({ ...current, status: "archived", archivedAt: new Date().toISOString() });
  }

  clearIndexedContent();
  activateSnapshot(snapshot);

  const activeVersion: SearchIndexVersion = {
    ...version,
    status: "active",
    activatedAt: new Date().toISOString(),
  };
  persistVersion(activeVersion);
  searchStore.setActiveIndexVersion(activeVersion.id);
  return activeVersion;
}

export async function rollbackSearchIndex(targetVersionId?: string): Promise<SearchIndexVersion | null> {
  const versions = searchStore.listIndexVersions();
  const target = targetVersionId
    ? versions.find((version) => version.id === targetVersionId)
    : versions.find((version) => version.status === "ready" || version.status === "active");

  if (!target) return null;
  if (target.status === "active") return target;
  if (target.status !== "ready") return null;
  return activateSearchIndex(target.id);
}

export function getActiveSearchIndex(): SearchIndexVersion | null {
  return searchStore.getActiveIndexVersion();
}

export const searchIndexLifecycleService = {
  createSearchIndexVersion,
  buildSearchIndex,
  validateSearchIndex,
  activateSearchIndex,
  rollbackSearchIndex,
  getActiveSearchIndex,
};
