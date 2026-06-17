export type ContentIndexingDecision = {
  indexable: boolean;
  sitemap: boolean;
  canonicalUrl?: string;
  noindexReason?: string;
  robots: {
    index: boolean;
    follow: boolean;
  };
  issues: ContentIndexingIssue[];
};

export type ContentIndexingIssue = {
  type:
    | "draft-indexable"
    | "missing-canonical"
    | "cannibalization"
    | "sitemap-excluded"
    | "published-noindex"
    | "ai-generated-indexable";
  severity: "high" | "medium" | "low";
  message: string;
};
