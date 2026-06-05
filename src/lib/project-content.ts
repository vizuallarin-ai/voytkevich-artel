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
  const { specs, name, price, pricePerSqm } = project;
  return [
    {
      id: "layout",
      question: "Можно ли изменить планировку этого проекта?",
      answer:
        "Да, проект можно адаптировать до начала строительства: изменить состав помещений, расположение комнат, террасу, кабинет, санузлы и другие решения. Лучше вносить изменения на этапе проекта, чтобы не увеличивать стоимость уже в процессе стройки.",
    },
    {
      id: "price-final",
      question: "Цена проекта окончательная?",
      answer:
        "Нет, цена в карточке является предварительной. Точная смета зависит от участка, фундамента, инженерии, материала, комплектации, логистики и выбранных решений.",
    },
    {
      id: "turnkey",
      question: "Можно ли построить этот дом под ключ?",
      answer:
        "Да, проект может быть основой для строительства под ключ. Состав работ фиксируется после уточнения вводных, выбора комплектации и подготовки сметы.",
    },
    {
      id: "plot",
      question: "Подойдёт ли этот проект для моего участка?",
      answer:
        "Это нужно проверять отдельно: важны размеры участка, подъезд, уклон, коммуникации, грунт, стороны света и ограничения по размещению дома.",
    },
    {
      id: "material-swap",
      question: "Можно ли заменить материал стен?",
      answer: `В проекте заложена технология «${specs.technology}». Замена материала возможна с пересчётом фундамента, стен, перекрытий, теплотехники и сметы.`,
    },
    {
      id: "time",
      question: "Сколько времени займёт строительство?",
      answer: `Ориентир по проекту «${name}» — ${specs.buildTimeMonths} мес. при комплектации под ключ. Точный график зависит от площади, технологии, сезона, готовности проекта и участка.`,
    },
    {
      id: "calc-inputs",
      question: "Что нужно для расчёта этого проекта?",
      answer:
        "Желательно знать участок или его параметры, желаемую площадь, материал, комплектацию, бюджет, сроки и важные пожелания по планировке.",
    },
    {
      id: "price-detail",
      question: `Сколько стоит построить «${name}» под ключ?`,
      answer: `Ориентир — от ${formatPrice(price)} за ${specs.area} м² (${formatPrice(pricePerSqm)}/м²). Точная сумма формируется после уточнения участка, фундамента и комплектации.`,
    },
  ];
}

export const includedWorkGroups = [
  {
    title: "Проектная подготовка",
    items: ["адаптация проекта", "уточнение планировки", "предварительный расчёт"],
  },
  {
    title: "Фундамент",
    items: ["тип зависит от участка и геологии", "решение после уточнения вводных"],
  },
  {
    title: "Коробка дома",
    items: ["стены", "перекрытия", "конструктив"],
  },
  {
    title: "Кровля",
    items: ["стропильная система", "кровельное покрытие", "водосток — по комплектации"],
  },
  {
    title: "Окна и двери",
    items: ["зависит от выбранной комплектации"],
  },
  {
    title: "Инженерия",
    items: ["отопление", "электрика", "водоснабжение", "канализация", "вентиляция — по проекту"],
  },
  {
    title: "Отделка",
    items: ["черновая", "предчистовая", "под ключ — по выбору"],
  },
] as const;

export const priceFactors = [
  "участок и геология",
  "тип фундамента",
  "подъезд техники и удалённость",
  "материал стен и кровля",
  "окна и двери",
  "инженерные системы",
  "отделка и комплектация",
  "изменения планировки",
  "сезон строительства",
  "логистика материалов",
] as const;

export const adaptationOptions = [
  "планировку",
  "площадь",
  "материал стен",
  "фундамент",
  "террасу",
  "гараж или навес",
  "кабинет",
  "количество спален",
  "санузлы",
  "котельную",
  "окна",
  "инженерные системы",
  "отделку",
  "посадку дома на участке",
] as const;

export type DisplayPackage = {
  id: string;
  name: string;
  description: string;
  includes: string[];
  priceFrom?: number;
  priceNote?: string;
};

export function getDisplayPackages(project: Project): DisplayPackage[] {
  if (project.packages.length >= 2) {
    return project.packages.map((p) => ({
      id: p.id,
      name: p.name,
      description: "",
      includes: p.includes,
      priceFrom: p.priceFrom,
    }));
  }

  const turnkey = project.packages[0];
  return [
    {
      id: "shell",
      name: "Коробка",
      description:
        "Фундамент, несущие конструкции, перекрытия и кровля. Подходит, если часть работ вы хотите выполнять отдельно.",
      includes: ["фундамент по геологии", "коробка", "кровля", "смета по этапам"],
      priceNote: "Стоимость после уточнения комплектации",
    },
    {
      id: "warm",
      name: "Тёплый контур",
      description:
        "Коробка, кровля, окна, двери и базовая защита внешнего контура. Состав уточняется по проекту.",
      includes: ["коробка и кровля", "окна и двери", "утепление контура"],
      priceNote: "Стоимость после уточнения комплектации",
    },
    {
      id: turnkey?.id ?? "full",
      name: turnkey?.name ?? "Под ключ",
      description:
        "Расширенный формат с инженерией, отделкой и подготовкой дома к эксплуатации. Точный состав фиксируется в смете.",
      includes: turnkey?.includes ?? ["строительство", "отделка", "смета по договору"],
      priceFrom: turnkey?.priceFrom ?? project.price,
    },
  ];
}

export type AudienceScenario = { title: string; text: string };

