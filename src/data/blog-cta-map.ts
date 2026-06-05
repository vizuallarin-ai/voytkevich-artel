export type BlogCtaPair = {
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

const blogSource = (cluster: string) => `source=blog&cluster=${cluster}`;

export const blogCtaByCluster: Record<string, BlogCtaPair> = {
  cost: {
    primary: { label: "Рассчитать стоимость дома", href: `/calculator?${blogSource("cost")}` },
    secondary: { label: "Получить предварительную смету", href: "/smeta-na-stroitelstvo-doma" },
  },
  estimate: {
    primary: { label: "Получить предварительную смету", href: "/smeta-na-stroitelstvo-doma" },
    secondary: { label: "Рассчитать стоимость", href: `/calculator?${blogSource("estimate")}` },
  },
  materials: {
    primary: { label: "Сравнить материалы на проекте", href: `/calculator?${blogSource("materials")}` },
    secondary: { label: "Смотреть проекты", href: "/catalog" },
  },
  comparisons: {
    primary: { label: "Рассчитать варианты", href: `/calculator?${blogSource("materials")}` },
    secondary: { label: "Обсудить выбор материала", href: "#blog-lead" },
  },
  foundation: {
    primary: { label: "Проверить вводные участка", href: "/stroitelstvo-domov-v-irkutskoy-oblasti" },
    secondary: { label: "Рассчитать дом с учётом участка", href: `/calculator?${blogSource("foundation-land")}` },
  },
  land: {
    primary: { label: "Проверить вводные участка", href: "/stroitelstvo-domov-v-irkutskoy-oblasti" },
    secondary: { label: "Получить чек-лист участка", href: "#blog-lead" },
  },
  "foundation-land": {
    primary: { label: "Проверить вводные участка", href: "/stroitelstvo-domov-v-irkutskoy-oblasti" },
    secondary: { label: "Рассчитать дом", href: `/calculator?${blogSource("foundation-land")}` },
  },
  planning: {
    primary: { label: "Собрать планировку", href: `/planirovka?${blogSource("planning")}` },
    secondary: { label: "Подобрать проект", href: "/catalog" },
  },
  projects: {
    primary: { label: "Подобрать проект", href: "/catalog" },
    secondary: { label: "Собрать планировку", href: `/planirovka?${blogSource("planning")}` },
  },
  floors: {
    primary: { label: "Собрать планировку", href: `/planirovka?${blogSource("planning")}` },
    secondary: { label: "Смотреть проекты", href: "/catalog" },
  },
  contract: {
    primary: { label: "Посмотреть процесс строительства", href: "/process" },
    secondary: { label: "Обсудить строительство", href: "#blog-lead" },
  },
  mortgage: {
    primary: { label: "Обсудить строительство в ипотеку", href: "/stroitelstvo-doma-v-ipoteku" },
    secondary: { label: "Подобрать проект для расчёта", href: "/catalog" },
  },
  mistakes: {
    primary: { label: "Разобрать мой случай", href: "#blog-lead" },
    secondary: { label: "Рассчитать стоимость", href: `/calculator?${blogSource("mistakes")}` },
  },
  turnkey: {
    primary: { label: "Получить предварительный расчёт", href: `/calculator?${blogSource("turnkey")}` },
    secondary: { label: "Строительство под ключ", href: "/stroitelstvo-domov-pod-klyuch-irkutsk" },
  },
};

/** Map category slug to cluster for CTA lookup */
export const categoryToCluster: Record<string, string> = {
  cost: "cost",
  materials: "materials",
  "foundation-land": "foundation-land",
  "planning-projects": "planning",
  "estimate-contract-control": "estimate",
  "mortgage-documents": "mortgage",
  mistakes: "mistakes",
  "cases-experience": "projects",
};

export function getBlogCta(clusterId: string, categorySlug?: string): BlogCtaPair {
  return (
    blogCtaByCluster[clusterId] ??
    blogCtaByCluster[categoryToCluster[categorySlug ?? ""] ?? ""] ?? {
      primary: { label: "Рассчитать стоимость дома", href: `/calculator?${blogSource("cost")}` },
      secondary: { label: "Смотреть проекты", href: "/catalog" },
    }
  );
}
