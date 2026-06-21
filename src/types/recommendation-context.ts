export type PersonalizationMode =
  | "contextual"
  | "anonymous-session"
  | "consented";

export type UserJourneyStage =
  | "exploration"
  | "education"
  | "comparison"
  | "project-selection"
  | "service-selection"
  | "calculation-intent"
  | "consultation-intent"
  | "unknown";

export type RecommendationContext = {
  requestId: string;
  sessionId?: string;

  mode: PersonalizationMode;

  currentPage?: {
    contentItemId?: string;
    canonicalUrl: string;
    contentType: string;
    entityNodeIds: string[];
    clusterIds: string[];
  };

  search?: {
    query?: string;
    intent?: string;
    entityNodeIds: string[];
    filters: Record<string, string[]>;
  };

  preferences: {
    buildingTypes: string[];
    technologies: string[];
    materials: string[];
    sizes: string[];
    areas: string[];
    floors: string[];
    layouts: string[];
    locations: string[];
  };

  journeyStage: UserJourneyStage;

  viewedContentIds: string[];
  clickedRecommendationIds: string[];
  dismissedRecommendationIds: string[];

  consent: {
    personalization: boolean;
    location: boolean;
    persistentPreferences: boolean;
  };

  createdAt: string;
};