export function projectAudienceScenarios(project: Project): AudienceScenario[] {
  const { specs, purpose } = project;
  const all: AudienceScenario[] = [
    {
      title: "Для семьи с детьми",
      text: "Площадь и планировка позволяют продумать отдельные спальни, общую зону, хранение и бытовые помещения.",
    },
    {
      title: "Для переезда из квартиры",
      text: "Проект помогает перейти от абстрактной идеи дома к понятной площади, составу помещений и предварительной смете.",
    },
    {
      title: "Для постоянного проживания",
      text: "При адаптации важно учесть отопление, инженерные системы, котельную, утепление и эксплуатацию зимой.",
    },
    {
      title: "Для загородной жизни",
      text: "Можно адаптировать проект под террасу, видовые зоны, участок и сценарии отдыха.",
    },
    {
      title: "Для участка в Иркутской области",
      text: "Перед строительством важно проверить подъезд, коммуникации, фундамент, грунт и посадку дома на участке.",
    },
    {
      title: "Для дачи",
      text: "Компактный формат для сезонного или дачного сценария — с возможностью расширения под постоянное проживание.",
    },
  ];

  const picked: AudienceScenario[] = [];
  if (purpose?.includes("семья") || specs.bedrooms >= 3) picked.push(all[0]);
  if (specs.area >= 90) picked.push(all[1]);
  if (purpose?.includes("постоянное")) picked.push(all[2]);
  if (purpose?.includes("загородная") || specs.hasTerrace) picked.push(all[3]);
  picked.push(all[4]);
  if (purpose?.includes("дача") || specs.area < 100) picked.push(all[5]);

  const unique = [...new Map(picked.map((s) => [s.title, s])).values()];
  return unique.slice(0, 5);
}

export const projectBuildSteps = [
  {
    title: "Уточнение вводных",
    description:
      "Участок, площадь, материал, бюджет, сроки, состав семьи и пожелания по планировке.",
  },
  {
    title: "Адаптация проекта",
    description: "Проверяем планировку, конструктив, фундамент, инженерные решения и комплектацию.",
  },
  {
    title: "Смета и договор",
    description: "Фиксируем состав работ, этапы, оплату, сроки и порядок согласований.",
  },
  {
    title: "Фундамент",
    description: "Выбор фундамента зависит от участка, грунта и конструктивных решений.",
  },
  {
    title: "Коробка и кровля",
    description: "Возводим основные конструкции, перекрытия и кровельную систему.",
  },
  {
    title: "Инженерия и отделка",
    description: "Состав зависит от выбранной комплектации.",
  },
  {
    title: "Сдача и гарантия",
    description: "Передаём результат, документы и гарантийные обязательства.",
  },
] as const;

export function buildProjectSeoMeta(project: Project) {
  const { specs, name } = project;
  const title = `Проект дома ${name} ${specs.area} м² — строительство под ключ в Иркутске`;
  const description = `Проект дома ${name} площадью ${specs.area} м² для строительства в Иркутске и Иркутской области. ${specs.material}, ${specs.floors} эт., предварительная стоимость, адаптация под участок и расчёт сметы.`;
  return { title, description };
}

export function buildProjectSeoText(project: Project): string[] {
  const { specs, name, price } = project;
  return [
    `Проект дома «${name}» площадью ${specs.area} м² можно использовать как основу для строительства под ключ в Иркутске и Иркутской области. Материал — ${specs.material}, этажность — ${specs.floors}. Перед началом работ важно адаптировать проект под участок, фундамент, инженерные системы, состав семьи и выбранную комплектацию.`,
    `Предварительная стоимость от ${formatPrice(price)} помогает сориентироваться по бюджету, но точная смета формируется после уточнения вводных. Вы можете оставить заявку на расчёт проекта, чтобы обсудить планировку, материал, комплектацию, сроки и адаптацию под ваш участок.`,
  ];
}

export function buildProjectLeadComment(
  project: Project,
  extra?: { packageName?: string; url?: string },
) {
  return [
    `Проект: ${project.name} (${project.slug})`,
    `Площадь: ${project.specs.area} м², ${project.specs.floors} эт., ${project.specs.material}`,
    `Ориентировочная цена: ${formatPrice(project.price)}`,
    extra?.packageName ? `Комплектация: ${extra.packageName}` : null,
    extra?.url ? `Страница: ${extra.url}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export type ProjectSpecItem = { label: string; value: string };

export function projectSpecItems(project: Project): ProjectSpecItem[] {
  const { specs } = project;
  const items: ProjectSpecItem[] = [
    { label: "Площадь", value: `${specs.area} м²` },
    { label: "Этажность", value: `${specs.floors}` },
    { label: "Материал", value: specs.material },
    { label: "Спальни", value: `${specs.bedrooms}` },
    { label: "Санузлы", value: `${specs.bathrooms}` },
    { label: "Срок строительства", value: `~${specs.buildTimeMonths} мес.` },
    { label: "Предварительная стоимость", value: `от ${formatPrice(project.price)}` },
    { label: "Стиль", value: specs.style },
  ];
  if (specs.hasTerrace) items.push({ label: "Терраса", value: "Да" });
  if (specs.hasGarage) items.push({ label: "Гараж", value: "Да" });
  if (specs.hasCabinet) items.push({ label: "Кабинет", value: "Можно предусмотреть" });
  if (specs.hasSauna) items.push({ label: "Баня / сауна", value: "Да" });
  if (project.purpose?.length)
    items.push({ label: "Назначение", value: project.purpose.join(", ") });
  return items;
}

export function suggestedRooms(project: Project): string[] {
  const rooms = ["кухня-гостиная", "спальни", "санузлы", "прихожая", "котельная"];
  if (project.specs.hasTerrace) rooms.push("терраса");
  if (project.specs.hasCabinet || project.specs.bedrooms >= 4) rooms.push("кабинет");
  if (project.specs.hasGarage) rooms.push("гараж");
  return rooms;
}

