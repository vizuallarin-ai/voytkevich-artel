import type { SearchDocumentType } from "@/types/search-document";

export type SearchIntent =
  | "navigational"
  | "informational"
  | "commercial"
  | "transactional"
  | "comparison"
  | "project-selection"
  | "local"
  | "support"
  | "unknown";

export type SearchQueryContext = {
  rawQuery: string;
  normalizedQuery: string;

  language: "ru";

  intent: SearchIntent;
  intentConfidence: "low" | "medium" | "high";

  entities: {
    value: string;
    type?: string;
    nodeId?: string;
    confidence: "low" | "medium" | "high";
  }[];

  filters: {
    contentTypes?: SearchDocumentType[];
    buildingTypes?: string[];
    technologies?: string[];
    materials?: string[];
    sizes?: string[];
    areas?: string[];
    floors?: string[];
    locations?: string[];
  };

  corrections: string[];
  expandedTerms: string[];

  createdAt: string;
};

export type SearchMode =
  | "balanced"
  | "lexical-first"
  | "semantic-first"
  | "entity-first"
  | "project-search"
  | "informational-search";
