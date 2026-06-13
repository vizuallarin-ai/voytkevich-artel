import type { LeadListParams, LeadReadiness, StoredLead } from "@/types/lead";
import { isLeadOverdue } from "./lead-sla";

export function filterLeads(leads: StoredLead[], params: LeadListParams): StoredLead[] {
  let result = [...leads];

  if (params.status) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status];
    result = result.filter((l) => statuses.includes(l.status));
  }

  if (params.readiness) {
    const values = Array.isArray(params.readiness) ? params.readiness : [params.readiness];
    result = result.filter((l) => values.includes(l.qualification.readiness));
  }

  if (params.sourceType) {
    const values = Array.isArray(params.sourceType) ? params.sourceType : [params.sourceType];
    result = result.filter((l) => values.includes(l.source.sourceType));
  }

  if (params.requestType) {
    const values = Array.isArray(params.requestType) ? params.requestType : [params.requestType];
    result = result.filter((l) => values.includes(l.request.type));
  }

  if (params.dateFrom) {
    const from = new Date(params.dateFrom).getTime();
    result = result.filter((l) => new Date(l.meta.createdAt).getTime() >= from);
  }

  if (params.dateTo) {
    const to = new Date(params.dateTo).getTime();
    result = result.filter((l) => new Date(l.meta.createdAt).getTime() <= to);
  }

  if (params.hasBudget) {
    result = result.filter((l) => Boolean(l.qualification.budget?.raw));
  }

  if (params.hasLand) {
    result = result.filter(
      (l) =>
        l.qualification.hasLand === "yes" ||
        Boolean(l.qualification.landLocation) ||
        Boolean(l.context.calculator?.landLocation),
    );
  }

  if (params.hasProject) {
    result = result.filter((l) => Boolean(l.context.project?.slug));
  }

  if (params.hasCalculator) {
    result = result.filter((l) => Boolean(l.context.calculator));
  }

  if (params.hasPlanner) {
    result = result.filter((l) => Boolean(l.context.planner));
  }

  if (params.priority) {
    const values = Array.isArray(params.priority) ? params.priority : [params.priority];
    result = result.filter((l) => l.automation?.priority && values.includes(l.automation.priority));
  }

  if (params.overdue) {
    result = result.filter((l) => isLeadOverdue(l));
  }

  if (params.nextActionType) {
    result = result.filter((l) => l.nextAction?.type === params.nextActionType);
  }

  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    result = result.filter((l) => {
      const haystack = [
        l.id,
        l.contact.name,
        l.contact.phone,
        l.request.comment,
        l.context.project?.title,
        l.context.project?.slug,
        l.context.service?.title,
        l.context.blog?.title,
        l.context.leadMagnet?.title,
        l.meta.currentUrl,
        l.source.pageSlug,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return sortLeads(result, params.sort ?? "newest");
}

export function sortLeads(leads: StoredLead[], sort: NonNullable<LeadListParams["sort"]>): StoredLead[] {
  const copy = [...leads];
  switch (sort) {
    case "score":
      return copy.sort((a, b) => (b.qualification.leadScore ?? 0) - (a.qualification.leadScore ?? 0));
    case "hot":
      return copy.sort((a, b) => readinessWeight(b.qualification.readiness) - readinessWeight(a.qualification.readiness));
    case "status":
      return copy.sort((a, b) => a.status.localeCompare(b.status));
    case "next_action":
      return copy.sort((a, b) => {
        const at = a.nextAction?.at ? new Date(a.nextAction.at).getTime() : Infinity;
        const bt = b.nextAction?.at ? new Date(b.nextAction.at).getTime() : Infinity;
        return at - bt;
      });
    case "newest":
    default:
      return copy.sort(
        (a, b) => new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime(),
      );
  }
}

function readinessWeight(r: LeadReadiness): number {
  switch (r) {
    case "hot":
      return 3;
    case "warm":
      return 2;
    case "cold":
      return 1;
    default:
      return 0;
  }
}

export function paginateLeads(
  leads: StoredLead[],
  page = 1,
  limit = 20,
): { items: StoredLead[]; total: number; totalPages: number } {
  const total = leads.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  return {
    items: leads.slice(start, start + limit),
    total,
    totalPages,
  };
}

export function filterByStatusGroup(leads: StoredLead[], group: string): StoredLead[] {
  switch (group) {
    case "new":
      return leads.filter((l) => l.status === "new");
    case "hot":
      return leads.filter((l) => l.qualification.readiness === "hot" && l.status !== "spam" && l.status !== "lost");
    case "estimate":
      return leads.filter((l) => l.status === "estimate_requested");
    case "overdue":
      return leads.filter((l) => isLeadOverdue(l));
    case "urgent":
      return leads.filter((l) => l.automation?.priority === "urgent" && l.status !== "spam" && l.status !== "lost");
    case "in_work":
      return leads.filter((l) =>
        ["qualified", "contacted", "in_discussion", "estimate_requested", "proposal_sent"].includes(l.status),
      );
    default:
      return leads;
  }
}

export function leadsToCsv(leads: StoredLead[]): string {
  const headers = [
    "createdAt",
    "name",
    "phone",
    "messenger",
    "status",
    "readiness",
    "leadScore",
    "sourceType",
    "requestType",
    "selectedCTA",
    "currentUrl",
    "projectTitle",
    "serviceTitle",
    "leadMagnetTitle",
    "desiredArea",
    "desiredMaterial",
    "budget",
    "landLocation",
    "comment",
  ];

  const rows = leads.map((l) =>
    [
      l.meta.createdAt,
      l.contact.name,
      l.contact.phone,
      l.contact.messenger ?? "",
      l.status,
      l.qualification.readiness,
      l.qualification.leadScore ?? "",
      l.source.sourceType,
      l.request.type,
      l.request.selectedCTA ?? "",
      l.meta.currentUrl ?? "",
      l.context.project?.title ?? "",
      l.context.service?.title ?? "",
      l.context.leadMagnet?.title ?? "",
      l.qualification.desiredArea ?? "",
      l.qualification.desiredMaterial ?? "",
      l.qualification.budget?.raw ?? "",
      l.qualification.landLocation ?? "",
      (l.request.comment ?? "").replace(/\n/g, " "),
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}
