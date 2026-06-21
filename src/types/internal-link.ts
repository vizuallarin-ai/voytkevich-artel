import type { KnowledgeRelationType } from "@/types/knowledge-graph";

export type InternalLinkPlacement =
  | "body"
  | "navigation"
  | "breadcrumbs"
  | "related-content"
  | "cta"
  | "footer"
  | "sidebar"
  | "table-of-contents"
  | "other";

export type InternalLinkRecord = {
  id: string;

  sourceContentItemId: string;
  targetContentItemId?: string;

  sourceUrl: string;
  targetUrl: string;

  anchorText?: string | null;
  placement: InternalLinkPlacement;

  relation?: KnowledgeRelationType;
  relevanceScore?: number | null;

  status:
    | "active"
    | "suggested"
    | "broken"
    | "redirected"
    | "noncanonical"
    | "noindex-target"
    | "removed";

  firstDetectedAt: string;
  lastCheckedAt?: string;
};
