import type { KeywordDemandSource } from "@/types/keyword-demand";

export type DataSourceStatus = "active" | "manual" | "future" | "needs-api";

export type DataSourceDefinition = {
  id: KeywordDemandSource;
  title: string;
  status: DataSourceStatus;
  supportedMetrics: string[];
  notes: string;
};

export const dataSourceRegistry: DataSourceDefinition[] = [
  {
    id: "manual",
    title: "Ручной ввод",
    status: "active",
    supportedMetrics: ["searchVolume", "intent", "region"],
    notes: "Ручное добавление ключей в dashboard",
  },
  {
    id: "csv-import",
    title: "CSV import",
    status: "active",
    supportedMetrics: ["searchVolume", "impressions", "clicks", "ctr", "avgPosition", "difficulty", "competition"],
    notes: "Импорт через textarea paste MVP",
  },
  {
    id: "yandex-wordstat",
    title: "Яндекс Wordstat",
    status: "needs-api",
    supportedMetrics: ["searchVolume", "region"],
    notes: "TODO: API integration when keys available",
  },
  {
    id: "google-search-console",
    title: "Google Search Console",
    status: "needs-api",
    supportedMetrics: ["impressions", "clicks", "ctr", "avgPosition"],
    notes: "TODO: OAuth + Search Analytics API",
  },
  {
    id: "yandex-webmaster",
    title: "Яндекс Вебмастер",
    status: "needs-api",
    supportedMetrics: ["impressions", "clicks", "avgPosition"],
    notes: "TODO: Yandex Webmaster API",
  },
  {
    id: "serpstat",
    title: "Serpstat",
    status: "future",
    supportedMetrics: ["searchVolume", "keywordDifficulty", "competition"],
    notes: "Future export/API",
  },
  {
    id: "ahrefs",
    title: "Ahrefs",
    status: "future",
    supportedMetrics: ["searchVolume", "keywordDifficulty"],
    notes: "Future CSV/API",
  },
  {
    id: "semrush",
    title: "Semrush",
    status: "future",
    supportedMetrics: ["searchVolume", "keywordDifficulty", "competition"],
    notes: "Future CSV/API",
  },
  {
    id: "competitor-research",
    title: "Competitor research",
    status: "manual",
    supportedMetrics: ["intent", "cluster"],
    notes: "Ручной анализ конкурентов",
  },
  {
    id: "future-api",
    title: "Future API",
    status: "future",
    supportedMetrics: [],
    notes: "Placeholder for unified API",
  },
];

export function getDataSource(id: KeywordDemandSource): DataSourceDefinition | undefined {
  return dataSourceRegistry.find((d) => d.id === id);
}
