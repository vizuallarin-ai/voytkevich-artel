import type {
  LeadMagnet,
  LeadMagnetContextPayload,
  LeadMagnetPageType,
  LeadMagnetSubmitContext,
  LeadMagnetUserInput,
} from "@/types/lead-magnet";
import { leadMagnets, getLeadMagnetByIdFromData } from "@/data/lead-magnets";
import {
  clusterLeadMagnetMap,
  clusterSecondaryMagnetMap,
  leadMagnetPlacements,
  serviceLeadMagnetMap,
} from "@/data/lead-magnet-placements";
import { trackLeadMagnetEvent as trackLeadMagnetEventBase } from "@/lib/analytics/events";

export function getActiveLeadMagnets(): LeadMagnet[] {
  return leadMagnets.filter((m) => m.status === "active");
}

export function getLeadMagnetById(id: string): LeadMagnet | undefined {
  return getLeadMagnetByIdFromData(id);
}

export function getLeadMagnetsForCluster(clusterId: string): LeadMagnet[] {
  const primaryId = clusterLeadMagnetMap[clusterId];
  const secondaryId = clusterSecondaryMagnetMap[clusterId];
  const ids = [primaryId, secondaryId].filter(Boolean) as string[];
  return ids
    .map((id) => getLeadMagnetById(id))
    .filter((m): m is LeadMagnet => !!m);
}

export function getLeadMagnetForCluster(clusterId: string): LeadMagnet | undefined {
  const id = clusterLeadMagnetMap[clusterId];
  return id ? getLeadMagnetById(id) : undefined;
}

export function getLeadMagnetsForPageType(pageType: LeadMagnetPageType): LeadMagnet[] {
  return getActiveLeadMagnets().filter((m) => m.pageTypes.includes(pageType));
}

export function getLeadMagnetsForServicePage(serviceSlug: string): LeadMagnet[] {
  const ids = serviceLeadMagnetMap[serviceSlug];
  if (!ids) return [];
  return ids
    .map((id) => (id ? getLeadMagnetById(id) : undefined))
    .filter((m): m is LeadMagnet => !!m);
}

export function getPlacementsForPage(
  pageType: LeadMagnetPageType,
  opts?: { pageSlug?: string; clusterId?: string },
): typeof leadMagnetPlacements {
  return leadMagnetPlacements.filter((p) => {
    if (p.pageType !== pageType) return false;
    if (p.pageSlug && opts?.pageSlug && p.pageSlug !== opts.pageSlug) return false;
    if (p.clusterId && opts?.clusterId && p.clusterId !== opts.clusterId) return false;
    if (p.pageSlug && !opts?.pageSlug) return false;
    if (p.clusterId && !opts?.clusterId) return false;
    return true;
  });
}

export function getLeadMagnetTypeLabel(type: LeadMagnet["type"]): string {
  switch (type) {
    case "checklist":
      return "Чек-лист";
    case "pdf":
      return "Материал";
    case "selection":
      return "Подборка";
    case "comparison":
      return "Сравнение";
    case "consultation":
      return "Разбор";
    case "planner-review":
      return "Разбор планировки";
    case "calculator-result":
      return "Расчёт";
    case "audit":
      return "Аудит";
    default:
      return "Материал";
  }
}

export function buildLeadMagnetComment(
  magnet: LeadMagnet,
  userInput: LeadMagnetUserInput,
  ctx: LeadMagnetSubmitContext,
): string {
  const lines = [
    `source: lead-magnet`,
    `leadMagnetId: ${magnet.id}`,
    `leadMagnetTitle: ${magnet.title}`,
    `leadMagnetType: ${magnet.type}`,
    `pageType: ${ctx.pageType}`,
  ];
  if (ctx.pageSlug) lines.push(`pageSlug: ${ctx.pageSlug}`);
  if (ctx.clusterId) lines.push(`clusterId: ${ctx.clusterId}`);
  if (ctx.currentUrl) lines.push(`currentUrl: ${ctx.currentUrl}`);
  if (ctx.selectedCTA) lines.push(`selectedCTA: ${ctx.selectedCTA}`);

  const c = ctx.context;
  if (c?.projectSlug) lines.push(`projectSlug: ${c.projectSlug}`);
  if (c?.projectTitle) lines.push(`projectTitle: ${c.projectTitle}`);
  if (c?.caseSlug) lines.push(`caseSlug: ${c.caseSlug}`);
  if (c?.serviceSlug) lines.push(`serviceSlug: ${c.serviceSlug}`);
  if (c?.blogPostSlug) lines.push(`blogPostSlug: ${c.blogPostSlug}`);
  if (c?.objectSlug) lines.push(`objectSlug: ${c.objectSlug}`);
  if (c?.calculatorResult) {
    lines.push(`calculatorResult: ${JSON.stringify(c.calculatorResult)}`);
  }
  if (c?.plannerSummary) {
    lines.push(`plannerSummary: ${JSON.stringify(c.plannerSummary)}`);
  }

  if (userInput.budget) lines.push(`budget: ${userInput.budget}`);
  if (userInput.material) lines.push(`material: ${userInput.material}`);
  if (userInput.hasLand) lines.push(`hasLand: ${userInput.hasLand}`);
  if (userInput.landLocation) lines.push(`landLocation: ${userInput.landLocation}`);
  if (userInput.planningScenario) lines.push(`planningScenario: ${userInput.planningScenario}`);
  if (userInput.messenger) lines.push(`messenger: ${userInput.messenger}`);
  if (userInput.comment) lines.push(`comment: ${userInput.comment}`);

  return lines.join("\n");
}

export function buildLeadMagnetSource(magnet: LeadMagnet, ctx: LeadMagnetSubmitContext): string {
  const base = magnet.payloadDefaults.defaultSource;
  if (ctx.pageSlug) return `${base}:${ctx.pageType}:${ctx.pageSlug}`;
  return `${base}:${ctx.pageType}`;
}

export type LeadMagnetAnalyticsPayload = {
  leadMagnetId?: string;
  leadMagnetType?: string;
  pageType?: string;
  pageSlug?: string;
  clusterId?: string;
  source?: string;
  selectedCTA?: string;
  currentUrl?: string;
  projectSlug?: string;
  serviceSlug?: string;
  blogPostSlug?: string;
  caseSlug?: string;
  objectSlug?: string;
};

export function trackLeadMagnetEvent(
  eventName:
    | "lead_magnet_viewed"
    | "lead_magnet_clicked"
    | "lead_magnet_modal_opened"
    | "lead_magnet_form_started"
    | "lead_magnet_submitted"
    | "lead_magnet_success_viewed"
    | "lead_magnet_error",
  payload?: LeadMagnetAnalyticsPayload,
) {
  trackLeadMagnetEventBase(eventName, payload);
}

export function buildProjectLeadMagnetContext(project: {
  slug: string;
  name: string;
  specs: { area: number; material: string; floors: number };
  price: number;
}): LeadMagnetContextPayload {
  return {
    projectSlug: project.slug,
    projectTitle: project.name,
    calculatorResult: {
      area: project.specs.area,
      material: project.specs.material,
      floors: project.specs.floors,
      priceFrom: project.price,
    },
  };
}
