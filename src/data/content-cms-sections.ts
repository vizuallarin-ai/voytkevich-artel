export type CMSSection = {
  id: string;
  title: string;
  description: string;
  route: string;
  icon?: string;
};

export const contentCmsSections: CMSSection[] = [
  {
    id: "overview",
    title: "Обзор",
    description: "KPI и очередь контента",
    route: "/dashboard/content",
  },
  {
    id: "items",
    title: "Все материалы",
    description: "Единый список",
    route: "/dashboard/content/items",
  },
  {
    id: "programmatic",
    title: "Programmatic SEO",
    description: "Страницы проектов и таксономия",
    route: "/dashboard/content/programmatic",
  },
  {
    id: "technical",
    title: "Технические статьи",
    description: "How-to и гайды",
    route: "/dashboard/content/technical",
  },
  {
    id: "editorial",
    title: "Редакционный блог",
    description: "Истории, новости, дайджесты",
    route: "/dashboard/content/editorial",
  },
  {
    id: "authors",
    title: "Авторы",
    description: "Эксперты и персонажи",
    route: "/dashboard/content/authors",
  },
  {
    id: "rubrics",
    title: "Рубрики",
    description: "Кластеры и рубрики",
    route: "/dashboard/content/rubrics",
  },
  {
    id: "queue",
    title: "Очередь",
    description: "Публикации по приоритету",
    route: "/dashboard/content/queue",
  },
  {
    id: "review",
    title: "Review",
    description: "Материалы на проверке",
    route: "/dashboard/content/review",
  },
  {
    id: "quality",
    title: "Quality",
    description: "Blockers и warnings",
    route: "/dashboard/content/quality",
  },
  {
    id: "indexing",
    title: "Indexing",
    description: "Index/noindex/canonical",
    route: "/dashboard/content/indexing",
  },
  {
    id: "sources",
    title: "Источники",
    description: "Sources и fact-check",
    route: "/dashboard/content/sources",
  },
  {
    id: "settings",
    title: "Настройки",
    description: "CMS configuration",
    route: "/dashboard/content/settings",
  },
];
