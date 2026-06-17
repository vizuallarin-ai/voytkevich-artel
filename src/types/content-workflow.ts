export type ContentStatus =
  | "idea"
  | "planned"
  | "draft"
  | "ai-generated"
  | "review"
  | "needs-source"
  | "needs-fact-check"
  | "needs-expert-review"
  | "needs-keyword-data"
  | "needs-project-data"
  | "approved"
  | "scheduled"
  | "published"
  | "noindex"
  | "needs-update"
  | "archived"
  | "rejected";

export type WorkflowAction =
  | "send_to_review"
  | "request_source"
  | "request_fact_check"
  | "request_expert_review"
  | "approve"
  | "schedule"
  | "publish"
  | "set_noindex"
  | "archive"
  | "reject"
  | "request_changes";

export type WorkflowTransitionContext = {
  actorId?: string;
  actorRole?: string;
  reason?: string;
  scheduledAt?: string;
  reviewNotes?: string;
};

export type WorkflowActionAvailability = {
  action: WorkflowAction;
  available: boolean;
  reason?: string;
};
