import { randomUUID } from "crypto";
import type { NavigationMemory } from "@/types/ai-navigation";
import type { SearchChunk, ChunkEmbedding } from "@/types/search-chunk";
import type { SearchDocument } from "@/types/search-document";
import type { SearchIndexVersion, SearchIndexingJob, ZeroResultRecord } from "@/types/search-index";

export type SearchQueryLogEntry = {
  id: string;
  sessionId?: string;
  requestId?: string;
  rawQuery: string;
  normalizedQuery: string;
  intent?: string;
  mode?: string;
  resultCount: number;
  latencyMs?: number;
  correctionApplied?: string;
  filters?: Record<string, string | string[] | number | boolean | null | undefined>;
  createdAt: string;
};

export type SearchFeedbackRecord = {
  id: string;
  queryId?: string;
  documentId?: string;
  chunkId?: string;
  feedbackType: "helpful" | "not-helpful" | "wrong-result" | "missing-result" | "other";
  message?: string;
  status: "queued" | "reviewed" | "dismissed";
  createdAt: string;
  updatedAt?: string;
};

export type SearchAuditEntry = {
  id: string;
  action: string;
  entityType:
    | "document"
    | "chunk"
    | "embedding"
    | "index-version"
    | "index-job"
    | "query"
    | "feedback"
    | "zero-result"
    | "session-memory"
    | "journey"
    | "attribution"
    | "analytics";
  entityId: string;
  details?: string;
  actorId?: string;
  createdAt: string;
};

export type SearchJourneyRecord = {
  id: string;
  sessionId: string;
  queryIds: string[];
  documentIds: string[];
  startedAt: string;
  lastActivityAt: string;
  convertedLeadId?: string;
};

export type SearchAttributionRecord = {
  id: string;
  leadId: string;
  journeyId: string;
  confidence: "low" | "medium" | "high";
  attributedAt: string;
};

