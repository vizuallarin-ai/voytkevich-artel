export type ContentVersionStatus =
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "rejected"
  | "archived"
  | "rollback";

export type ContentVersion = {
  id: string;
  contentItemId: string;
  versionNumber: number;
  status: ContentVersionStatus;

  content: unknown;
  metadata: unknown;

  changeType: "manual" | "ai-assisted" | "experiment" | "rollback" | "migration";

  updateBriefId?: string;
  experimentId?: string;
  parentVersionId?: string;

  changeSummary: string;
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
};
