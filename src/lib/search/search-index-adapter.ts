import type { SearchChunk } from "@/types/search-chunk";
import type { SearchDocument } from "@/types/search-document";

export type SearchLexicalMatch = {
  chunkId: string;
  documentId: string;
  score: number;
  matchedTerms: string[];
  snippet?: string;
};

export type SearchVectorMatch = {
  chunkId: string;
  documentId: string;
  score: number;
};

export interface SearchIndexAdapter {
  indexDocument(document: SearchDocument): Promise<void> | void;
  indexChunk(chunk: SearchChunk): Promise<void> | void;
  removeDocument(documentId: string): Promise<void> | void;
  searchLexical(query: string, limit?: number): Promise<SearchLexicalMatch[]> | SearchLexicalMatch[];
  searchVector(vector: number[], limit?: number): Promise<SearchVectorMatch[]> | SearchVectorMatch[];
}
