export type PreferenceSource =
  | "explicit"
  | "search-filter"
  | "session-behavior"
  | "assistant-memory"
  | "saved-selection";

export type RecommendationPreference = {
  id: string;
  sessionId?: string;
  userId?: string;

  key:
    | "building-type"
    | "technology"
    | "material"
    | "size"
    | "area"
    | "floors"
    | "layout"
    | "location"
    | "content-type"
    | "journey-stage";

  value: string;
  source: PreferenceSource;

  confidence: "low" | "medium" | "high";

  explicit: boolean;
  persistent: boolean;

  createdAt: string;
  expiresAt?: string;
};
