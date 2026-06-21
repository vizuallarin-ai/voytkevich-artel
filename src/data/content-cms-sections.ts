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
    id: "prioritization",
    title: "Приоритизация",
    description: "Семантика, score P1–P5, очередь",
    route: "/dashboard/content/prioritization",
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Контент → SEO → лиды → ROI, feedback loops",
    route: "/dashboard/content/analytics",
  },
  {
    id: "refresh",
    title: "Refresh",
    description: "Обновление контента, briefs, review, rollback",
    route: "/dashboard/content/refresh",
  },
  {
    id: "experiments",
    title: "Experiments",
    description: "SEO/CTA эксперименты с guardrails",
    route: "/dashboard/content/experiments",
  },
  {
    id: "knowledge-graph",
    title: "Knowledge Graph",
    description: "Сущности, связи, pillar-cluster, валидация графа",
    route: "/dashboard/content/knowledge-graph",
  },
  {
    id: "internal-linking",
    title: "Internal Linking",
    description: "Перелинковка, orphans, batch review и rollback",
    route: "/dashboard/content/internal-linking",
  },
  {
    id: "search",
    title: "Search",
    description: "Hybrid search, index, queries, RAG assistant analytics",
    route: "/dashboard/search",
  },
  {
    id: "recommendations",
    title: "Recommendations",
    description: "Personalization, rules, quality, privacy и review queue",
    route: "/dashboard/recommendations",
  },
  {
    id: "calendar",
    title: "Календарь",
    description: "Планировщик публикаций и очередь",
    route: "/dashboard/content/calendar",
  },
  {
    id: "queue",
    title: "Очередь",
    description: "Публикации по приоритету (список)",
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
    id: "ai-generate",
    title: "AI-генерация",
    description: "Контент-завод — черновики без автопубликации",
    route: "/dashboard/content/generate",
  },
  {
    id: "ai-history",
    title: "История AI",
    description: "Лог генераций и validation",
    route: "/dashboard/content/ai-history",
  },
  {
    id: "distribution",
    title: "Дистрибуция",
    description: "Teaser-публикации на внешние площадки",
    route: "/dashboard/content/distribution",
  },
  {
    id: "visuals",
    title: "Визуалы",
    description: "Visual assets, шаблоны обложек и prompt builder",
    route: "/dashboard/content/visuals",
  },
  {
    id: "settings",
    title: "Настройки",
    description: "CMS configuration",
    route: "/dashboard/content/settings",
  },
];
