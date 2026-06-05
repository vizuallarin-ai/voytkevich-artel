import type { AnchorGroup, CannibalizationRisk, InternalLinkRule } from "@/types/seo-architecture";

/** Правила внутренней перелинковки между типами страниц */
export const internalLinkingRules: InternalLinkRule[] = [
  {
    sourceType: "home",
    targets: [
      { targetType: "catalog", condition: "always", maxLinks: 2, anchorGroup: "catalog" },
      { targetType: "calculator", condition: "always", maxLinks: 2, anchorGroup: "calculator" },
      { targetType: "planner", condition: "always", maxLinks: 1, anchorGroup: "planner" },
      { targetType: "service-page", condition: "always", maxLinks: 2, anchorGroup: "turnkey" },
      { targetType: "service-page", condition: "relatedCluster", maxLinks: 1, anchorGroup: "estimate" },
      { targetType: "process", condition: "always", maxLinks: 1, anchorGroup: "turnkey" },
      { targetType: "blog-article", condition: "conversion", maxLinks: 2 },
    ],
    requiredTargets: ["/catalog", "/calculator", "/stroitelstvo-domov-pod-klyuch-irkutsk"],
  },
  {
    sourceType: "service-page",
    targets: [
      { targetType: "catalog", condition: "sameCluster", maxLinks: 2, anchorGroup: "catalog" },
      { targetType: "catalog-category", condition: "sameCluster", maxLinks: 3 },
      { targetType: "calculator", condition: "always", maxLinks: 2, anchorGroup: "calculator" },
      { targetType: "planner", condition: "always", maxLinks: 1, anchorGroup: "planner" },
      { targetType: "service-page", condition: "relatedCluster", maxLinks: 4 },
      { targetType: "process", condition: "always", maxLinks: 1 },
      { targetType: "blog-article", condition: "sameCluster", maxLinks: 2 },
    ],
    requiredTargets: ["/calculator", "/catalog"],
  },
  {
    sourceType: "catalog-category",
    targets: [
      { targetType: "project", condition: "sameCluster", maxLinks: 6 },
      { targetType: "calculator", condition: "always", maxLinks: 2, anchorGroup: "calculator" },
      { targetType: "planner", condition: "always", maxLinks: 1, anchorGroup: "planner" },
      { targetType: "service-page", condition: "sameCluster", maxLinks: 2 },
      { targetType: "service-page", condition: "relatedCluster", maxLinks: 1, anchorGroup: "estimate" },
      { targetType: "blog-article", condition: "sameCluster", maxLinks: 2 },
    ],
    requiredTargets: ["/calculator"],
  },
  {
    sourceType: "project-page",
    targets: [
      { targetType: "catalog-category", condition: "sameCluster", maxLinks: 3 },
      { targetType: "project", condition: "relatedCluster", maxLinks: 4 },
      { targetType: "calculator", condition: "always", maxLinks: 2, anchorGroup: "calculator" },
      { targetType: "planner", condition: "always", maxLinks: 1, anchorGroup: "planner" },
      { targetType: "service-page", condition: "relatedCluster", maxLinks: 2 },
      { targetType: "process", condition: "always", maxLinks: 1 },
    ],
    requiredTargets: ["/calculator"],
  },
  {
    sourceType: "calculator",
    targets: [
      { targetType: "catalog", condition: "always", maxLinks: 2, anchorGroup: "catalog" },
      { targetType: "service-page", condition: "always", maxLinks: 2, anchorGroup: "turnkey" },
      { targetType: "service-page", condition: "relatedCluster", maxLinks: 1, anchorGroup: "estimate" },
      { targetType: "planner", condition: "always", maxLinks: 1, anchorGroup: "planner" },
      { targetType: "project", condition: "conversion", maxLinks: 3 },
    ],
    requiredTargets: ["/catalog", "/smeta-na-stroitelstvo-doma"],
  },
  {
    sourceType: "planner",
    targets: [
      { targetType: "calculator", condition: "always", maxLinks: 2, anchorGroup: "calculator" },
      { targetType: "catalog", condition: "always", maxLinks: 2, anchorGroup: "catalog" },
      { targetType: "service-page", condition: "relatedCluster", maxLinks: 1, anchorGroup: "design" },
      { targetType: "blog-article", condition: "sameCluster", maxLinks: 2 },
    ],
    requiredTargets: ["/calculator", "/proektirovanie-domov"],
  },
  {
    sourceType: "blog-article",
    targets: [
      { targetType: "service-page", condition: "sameCluster", maxLinks: 2, anchorGroup: "commercial" },
      { targetType: "calculator", condition: "always", maxLinks: 2, anchorGroup: "calculator" },
      { targetType: "catalog", condition: "sameCluster", maxLinks: 2, anchorGroup: "catalog" },
      { targetType: "planner", condition: "relatedCluster", maxLinks: 1, anchorGroup: "planner" },
      { targetType: "blog-article", condition: "relatedCluster", maxLinks: 4 },
    ],
    requiredTargets: ["/calculator"],
  },
  {
    sourceType: "case-page",
    targets: [
      { targetType: "project", condition: "sameCluster", maxLinks: 3 },
      { targetType: "service-page", condition: "sameCluster", maxLinks: 2 },
      { targetType: "calculator", condition: "always", maxLinks: 1, anchorGroup: "calculator" },
    ],
    requiredTargets: ["/catalog", "/calculator"],
  },
];

