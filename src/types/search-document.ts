export type SearchDocumentType =
  | "service"
  | "project"
  | "project-category"
  | "programmatic"
  | "technical"
  | "editorial"
  | "location"
  | "technology"
  | "material"
  | "comparison"
  | "faq"
  | "knowledge"
  | "other";

export type SearchDocumentStatus =
  | "pending"
  | "indexed"
  | "stale"
  | "failed"
  | "excluded"
  | "deleted";

export type SearchDocument = {
  id: string;
  contentItemId: string;

  type: SearchDocumentType;

  title: string;
  description?: string | null;
  content: string;

  canonicalUrl: string;
  slug: string;

  headings: string[];
  entities: string[];
  entityNodeIds: string[];
  clusterIds: string[];

  taxonomy: {
    services: string[];
    buildingTypes: string[];
    technologies: string[];
    materials: string[];
    sizes: string[];
    areas: string[];
    floors: string[];
    layouts: string[];
    locations: string[];
  };

  search: {
    keywords: string[];
    synonyms: string[];
    aliases: string[];
    normalizedText: string;
    language: "ru";
  };

  business: {
    priorityLevel?: "P1" | "P2" | "P3" | "P4" | "P5";
    commercialIntent: "high" | "medium" | "low";
    leadPotential: "high" | "medium" | "low";
    destinationType: "informational" | "commercial" | "conversion" | "navigation";
  };

  source: {
    versionId?: string;
    publishedAt?: string;
    updatedAt?: string;
    indexedAt?: string;
    contentHash?: string;
  };

  indexability: {
    indexable: boolean;
    canonical: boolean;
    published: boolean;
  };

  status: SearchDocumentStatus;
  createdAt: string;
  updatedAt?: string;
};
