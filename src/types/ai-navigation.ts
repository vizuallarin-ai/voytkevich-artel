export type GroundedCitation = {
  sourceId: string;
  contentItemId: string;
  title: string;
  canonicalUrl: string;
  heading?: string;
};

export type NavigationAssistantAnswer = {
  answer: string;

  citations: GroundedCitation[];

  confidence: "low" | "medium" | "high";

  answerability:
    | "answered"
    | "partially-answered"
    | "not-answered"
    | "requires-manager"
    | "requires-expert";

  suggestedActions: {
    type:
      | "open-page"
      | "open-project"
      | "open-service"
      | "compare"
      | "start-calculation"
      | "request-consultation"
      | "refine-question";

    title: string;
    url?: string;
  }[];

  limitations: string[];
};

export type NavigationMemory = {
  sessionId: string;
  buildingType?: string;
  technology?: string;
  material?: string;
  area?: string;
  floors?: string;
  location?: string;
  stage?: string;
  viewedContentIds: string[];
  intent?: string;
  contactConsent?: boolean;
  updatedAt: string;
};

export type RAGContextFragment = {
  sourceId: string;
  contentItemId: string;
  title: string;
  canonicalUrl: string;
  headingPath: string[];
  text: string;
  contentType: string;
  relevance: number;
  publishedAt?: string;
  updatedAt?: string;
};
