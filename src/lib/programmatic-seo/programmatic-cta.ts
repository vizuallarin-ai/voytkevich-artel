import type { TaxonomyCombination } from "@/types/project-taxonomy";
import type { ProgrammaticPageTemplate } from "@/types/programmatic-page-template";
import { getIntentById } from "@/data/project-intent-taxonomy";

export function buildProgrammaticCta(
  combination: TaxonomyCombination,
  template: ProgrammaticPageTemplate,
) {
  const intent = combination.intentId ? getIntentById(combination.intentId) : undefined;
  const primary = intent?.defaultCTA ?? template.defaultCTA.primary;
  const secondary = template.defaultCTA.secondary;

  if (combination.pageType === "project-location-page") {
    return {
      primary: "Обсудить строительство в этой локации",
      secondary: "Получить чек-лист участка",
      sourceCTA: "Обсудить строительство в этой локации",
    };
  }

  if (combination.materialId) {
    return {
      primary: primary.includes("Рассчитать") ? primary : `Рассчитать стоимость — ${combination.h1.split("—")[0]?.trim()}`,
      secondary: secondary ?? "Подобрать проект под участок",
      sourceCTA: primary,
    };
  }

  return {
    primary,
    secondary,
    sourceCTA: primary,
  };
}

export function resolveLeadMagnet(
  combination: TaxonomyCombination,
  template: ProgrammaticPageTemplate,
): { id: string; title: string; description: string } | undefined {
  const id = template.defaultLeadMagnet;
  if (!id) return undefined;

  const titles: Record<string, { title: string; description: string }> = {
    "estimate-example": {
      title: "Получить пример сметы",
      description: "Структура сметы: фундамент, коробка, кровля, инженерия — что часто забывают.",
    },
    "land-checklist": {
      title: "Получить чек-лист участка",
      description: "Подъезд, грунт, коммуникации и ограничения — до старта строительства.",
    },
    "material-comparison": {
      title: "Получить сравнение материалов",
      description: "Каркас, брус, газобетон — отличия по бюджету, срокам и эксплуатации.",
    },
    "project-selection-checklist": {
      title: "Получить чек-лист выбора проекта",
      description: "Как сопоставить проект, участок и бюджет без типичных ошибок.",
    },
  };

  const meta = titles[id];
  if (!meta) return undefined;
  return { id, ...meta };
}
