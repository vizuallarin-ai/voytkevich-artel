export type RecommendationRuleset = {
  id: string;
  version: number;

  status:
    | "draft"
    | "validating"
    | "approved"
    | "active"
    | "archived"
    | "failed";

  weights: Record<string, number>;
  policies: string[];
  exclusions: string[];
  diversity: Record<string, number | boolean>;
  frequencyCaps: Record<string, number>;
  fallbacks: Record<string, string>;

  createdBy: string;
  createdAt: string;
  activatedAt?: string;
};
