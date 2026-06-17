import type {
  TechnicalArticleTemplate,
  TechnicalContentCluster,
  TechnicalContentQueueItem,
} from "@/types/technical-content";

const CTA_MAP: Record<string, { primary: string; secondary?: string; leadMagnetId?: string }> = {
  "estimate-example": {
    primary: "Получить пример сметы",
    secondary: "Рассчитать стоимость дома",
    leadMagnetId: "estimate-example",
  },
  "land-checklist": {
    primary: "Получить чек-лист участка",
    secondary: "Подобрать проект под участок",
    leadMagnetId: "land-checklist",
  },
  "material-comparison": {
    primary: "Получить сравнение материалов",
    secondary: "Рассчитать дом в разных технологиях",
    leadMagnetId: "material-comparison",
  },
  "mistakes-checklist": {
    primary: "Получить чек-лист ошибок",
    secondary: "Обсудить мой проект",
    leadMagnetId: "mistakes-checklist",
  },
  "ask-specialist": {
    primary: "Задать вопрос специалисту",
    secondary: "Получить консультацию по проекту",
    leadMagnetId: "mistakes-checklist",
  },
  calculator: {
    primary: "Рассчитать стоимость дома",
    secondary: "Смотреть проекты в каталоге",
  },
  "project-consultation": {
    primary: "Обсудить мой проект",
    secondary: "Подобрать проект в каталоге",
  },
  "project-selection": {
    primary: "Подобрать проект под участок",
    secondary: "Рассчитать стоимость",
    leadMagnetId: "budget-project-selection",
  },
};

export function buildTechnicalCta(
  item: TechnicalContentQueueItem,
  cluster: TechnicalContentCluster,
  template: TechnicalArticleTemplate,
) {
  let ctaKey = template.defaultCTA;

  if (cluster.category === "estimate" || item.type === "cost-explainer") {
    ctaKey = "estimate-example";
  } else if (cluster.category === "land-plot") {
    ctaKey = "land-checklist";
  } else if (cluster.category === "mistakes" || item.type === "mistakes") {
    ctaKey = "mistakes-checklist";
  } else if (item.type === "comparison" || cluster.category === "materials") {
    ctaKey = "material-comparison";
  } else if (
    cluster.requiresTechnicalReview &&
    ["roof", "walls", "floor", "foundation", "insulation"].includes(cluster.category)
  ) {
    ctaKey = "ask-specialist";
  }

  const mapped = CTA_MAP[ctaKey] ?? CTA_MAP["ask-specialist"];
  const leadMagnetId =
    mapped.leadMagnetId ?? template.defaultLeadMagnet ?? cluster.relatedLeadMagnets[0];

  return {
    primary: mapped.primary,
    secondary: mapped.secondary,
    sourceCTA: mapped.primary,
    leadMagnetId,
  };
}