/** Безопасный анкор-лист — чередовать формулировки, не спамить */
export const anchorGroups: AnchorGroup[] = [
  {
    id: "calculator",
    label: "Калькулятор",
    anchors: [
      "рассчитать стоимость дома",
      "получить предварительный расчёт",
      "посчитать ориентировочный бюджет",
      "перейти к калькулятору",
      "рассчитать дом по вводным",
    ],
  },
  {
    id: "catalog",
    label: "Каталог",
    anchors: [
      "смотреть проекты домов",
      "выбрать проект",
      "открыть каталог",
      "подобрать проект под участок",
      "посмотреть похожие дома",
    ],
  },
  {
    id: "estimate",
    label: "Смета",
    anchors: [
      "получить предварительную смету",
      "узнать, из чего складывается смета",
      "разобраться в составе работ",
      "посмотреть, что влияет на стоимость",
    ],
  },
  {
    id: "planner",
    label: "Планировщик",
    anchors: [
      "собрать планировку",
      "продумать состав помещений",
      "начать с планировки",
      "отправить планировку специалисту",
    ],
  },
  {
    id: "turnkey",
    label: "Строительство под ключ",
    anchors: [
      "строительство домов под ключ",
      "узнать про строительство под ключ",
      "посмотреть этапы строительства",
      "обсудить строительство дома",
    ],
  },
  {
    id: "materials",
    label: "Материалы",
    anchors: [
      "дома из бруса",
      "каркасные дома",
      "дома из газобетона",
      "сравнить технологии строительства",
    ],
  },
  {
    id: "commercial",
    label: "Коммерческие (универсальные)",
    anchors: [
      "узнать подробнее",
      "обсудить мой случай",
      "получить консультацию",
      "перейти к расчёту",
    ],
  },
];

