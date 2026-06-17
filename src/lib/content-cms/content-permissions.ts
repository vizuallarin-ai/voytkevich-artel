import type { WorkflowAction } from "@/types/content-workflow";

export type CMSRole = "admin" | "editor" | "seo" | "expert" | "viewer";

const ROLE_ACTIONS: Record<CMSRole, WorkflowAction[]> = {
  admin: [
    "send_to_review",
    "request_source",
    "request_fact_check",
    "request_expert_review",
    "approve",
    "schedule",
    "publish",
    "set_noindex",
    "archive",
    "reject",
  ],
  editor: [
    "send_to_review",
    "request_source",
    "request_fact_check",
    "request_expert_review",
    "archive",
    "reject",
  ],
  seo: ["set_noindex", "approve", "schedule", "archive"],
  expert: ["request_expert_review", "approve", "reject"],
  viewer: [],
};

export function canPerformCMSAction(role: CMSRole, action: WorkflowAction): boolean {
  return ROLE_ACTIONS[role]?.includes(action) ?? false;
}

export function getCMSRoleLabel(role: CMSRole): string {
  const labels: Record<CMSRole, string> = {
    admin: "Администратор",
    editor: "Редактор",
    seo: "SEO",
    expert: "Эксперт",
    viewer: "Просмотр",
  };
  return labels[role];
}

/** Maps dashboard role to CMS role. Full RBAC — TODO Этап 24+. */
export function mapDashboardRoleToCMS(dashboardRole: "admin" | "manager"): CMSRole {
  return dashboardRole === "admin" ? "admin" : "viewer";
}
