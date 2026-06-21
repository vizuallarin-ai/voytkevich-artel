export type SearchIndexVersion = {
  id: string;
  version: string;

  status: "building" | "validating" | "ready" | "active" | "failed" | "archived";

  documentCount: number;
  chunkCount: number;
  embeddingModel?: string;

  createdAt: string;
  activatedAt?: string;
  archivedAt?: string;
};

export type SearchIndexingJob = {
  id: string;
  contentItemId: string;
  action: "index" | "reindex" | "remove";
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  error?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ZeroResultRecord = {
  id: string;
  normalizedQuery: string;
  rawQuery: string;
  frequency: number;
  entities: string[];
  commercialRelevance: "high" | "medium" | "low";
  status: "open" | "reviewed" | "dismissed";
  createdAt: string;
  lastSeenAt: string;
};
