import type { Project } from "@/types";
import { formatPrice } from "@/lib/utils";

const floorLabel = (n: number) => (n === 1 ? "1 этаж" : `${n} этажа`);

export function buildProjectDescription(project: Project): string {
  const { specs, name, price } = project;
  const extras: string[] = [];
  if (specs.hasTerrace) extras.push("террасой");
  if (specs.hasGarage) extras.push("гаражом");
  if (specs.hasSauna) extras.push("баней");

  const extrasText = extras.length
    ? ` В проекте предусмотрены ${extras.join(", ")} — состав можно скорректировать под участок.`
    : "";

  return [
    `Проект «${name}» — ${specs.area} м², ${floorLabel(specs.floors)}, ${specs.bedrooms} спален, материал ${specs.material}.`,
    `Ориентировочная стоимость строительства под ключ в Иркутске — от ${formatPrice(price)} (${formatPrice(project.pricePerSqm)}/м²), срок ${specs.buildTimeMonths} мес.`,
    `Стиль — ${specs.style}. Технология: ${specs.technology}.${extrasText}`,
    "Адаптируем планировку, фасад и комплектацию под ваш участок и бюджет. После консультации подготовим смету с разбивкой по этапам и зафиксируем её в договоре.",
  ].join(" ");
}

export const priceIncludesItems = [
  "Адаптация проекта под участок",
  "Фундамент по результатам геологии",
  "Коробка дома и кровля",
  "Окна и входные двери",
  "Инженерные системы (по комплектации)",
  "Внутренняя отделка (по выбранному пакету)",
  "Смета с разбивкой по этапам в договоре",
  "Фотоотчёты с объекта каждые 3 дня",
  "Гарантия на конструктив до 5 лет",
] as const;

export function projectFaqFor(project: Project) {
  return [
    {
      id: "price",
      question: `Сколько стоит построить «${project.name}» под ключ?`,
      answer: `Ориентир по проекту — от ${formatPrice(project.price)} за ${project.specs.area} м² (${formatPrice(project.pricePerSqm)}/м²). Точная сумма зависит от участка, фундамента и комплектации. После консультации подготовим смету с разбивкой по этапам.`,
    },
    {
      id: "time",
      question: "Какой срок строительства?",
      answer: `По этому проекту ориентир — ${project.specs.buildTimeMonths} месяцев при комплектации «под ключ». Календарный график фиксируем в договоре до начала работ.`,
    },
    {
      id: "adapt",
      question: "Можно ли изменить планировку или площадь?",
      answer:
        "Да. Любой типовой проект — основа: можно увеличить или уменьшить площадь, перенести перегородки, добавить террасу, гараж или изменить фасад. Архитектор артели адаптирует проект под ваш участок.",
    },
    {
      id: "material",
      question: `Почему выбран материал «${project.specs.material}»?`,
      answer: `В этом проекте заложена технология «${project.specs.technology}». При желании можем предложить альтернативу — каркас, газобетон, брус или кирпич — с пересчётом сметы и сроков.`,
    },
  ];
}
