import type { TaxonomyCombination } from "@/types/project-taxonomy";
import type { ProgrammaticPageTemplateType } from "@/types/programmatic-page-template";
import { buildTaxonomyIntro } from "@/lib/taxonomy/taxonomy-title-builder";
import { getRegionLabel } from "@/lib/programmatic-seo/project-matcher";

const COST_FACTORS = [
  "Участок и подъезд",
  "Грунт и фундамент",
  "Материал и комплектация",
  "Кровля и окна",
  "Инженерия и отделка",
  "Сезонность и логистика",
];

export function buildProgrammaticFaq(
  combination: TaxonomyCombination,
  templateType: ProgrammaticPageTemplateType,
): { question: string; answer: string }[] {
  const region = getRegionLabel(combination.regionId);
  const base = [
    {
      question: "Почему цена на сайте не является финальной сметой?",
      answer:
        "Ориентир зависит от участка, фундамента, комплектации и инженерии. После уточнения вводных специалист подготовит реалистичный следующий шаг — без обещаний «цены из воздуха».",
    },
    {
      question: "Можно ли изменить проект под мой участок?",
      answer:
        "Да. Планировку, материал, этажность и комплектацию можно адаптировать. Мы уточним ограничения участка и подскажем, что разумно менять.",
    },
    {
      question: "Что нужно для предварительного расчёта?",
      answer:
        "Площадь или проект, материал, участок (если есть), желаемая комплектация и сроки. Этого достаточно для первого разбора.",
    },
  ];

  if (templateType === "location-page" && region) {
    return [
      {
        question: `Строите ли вы в ${region}?`,
        answer:
          "Работаем по Иркутску и Иркутской области. Удалённость влияет на логистику и график — уточним при расчёте.",
      },
      {
        question: "Как удалённость влияет на стоимость?",
        answer:
          "На смету влияют подъезд, доставка материалов, проживание бригады и сроки. Эти факторы разбираем до договора.",
      },
      ...base,
    ];
  }

  if (templateType === "material-page") {
    return [
      {
        question: "Можно ли строить зимой?",
        answer:
          "Зависит от технологии и комплектации. Каркас и часть работ возможны в холодный сезон с корректной технологией — уточним под ваш проект.",
      },
      {
        question: "Чем отличается итоговая стоимость по материалам?",
        answer:
          "На цену влияют не только стены: фундамент, утепление, кровля, окна и отделка часто дают больший разброс, чем выбор материала.",
      },
      ...base,
    ];
  }

  if (templateType === "size-page" || templateType === "area-page") {
    return [
      {
        question: "Подходит ли этот размер для постоянного проживания?",
        answer:
          "Зависит от состава семьи и планировки. На консультации разберём, хватает ли площади под ваш сценарий жизни.",
      },
      {
        question: "Можно ли изменить планировку в выбранном размере?",
        answer: "Да, в разумных пределах габаритов. Покажем, что можно оптимизировать без потери конструктива.",
      },
      ...base,
    ];
  }

  return base;
}

export function buildCostFactors(): string[] {
  return COST_FACTORS;
}

export function buildWhoItFits(templateType: ProgrammaticPageTemplateType): string[] {
  switch (templateType) {
    case "material-page":
      return [
        "Семья для постоянного проживания",
        "Дача и сезонный отдых",
        "Нужен понятный бюджет по технологии",
      ];
    case "feature-page":
      return ["Семья с детьми", "Загородный сценарий", "Нужен комфортный outdoor"];
    case "area-page":
      return ["Семья 3–4 человека", "Постоянное проживание", "2–3 спальни"];
    default:
      return ["Постоянное проживание", "Семья или пара", "Загородный дом под ключ"];
  }
}

export function buildHowToChoose(templateType: ProgrammaticPageTemplateType): string[] {
  if (templateType === "size-page" || templateType === "area-page") {
    return [
      "Сверьте площадь с составом семьи",
      "Проверьте, помещаются ли нужные комнаты",
      "Уточните участок и подъезд",
      "Согласуйте комплектацию и сроки",
    ];
  }
  return [
    "Определите сценарий: дача или ПМЖ",
    "Сверьте бюджет и комплектацию",
    "Проверьте участок и коммуникации",
    "Запросите разбор у специалиста",
  ];
}

export function buildSeoText(
  combination: TaxonomyCombination,
  templateType: ProgrammaticPageTemplateType,
): string {
  const intro = buildTaxonomyIntro(combination);
  if (templateType === "combination-page") {
    return `${intro} Комбинированные подборки публикуем только при достаточном спросе и релевантных проектах в каталоге.`;
  }
  return `${intro} На странице — проекты из каталога и ориентиры по бюджету; финальная смета после участка и комплектации.`;
}

export function buildIntro(combination: TaxonomyCombination): string {
  return buildTaxonomyIntro(combination);
}
