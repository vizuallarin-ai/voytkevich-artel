import type { Lead, LeadNextAction, LeadProcessingType } from "@/types/lead";
import { getLeadProcessingType } from "./lead-routing";

export function getRecommendedNextAction(lead: Lead): LeadNextAction {
  const processingType = getLeadProcessingType(lead);
  const magnetId = lead.context.leadMagnet?.id ?? "";
  const now = new Date().toISOString();

  const action = buildActionForType(processingType, lead, magnetId);
  return {
    ...action,
    status: "open",
    createdAt: now,
    createdBy: "system",
    dueAt: action.dueAt ?? action.at,
  };
}

function buildActionForType(
  type: LeadProcessingType,
  lead: Lead,
  magnetId: string,
): LeadNextAction {
  switch (type) {
    case "calculator":
      return {
        type: "review-calculator",
        title: "Разобрать расчёт",
        description:
          "Уточнить участок, комплектацию, фундамент и подготовить более точную смету.",
      };
    case "project":
      return {
        type: "prepare-estimate",
        title: "Рассчитать проект",
        description:
          "Обсудить выбранный проект, участок, материал, комплектацию и адаптацию.",
      };
    case "planner":
      return {
        type: "review-planner",
        title: "Разобрать планировку",
        description:
          "Проверить состав помещений, площадь, сценарий жизни и предложить похожий проект.",
      };
    case "lead-magnet":
      if (magnetId.includes("land") || magnetId.includes("uchastok")) {
        return {
          type: "clarify-land",
          title: "Уточнить участок",
          description:
            "Спросить локацию, подъезд, коммуникации, уклон и готовность к строительству.",
        };
      }
      if (magnetId.includes("mortgage") || magnetId.includes("ipotek")) {
        return {
          type: "mortgage-consultation",
          title: "Обсудить строительство в ипотеку",
          description:
            "Уточнить банк/программу, проект, смету, этапы. Не обещать одобрение.",
        };
      }
      return {
        type: "send-lead-magnet",
        title: "Отправить лид-магнит",
        description:
          magnetId.includes("estimate") || lead.context.leadMagnet?.title?.toLowerCase().includes("смет")
            ? "Отправить структуру сметы и предложить разбор по объекту клиента."
            : "Отправить материал и предложить консультацию по объекту.",
      };
    case "blog":
      return {
        type: "follow-up",
        title: "Уточнить интерес после статьи",
        description: "Понять, нужна ли смета, проект, участок или консультация.",
      };
    case "case-like":
      return {
        type: "prepare-estimate",
        title: "Обсудить похожий дом",
        description: "Уточнить участок, бюджет, адаптацию проекта под кейс.",
      };
    case "objects-map":
      return {
        type: "clarify-land",
        title: "Уточнить район и участок",
        description: "Спросить локацию, параметры дома и готовность к строительству.",
      };
    case "service-page":
      return {
        type: "call",
        title: "Связаться по услуге",
        description: `Обсудить услугу «${lead.context.service?.title ?? lead.request.title}» и вводные клиента.`,
      };
    default:
      return {
        type: "call",
        title: "Связаться и уточнить вводные",
        description: "Уточнить задачу, участок, бюджет, сроки и формат строительства.",
      };
  }
}

export function createLeadTaskFromAction(leadId: string, action: LeadNextAction) {
  return {
    leadId,
    type: action.type,
    title: action.title ?? action.type,
    description: action.description ?? action.comment,
    status: action.status ?? "open",
    dueAt: action.dueAt ?? action.at,
    createdAt: action.createdAt ?? new Date().toISOString(),
    createdBy: action.createdBy ?? "system",
  };
}
