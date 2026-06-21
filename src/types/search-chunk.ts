export type SearchChunk = {
  id: string;
  documentId: string;
  contentItemId: string;

  order: number;
  text: string;

  title: string;
  headingPath: string[];
  canonicalUrl: string;

  chunkType:
    | "introduction"
    | "section"
    | "faq"
    | "specification"
    | "comparison"
    | "cta-context"
    | "other";

  entities: string[];
  entityNodeIds: string[];
  clusterIds: string[];

  tokenCount?: number;
  contentHash: string;
  embeddingVersion?: string;

  status: "pending" | "indexed" | "stale" | "failed" | "excluded";

  createdAt: string;
  updatedAt?: string;
};

export type ChunkEmbedding = {
  chunkId: string;
  version: string;
  vector: number[];
  contentHash: string;
  createdAt: string;
};