export type SearchAnalyticsEvent = {
  id: string;
  eventName: string;
  payload: Record<string, unknown>;
  occurredAt: string;
};

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE = /(?:\+?7|8)\s*\(?\d{3}\)?[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g;

const documents = new Map<string, SearchDocument>();
const chunks = new Map<string, SearchChunk>();
const embeddings = new Map<string, ChunkEmbedding>();
const indexVersions = new Map<string, SearchIndexVersion>();
const indexingJobs = new Map<string, SearchIndexingJob>();
const queryLogs: SearchQueryLogEntry[] = [];
const feedbackQueue = new Map<string, SearchFeedbackRecord>();
const zeroResultRecords = new Map<string, ZeroResultRecord>();
const auditLog: SearchAuditEntry[] = [];
const sessionMemories = new Map<string, NavigationMemory>();
const lexicalTokenPostings = new Map<string, Map<string, number>>();
const journeys = new Map<string, SearchJourneyRecord>();
const attributions = new Map<string, SearchAttributionRecord>();
const analyticsEvents: SearchAnalyticsEvent[] = [];
let activeIndexVersionId: string | null = null;

function sanitizeFreeText(value: string): string {
  return value.replace(EMAIL_RE, "[redacted-email]").replace(PHONE_RE, "[redacted-phone]").trim();
}

function pushAuditEntry(entry: Omit<SearchAuditEntry, "id" | "createdAt">): SearchAuditEntry {
  const full: SearchAuditEntry = {
    ...entry,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  auditLog.unshift(full);
  if (auditLog.length > 5000) {
    auditLog.pop();
  }
  return full;
}

function embeddingKey(chunkId: string, version: string): string {
  return `${chunkId}:${version}`;
}

function sanitizeQueryLog(
  entry: Omit<SearchQueryLogEntry, "id" | "createdAt" | "rawQuery"> & { rawQuery: string },
): SearchQueryLogEntry {
  return {
    ...entry,
    id: randomUUID(),
    rawQuery: sanitizeFreeText(entry.rawQuery),
    createdAt: new Date().toISOString(),
  };
}

export const searchStore = {
  saveDocument(document: SearchDocument): SearchDocument {
    documents.set(document.id, document);
    pushAuditEntry({ action: "save", entityType: "document", entityId: document.id });
    return document;
  },

  getDocument(id: string): SearchDocument | undefined {
    return documents.get(id);
  },

  listDocuments(): SearchDocument[] {
    return [...documents.values()];
  },

  deleteDocument(id: string): void {
    documents.delete(id);
    pushAuditEntry({ action: "delete", entityType: "document", entityId: id });
  },

  saveChunk(chunk: SearchChunk): SearchChunk {
    chunks.set(chunk.id, chunk);
    pushAuditEntry({ action: "save", entityType: "chunk", entityId: chunk.id });
    return chunk;
  },

  getChunk(id: string): SearchChunk | undefined {
    return chunks.get(id);
  },

  listChunks(): SearchChunk[] {
    return [...chunks.values()];
  },

  listChunksByDocument(documentId: string): SearchChunk[] {
    return [...chunks.values()].filter((chunk) => chunk.documentId === documentId);
  },

  deleteChunk(id: string): void {
    chunks.delete(id);
    pushAuditEntry({ action: "delete", entityType: "chunk", entityId: id });
  },

  deleteChunksByDocument(documentId: string): void {
    for (const chunk of chunks.values()) {
      if (chunk.documentId !== documentId) continue;
      chunks.delete(chunk.id);
      for (const [token, postings] of lexicalTokenPostings.entries()) {
        postings.delete(chunk.id);
        if (postings.size === 0) lexicalTokenPostings.delete(token);
      }
      for (const [key, embedding] of embeddings.entries()) {
        if (embedding.chunkId === chunk.id) embeddings.delete(key);
      }
    }
    pushAuditEntry({ action: "delete-by-document", entityType: "chunk", entityId: documentId });
  },

  saveChunkEmbedding(embedding: ChunkEmbedding): ChunkEmbedding {
    embeddings.set(embeddingKey(embedding.chunkId, embedding.version), embedding);
    pushAuditEntry({ action: "save", entityType: "embedding", entityId: embedding.chunkId });
    return embedding;
  },

  getChunkEmbedding(chunkId: string, version: string): ChunkEmbedding | undefined {
    return embeddings.get(embeddingKey(chunkId, version));
  },

  listChunkEmbeddings(version?: string): ChunkEmbedding[] {
    const all = [...embeddings.values()];
    return version ? all.filter((entry) => entry.version === version) : all;
  },

  deleteChunkEmbeddingsByDocument(documentId: string): void {
    const chunkIds = new Set(this.listChunksByDocument(documentId).map((chunk) => chunk.id));
    for (const [key, value] of embeddings.entries()) {
      if (chunkIds.has(value.chunkId)) embeddings.delete(key);
    }
    pushAuditEntry({ action: "delete-by-document", entityType: "embedding", entityId: documentId });
  },

  saveIndexVersion(version: SearchIndexVersion): SearchIndexVersion {
    indexVersions.set(version.id, version);
    pushAuditEntry({ action: "save", entityType: "index-version", entityId: version.id });
    return version;
  },

  getIndexVersion(id: string): SearchIndexVersion | undefined {
    return indexVersions.get(id);
  },

  listIndexVersions(): SearchIndexVersion[] {
    return [...indexVersions.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  setActiveIndexVersion(id: string): void {
    activeIndexVersionId = id;
    pushAuditEntry({ action: "activate", entityType: "index-version", entityId: id });
  },

  getActiveIndexVersion(): SearchIndexVersion | null {
    return activeIndexVersionId ? indexVersions.get(activeIndexVersionId) ?? null : null;
  },

  saveIndexingJob(job: SearchIndexingJob): SearchIndexingJob {
    indexingJobs.set(job.id, job);
    pushAuditEntry({ action: "save", entityType: "index-job", entityId: job.id });
    return job;
  },

  getIndexingJob(id: string): SearchIndexingJob | undefined {
    return indexingJobs.get(id);
  },

  listIndexingJobs(status?: SearchIndexingJob["status"]): SearchIndexingJob[] {
    const jobs = [...indexingJobs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return status ? jobs.filter((job) => job.status === status) : jobs;
  },

  findIndexingJob(
    contentItemId: string,
    action: SearchIndexingJob["action"],
    statuses: SearchIndexingJob["status"][] = ["pending", "processing"],
  ): SearchIndexingJob | undefined {
    return [...indexingJobs.values()].find(
      (job) =>
        job.contentItemId === contentItemId &&
        job.action === action &&
        statuses.includes(job.status),
    );
  },

  appendQueryLog(
    entry: Omit<SearchQueryLogEntry, "id" | "createdAt" | "rawQuery"> & { rawQuery: string },
  ): SearchQueryLogEntry {
    const sanitized = sanitizeQueryLog(entry);
    queryLogs.unshift(sanitized);
    if (queryLogs.length > 10000) queryLogs.pop();
    pushAuditEntry({ action: "append", entityType: "query", entityId: sanitized.id });
    return sanitized;
  },

  listQueryLogs(limit = 1000): SearchQueryLogEntry[] {
    return queryLogs.slice(0, limit);
  },

  listQueryLogsByQuery(normalizedQuery: string): SearchQueryLogEntry[] {
    return queryLogs.filter((entry) => entry.normalizedQuery === normalizedQuery);
  },

  saveFeedback(
    feedback: Omit<SearchFeedbackRecord, "id" | "status" | "createdAt"> & Partial<SearchFeedbackRecord>,
  ): SearchFeedbackRecord {
    const record: SearchFeedbackRecord = {
      id: feedback.id ?? randomUUID(),
      feedbackType: feedback.feedbackType ?? "other",
      status: feedback.status ?? "queued",
      createdAt: feedback.createdAt ?? new Date().toISOString(),
      queryId: feedback.queryId,
      documentId: feedback.documentId,
      chunkId: feedback.chunkId,
      message: feedback.message ? sanitizeFreeText(feedback.message) : undefined,
      updatedAt: feedback.updatedAt,
    };
    feedbackQueue.set(record.id, record);
    pushAuditEntry({ action: "save", entityType: "feedback", entityId: record.id });
    return record;
  },

  getFeedback(id: string): SearchFeedbackRecord | undefined {
    return feedbackQueue.get(id);
  },

  listFeedback(status?: SearchFeedbackRecord["status"]): SearchFeedbackRecord[] {
    const list = [...feedbackQueue.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return status ? list.filter((entry) => entry.status === status) : list;
  },

  updateFeedbackStatus(id: string, status: SearchFeedbackRecord["status"]): SearchFeedbackRecord | null {
    const current = feedbackQueue.get(id);
    if (!current) return null;
    const updated: SearchFeedbackRecord = {
      ...current,
      status,
      updatedAt: new Date().toISOString(),
    };
    feedbackQueue.set(id, updated);
    pushAuditEntry({ action: "update-status", entityType: "feedback", entityId: id });
    return updated;
  },

  upsertZeroResultRecord(record: ZeroResultRecord): ZeroResultRecord {
    zeroResultRecords.set(record.normalizedQuery, record);
    pushAuditEntry({ action: "upsert", entityType: "zero-result", entityId: record.id });
    return record;
  },

  getZeroResultRecordByQuery(normalizedQuery: string): ZeroResultRecord | undefined {
    return zeroResultRecords.get(normalizedQuery);
  },

  listZeroResultRecords(): ZeroResultRecord[] {
    return [...zeroResultRecords.values()].sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  },

  appendAuditEntry(entry: Omit<SearchAuditEntry, "id" | "createdAt">): SearchAuditEntry {
    return pushAuditEntry(entry);
  },

  listAuditLog(limit = 200): SearchAuditEntry[] {
    return auditLog.slice(0, limit);
  },

  saveSessionMemory(memory: NavigationMemory): NavigationMemory {
    sessionMemories.set(memory.sessionId, memory);
    pushAuditEntry({ action: "save", entityType: "session-memory", entityId: memory.sessionId });
    return memory;
  },

  getSessionMemory(sessionId: string): NavigationMemory | undefined {
    return sessionMemories.get(sessionId);
  },

  listSessionMemories(): NavigationMemory[] {
    return [...sessionMemories.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  saveLexicalPosting(token: string, chunkId: string, frequency: number): void {
    const existing = lexicalTokenPostings.get(token) ?? new Map<string, number>();
    existing.set(chunkId, frequency);
    lexicalTokenPostings.set(token, existing);
  },

  getLexicalPosting(token: string): Map<string, number> {
    return new Map(lexicalTokenPostings.get(token) ?? []);
  },

  listLexicalTokens(): string[] {
    return [...lexicalTokenPostings.keys()];
  },

  removeLexicalPostingsForChunk(chunkId: string): void {
    for (const [token, postings] of lexicalTokenPostings.entries()) {
      postings.delete(chunkId);
      if (postings.size === 0) lexicalTokenPostings.delete(token);
    }
  },

  clearLexicalIndex(): void {
    lexicalTokenPostings.clear();
  },

  saveJourney(
    journey: Omit<SearchJourneyRecord, "id" | "startedAt" | "lastActivityAt"> & Partial<SearchJourneyRecord>,
  ): SearchJourneyRecord {
    const record: SearchJourneyRecord = {
      id: journey.id ?? randomUUID(),
      sessionId: journey.sessionId,
      queryIds: journey.queryIds ?? [],
      documentIds: journey.documentIds ?? [],
      startedAt: journey.startedAt ?? new Date().toISOString(),
      lastActivityAt: journey.lastActivityAt ?? new Date().toISOString(),
      convertedLeadId: journey.convertedLeadId,
    };
    journeys.set(record.id, record);
    pushAuditEntry({ action: "save", entityType: "journey", entityId: record.id });
    return record;
  },

  getJourney(id: string): SearchJourneyRecord | undefined {
    return journeys.get(id);
  },

  findJourneyBySession(sessionId: string): SearchJourneyRecord | undefined {
    return [...journeys.values()].find((journey) => journey.sessionId === sessionId);
  },

  listJourneys(): SearchJourneyRecord[] {
    return [...journeys.values()].sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
  },

  saveAttribution(
    attribution: Omit<SearchAttributionRecord, "id" | "attributedAt"> & Partial<SearchAttributionRecord>,
  ): SearchAttributionRecord {
    const record: SearchAttributionRecord = {
      id: attribution.id ?? randomUUID(),
      leadId: attribution.leadId,
      journeyId: attribution.journeyId,
      confidence: attribution.confidence ?? "medium",
      attributedAt: attribution.attributedAt ?? new Date().toISOString(),
    };
    attributions.set(record.id, record);
    pushAuditEntry({ action: "save", entityType: "attribution", entityId: record.id });
    return record;
  },

  listAttributions(): SearchAttributionRecord[] {
    return [...attributions.values()].sort((a, b) => b.attributedAt.localeCompare(a.attributedAt));
  },

  saveAnalyticsEvent(event: Omit<SearchAnalyticsEvent, "id" | "occurredAt"> & Partial<SearchAnalyticsEvent>): SearchAnalyticsEvent {
    const full: SearchAnalyticsEvent = {
      id: event.id ?? randomUUID(),
      eventName: event.eventName,
      payload: event.payload ?? {},
      occurredAt: event.occurredAt ?? new Date().toISOString(),
    };
    analyticsEvents.unshift(full);
    if (analyticsEvents.length > 10000) analyticsEvents.pop();
    pushAuditEntry({ action: "save", entityType: "analytics", entityId: full.id });
    return full;
  },

  listAnalyticsEvents(limit = 1000): SearchAnalyticsEvent[] {
    return analyticsEvents.slice(0, limit);
  },

  clearAll(): void {
    documents.clear();
    chunks.clear();
    embeddings.clear();
    indexVersions.clear();
    indexingJobs.clear();
    feedbackQueue.clear();
    zeroResultRecords.clear();
    sessionMemories.clear();
    lexicalTokenPostings.clear();
    journeys.clear();
    attributions.clear();
    queryLogs.length = 0;
    auditLog.length = 0;
    analyticsEvents.length = 0;
    activeIndexVersionId = null;
  },

  /** Test helper alias */
  clear(): void {
    this.clearAll();
  },
};
