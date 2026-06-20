export type ContentExperimentType =
  | "title"
  | "description"
  | "cta"
  | "content-structure"
  | "internal-linking"
  | "visual"
  | "faq"
  | "content-depth"
  | "other";

export type ContentExperimentStatus =
  | "draft"
  | "review"
  | "approved"
  | "scheduled"
  | "running"
  | "paused"
  | "completed"
  | "inconclusive"
  | "stopped"
  | "rolled-back";

export type ContentExperiment = {
  id: string;
  contentItemId: string;

  type: ContentExperimentType;
  status: ContentExperimentStatus;

  hypothesis: string;
  baselineVersionId: string;
  variantVersionIds: string[];

  primaryMetric: string;
  secondaryMetrics: string[];
  guardrailMetrics: string[];

  audienceAllocation?: {
    control: number;
    variants: Record<string, number>;
  };

  period: {
    plannedStart?: string;
    plannedEnd?: string;
    actualStart?: string;
    actualEnd?: string;
  };

  minimumSample: number | null;
  confidenceThreshold: number | null;

  risks: string[];
  createdAt: string;
};