/** Риски каннибализации — какая страница primary */
export const cannibalizationRisks: CannibalizationRisk[] = [
  {
    topic: "Строительство домов под ключ Иркутск",
    primaryPage: "/stroitelstvo-domov-pod-klyuch-irkutsk",
    supportingPages: ["/", "/about", "/process"],
    risk: "medium",
    solution:
      "Главная — бренд и обзор. Коммерческая — основной таргет. About/process — доверие, без дублирования H1 и title.",
  },
  {
    topic: "Строительство в Иркутской области",
    primaryPage: "/stroitelstvo-domov-v-irkutskoy-oblasti",
    supportingPages: ["/stroitelstvo-domov-pod-klyuch-irkutsk"],
    risk: "medium",
    solution: "Городская страница — услуга. Областная — логистика, участок, удалённость.",
  },
  {
    topic: "Смета на строительство дома",
    primaryPage: "/smeta-na-stroitelstvo-doma",
    supportingPages: ["/calculator", "/blog/stoimost-stroitelstva-2026"],
    risk: "low",
    solution: "Смета — commercial. Калькулятор — инструмент. Статья — информационный прогрев.",
  },
  {
    topic: "Дома из бруса",
    primaryPage: "/stroitelstvo-domov-iz-brusa",
    supportingPages: ["/catalog/kategoriya/iz-brusa"],
    risk: "medium",
    solution: "Услуга строительства vs каталог проектов. Разные title, H1, intent.",
  },
  {
    topic: "Каркасные дома",
    primaryPage: "/karkasnye-doma-pod-klyuch",
    supportingPages: ["/catalog/kategoriya/karkasnye"],
    risk: "medium",
    solution: "Аналогично материалам: service = подряд, category = проекты.",
  },
  {
    topic: "Газобетон",
    primaryPage: "/stroitelstvo-domov-iz-gazobetona",
    supportingPages: ["/catalog/kategoriya/iz-gazobetona"],
    risk: "medium",
    solution: "Разделение service/category, перекрёстные ссылки.",
  },
  {
    topic: "Одноэтажные дома",
    primaryPage: "/odnoetazhnye-doma-pod-klyuch",
    supportingPages: ["/catalog/kategoriya/odnoetazhnye"],
    risk: "medium",
    solution: "Услуга + объяснение vs каталог одноэтажных проектов.",
  },
  {
    topic: "Двухэтажные дома",
    primaryPage: "/dvuhetazhnye-doma-pod-klyuch",
    supportingPages: ["/catalog/kategoriya/dvukhetazhnye"],
    risk: "medium",
    solution: "Аналогично одноэтажным.",
  },
  {
    topic: "Дом до 10 млн",
    primaryPage: "/doma-pod-klyuch-do-10-mln",
    supportingPages: ["/catalog/kategoriya/do-10-mln", "/calculator"],
    risk: "low",
    solution: "Коммерческая про бюджет. Категория — проекты с фильтром цены.",
  },
  {
    topic: "Стоимость / цена дома",
    primaryPage: "/calculator",
    supportingPages: ["/smeta-na-stroitelstvo-doma", "/blog/stoimost-stroitelstva-2026"],
    risk: "low",
    solution: "Калькулятор — transactional. Смета — trust. Статья — informational.",
  },
];

/** Лид-магниты по кластерам */
export const leadMagnetsByCluster: Record<
  string,
  { title: string; cta: string; collectFields: string[]; useOn: string[] }[]
> = {
  cost: [
    {
      title: "Предварительный расчёт стоимости",
      cta: "Рассчитать в калькуляторе",
      collectFields: ["area", "material", "phone"],
      useOn: ["/calculator", "/smeta-na-stroitelstvo-doma", "cost-articles"],
    },
    {
      title: "Чек-лист «Что влияет на цену дома»",
      cta: "Получить чек-лист",
      collectFields: ["name", "phone", "email"],
      useOn: ["cost-articles"],
    },
  ],
  land: [
    {
      title: "Чек-лист проверки участка",
      cta: "Получить чек-лист",
      collectFields: ["name", "phone"],
      useOn: ["land-articles", "/stroitelstvo-domov-v-irkutskoy-oblasti"],
    },
    {
      title: "Разбор участка специалистом",
      cta: "Отправить вводные участка",
      collectFields: ["name", "phone", "comment"],
      useOn: ["/stroitelstvo-domov-v-irkutskoy-oblasti"],
    },
  ],
  projects: [
    {
      title: "Подборка проектов под бюджет",
      cta: "Подобрать проект",
      collectFields: ["name", "phone", "area", "comment"],
      useOn: ["/catalog", "/doma-pod-klyuch-do-10-mln"],
    },
  ],
  planning: [
    {
      title: "Разбор планировки",
      cta: "Отправить планировку специалисту",
      collectFields: ["name", "phone", "comment"],
      useOn: ["/planirovka"],
    },
  ],
  materials: [
    {
      title: "Сравнение технологий под ваш участок",
      cta: "Обсудить выбор материала",
      collectFields: ["name", "phone", "comment"],
      useOn: ["comparison-articles", "material-service-pages"],
    },
  ],
  mortgage: [
    {
      title: "Список строительных вводных для банка",
      cta: "Получить консультацию",
      collectFields: ["name", "phone"],
      useOn: ["/stroitelstvo-doma-v-ipoteku"],
    },
  ],
  mistakes: [
    {
      title: "Чек-лист «10 ошибок при строительстве дома»",
      cta: "Получить чек-лист",
      collectFields: ["name", "phone"],
      useOn: ["mistakes-articles"],
    },
  ],
};

export function getAnchorsForGroup(groupId: string): string[] {
  return anchorGroups.find((g) => g.id === groupId)?.anchors ?? [];
}
