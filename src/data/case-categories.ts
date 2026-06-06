import type { CaseCategory } from "@/types/case";

export const caseCategories: CaseCategory[] = [
  {
    slug: "doma-iz-brusa",
    title: "Кейсы домов из бруса",
    description:
      "Примеры задач, проектов и решений по строительству домов из бруса. Публикуются только подтверждённые объекты.",
    seoTitle: "Кейсы домов из бруса — построенные дома",
    seoDescription: "Кейсы строительства домов из бруса в Иркутской области.",
    noindexIfEmpty: true,
    filter: { material: ["брус", "клееный брус"] },
  },
  {
    slug: "karkasnye-doma",
    title: "Кейсы каркасных домов",
    description: "Каркасные дома: задачи клиентов, участки, этапы и результаты.",
    seoTitle: "Кейсы каркасных домов",
    seoDescription: "Кейсы строительства каркасных домов.",
    noindexIfEmpty: true,
    filter: { material: ["каркас"] },
  },
  {
    slug: "doma-iz-gazobetona",
    title: "Кейсы домов из газобетона",
    description: "Дома из газобетона: вводные, проекты, сложности и решения.",
    seoTitle: "Кейсы домов из газобетона",
    seoDescription: "Кейсы строительства домов из газобетона.",
    noindexIfEmpty: true,
    filter: { material: ["газобетон"] },
  },
  {
    slug: "odnoetazhnye",
    title: "Кейсы одноэтажных домов",
    description: "Одноэтажные дома: планировки, участки и результаты.",
    seoTitle: "Кейсы одноэтажных домов",
    seoDescription: "Кейсы одноэтажного строительства.",
    noindexIfEmpty: true,
    filter: { floors: [1] },
  },
  {
    slug: "dvukhetazhnye",
    title: "Кейсы двухэтажных домов",
    description: "Двухэтажные дома: задачи и решения.",
    seoTitle: "Кейсы двухэтажных домов",
    seoDescription: "Кейсы двухэтажного строительства.",
    noindexIfEmpty: true,
    filter: { floors: [2] },
  },
  {
    slug: "do-100-m2",
    title: "Кейсы домов до 100 м²",
    description: "Компактные дома до 100 м².",
    seoTitle: "Кейсы домов до 100 м²",
    seoDescription: "Кейсы небольших домов до 100 м².",
    noindexIfEmpty: true,
    filter: { areaMax: 100 },
  },
  {
    slug: "100-150-m2",
    title: "Кейсы домов 100–150 м²",
    description: "Дома средней площади для семьи.",
    seoTitle: "Кейсы домов 100–150 м²",
    seoDescription: "Кейсы домов 100–150 м².",
    noindexIfEmpty: true,
    filter: { areaMin: 100, areaMax: 150 },
  },
  {
    slug: "dlya-semi",
    title: "Кейсы для семьи",
    description: "Дома для семьи с детьми и постоянного проживания.",
    seoTitle: "Кейсы домов для семьи",
    seoDescription: "Кейсы строительства домов для семьи.",
    noindexIfEmpty: true,
    filter: { purpose: ["семья"] },
  },
  {
    slug: "slozhny-uchastok",
    title: "Кейсы со сложным участком",
    description: "Участки с уклоном, логистикой и ограничениями.",
    seoTitle: "Кейсы со сложным участком",
    seoDescription: "Кейсы строительства на сложных участках.",
    noindexIfEmpty: true,
    filter: { taskTags: ["slozhny-uchastok"] },
  },
  {
    slug: "irkutskaya-oblast",
    title: "Кейсы в Иркутской области",
    description: "Объекты за городом и в области — без точных адресов.",
    seoTitle: "Кейсы строительства в Иркутской области",
    seoDescription: "Кейсы домов в Иркутской области.",
    noindexIfEmpty: true,
    filter: { region: "Иркутская область" },
  },
];

export function getCaseCategoryBySlug(slug: string): CaseCategory | undefined {
  return caseCategories.find((c) => c.slug === slug);
}
