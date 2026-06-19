export type KeywordDemandSource =
  | "manual"
  | "csv-import"
  | "yandex-wordstat"
  | "google-search-console"
  | "yandex-webmaster"
  | "serpstat"
  | "ahrefs"
  | "semrush"
  | "competitor-research"
  | "future-api";

export type KeywordDemandRegion = "irkutsk" | "irkutsk-region" | "russia" | "unknown";

export type KeywordIntent =
  | "commercial"
  | "informational"
  | "transactional"
  | "comparison"
  | "local"
  | "editorial"
  | "unknown";

export type KeywordDemandStatus =
  | "new"
  | "mapped"
  | "needs-mapping"
  | "ignored"
  | "duplicate"
  | "needs-review";

export type KeywordDemandItem = {
  id: string;
  keyword: string;
  normalizedKeyword: string;
  region: KeywordDemandRegion;
  source: KeywordDemandSource;
  metrics: {
    searchVolume?: number | null;
    impressions?: number | null;
    clicks?: number | null;
    ctr?: number | null;
    avgPosition?: number | null;
    keywordDifficulty?: number | null;
    competition?: "high" | "medium" | "low" | "unknown";
  };
  intent: KeywordIntent;
  mappedTo: {
    contentItemId?: string;
    clusterId?: string;
    programmaticPageId?: string;
    technicalArticleId?: string;
    editorialContentId?: string;
    taxonomyCombinationId?: string;
  };
  status: KeywordDemandStatus;
  importedAt?: string;
  updatedAt?: string;
};

export type KeywordCSVRow = {
  keyword: string;
  searchVolume?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  avgPosition?: string;
  difficulty?: string;
  competition?: string;
  region?: string;
  source?: string;
  cluster?: string;
  intent?: string;
};
