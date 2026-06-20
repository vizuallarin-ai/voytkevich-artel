import type { ContentAnalyticsSource } from "@/types/content-analytics";

export type AnalyticsSourceStatus = "connected" | "configured" | "unavailable" | "manual" | "future";

export type AnalyticsSourceDefinition = {
  id: ContentAnalyticsSource;
  title: string;
  status: AnalyticsSourceStatus;
  supportedMetrics: string[];
  authenticationRequired: boolean;
  refreshMode: "realtime" | "hourly" | "daily" | "manual" | "none";
  lastSuccessfulSync: string | null;
  lastError: string | null;
  limitations: string[];
};

const YM_ID = process.env.NEXT_PUBLIC_YM_ID ? Number(process.env.NEXT_PUBLIC_YM_ID) : 0;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
const GSC_CREDENTIALS = Boolean(process.env.GSC_CREDENTIALS_JSON || process.env.GOOGLE_SEARCH_CONSOLE_KEY);
const YANDEX_WEBMASTER = Boolean(process.env.YANDEX_WEBMASTER_TOKEN);

const sourceDefinitions: AnalyticsSourceDefinition[] = [
  {
    id: "internal",
    title: "Внутренние события",
    status: "connected",
    supportedMetrics: [
      "pageViews",
      "sessions",
      "ctaClicks",
      "formStarts",
      "formSubmissions",
      "leads",
    ],
    authenticationRequired: false,
    refreshMode: "realtime",
    lastSuccessfulSync: null,
    lastError: null,
    limitations: ["Только first-party события сайта", "Без внешнего search demand"],
  },
  {
    id: "yandex-metrica",
    title: "Яндекс Метрика",
    status: YM_ID ? "configured" : "unavailable",
    supportedMetrics: ["pageViews", "sessions", "users", "bounceRate", "engagement"],
    authenticationRequired: true,
    refreshMode: YM_ID ? "daily" : "none",
    lastSuccessfulSync: null,
    lastError: YM_ID ? null : "NEXT_PUBLIC_YM_ID не настроен",
    limitations: ["Требует OAuth/API credentials для server-side sync"],
  },
  {
    id: "google-analytics",
    title: "Google Analytics",
    status: GA_ID ? "configured" : "unavailable",
    supportedMetrics: ["pageViews", "sessions", "users", "engagedSessions"],
    authenticationRequired: true,
    refreshMode: GA_ID ? "daily" : "none",
    lastSuccessfulSync: null,
    lastError: GA_ID ? null : "NEXT_PUBLIC_GA_ID не настроен",
    limitations: ["Server-side import требует GA4 Data API credentials"],
  },
  {
    id: "google-search-console",
    title: "Google Search Console",
    status: GSC_CREDENTIALS ? "configured" : "unavailable",
    supportedMetrics: ["impressions", "clicks", "ctr", "averagePosition", "indexed"],
    authenticationRequired: true,
    refreshMode: GSC_CREDENTIALS ? "daily" : "none",
    lastSuccessfulSync: null,
    lastError: GSC_CREDENTIALS ? null : "GSC credentials не настроены",
    limitations: ["Search metrics недоступны без API", "Задержка данных 2–3 дня"],
  },
  {
    id: "yandex-webmaster",
    title: "Яндекс Вебмастер",
    status: YANDEX_WEBMASTER ? "configured" : "unavailable",
    supportedMetrics: ["impressions", "clicks", "ctr", "averagePosition", "indexed"],
    authenticationRequired: true,
    refreshMode: YANDEX_WEBMASTER ? "daily" : "none",
    lastSuccessfulSync: null,
    lastError: YANDEX_WEBMASTER ? null : "YANDEX_WEBMASTER_TOKEN не настроен",
    limitations: ["Search metrics недоступны без API"],
  },
  {
    id: "crm",
    title: "CRM / Leads",
    status: "connected",
    supportedMetrics: ["leads", "qualifiedLeads", "deals", "leadStatuses", "revenue"],
    authenticationRequired: false,
    refreshMode: "realtime",
    lastSuccessfulSync: null,
    lastError: null,
    limitations: ["Revenue null без явных данных о сделках", "Qualified ≠ form submit"],
  },
  {
    id: "manual-import",
    title: "Ручной CSV import",
    status: "manual",
    supportedMetrics: ["impressions", "clicks", "cost", "revenue"],
    authenticationRequired: false,
    refreshMode: "manual",
    lastSuccessfulSync: null,
    lastError: null,
    limitations: ["Требует валидации и idempotency key"],
  },
  {
    id: "future-api",
    title: "Future API",
    status: "future",
    supportedMetrics: [],
    authenticationRequired: true,
    refreshMode: "none",
    lastSuccessfulSync: null,
    lastError: null,
    limitations: ["Placeholder для будущих интеграций"],
  },
];

const syncState = new Map<ContentAnalyticsSource, { lastSuccessfulSync: string | null; lastError: string | null }>();

export const analyticsSourceRegistry = {
  list(): AnalyticsSourceDefinition[] {
    return sourceDefinitions.map((def) => {
      const state = syncState.get(def.id);
      return {
        ...def,
        lastSuccessfulSync: state?.lastSuccessfulSync ?? def.lastSuccessfulSync,
        lastError: state?.lastError ?? def.lastError,
      };
    });
  },

  get(id: ContentAnalyticsSource): AnalyticsSourceDefinition | undefined {
    return this.list().find((s) => s.id === id);
  },

  isAvailable(id: ContentAnalyticsSource): boolean {
    const def = this.get(id);
    return def?.status === "connected" || def?.status === "configured" || def?.status === "manual";
  },

  supportsMetric(id: ContentAnalyticsSource, metric: string): boolean {
    return this.get(id)?.supportedMetrics.includes(metric) ?? false;
  },

  recordSyncSuccess(id: ContentAnalyticsSource): void {
    syncState.set(id, { lastSuccessfulSync: new Date().toISOString(), lastError: null });
  },

  recordSyncError(id: ContentAnalyticsSource, error: string): void {
    const prev = syncState.get(id);
    syncState.set(id, {
      lastSuccessfulSync: prev?.lastSuccessfulSync ?? null,
      lastError: error,
    });
  },
};

export function getConnectedSources(): ContentAnalyticsSource[] {
  return analyticsSourceRegistry
    .list()
    .filter((s) => s.status === "connected" || s.status === "configured")
    .map((s) => s.id);
}

export function getUnavailableSources(): AnalyticsSourceDefinition[] {
  return analyticsSourceRegistry.list().filter((s) => s.status === "unavailable");
}
