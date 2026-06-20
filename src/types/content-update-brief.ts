export type ContentUpdateBrief = {
  id: string;
  contentItemId: string;
  refreshCandidateId: string;

  objective: string;
  hypothesis: string;

  currentProblem: {
    summary: string;
    evidence: string[];
    unknowns: string[];
  };

  targetAudience: string;
  searchIntent: string;
  primaryQuery?: string | null;
  secondaryQueries: string[];

  proposedChanges: {
    title?: string;
    description?: string;
    headings?: string[];
    sectionsToAdd?: string[];
    sectionsToRewrite?: string[];
    sectionsToRemove?: string[];
    factsToVerify?: string[];
    internalLinksToAdd?: string[];
    internalLinksToRemove?: string[];
    ctaChanges?: string[];
    visualChanges?: string[];
    structuredDataChanges?: string[];
  };

  protectedElements: string[];
  successMetrics: string[];
  guardrailMetrics: string[];

  requiredReviews: {
    editorial: boolean;
    seo: boolean;
    expert: boolean;
    legal: boolean;
  };

  createdAt: string;
  createdBy: string;
};
