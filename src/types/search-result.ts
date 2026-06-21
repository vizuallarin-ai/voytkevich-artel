import type { SearchDocumentType } from "@/types/search-document";

export type SearchResult = {
  documentId: string;
  contentItemId: string;

  title: string;
  description?: string | null;
  snippet: string;
  canonicalUrl: string;

  type: SearchDocumentType;

  entities: string[];
  breadcrumbs: string[];

  matchedFields: string[];

  score: number;
  confidence: "low" | "medium" | "high";

  explanation?: string;

  highlights?: {
    field: string;
    fragments: string[];
  }[];
};

export type SearchResponse = {
  requestId: string;
  query: string;
  normalizedQuery: string;
  intent: string;
  results: SearchResult[];
  facets: Record<string, Array<{ value: string; count: number }>>;
  total: number;
  page: number;
  pageSize: number;
  correction?: string;
  relatedQueries: string[];
  zeroResult: boolean;
  searchMode: string;
  latencyMs: number;
};
