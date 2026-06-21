import { searchStore } from "@/lib/search/search-store";
import { searchQualityService } from "@/lib/search/search-quality-service";

type PaginationInput = {
  page?: number;
  pageSize?: number;
  maxPageSize?: number;
};

function normalizePagination(input: PaginationInput = {}) {
  const page = Math.max(1, input.page ?? 1);
  const maxPageSize = input.maxPageSize ?? 100;
  const pageSize = Math.max(1, Math.min(input.pageSize ?? 20, maxPageSize));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

function paginate<T>(rows: T[], input: PaginationInput = {}) {
  const { page, pageSize, offset } = normalizePagination(input);
  return {
    page,
    pageSize,
    total: rows.length,
    items: rows.slice(offset, offset + pageSize),
  };
}

export async function getMainSearchDashboardData() {
  const quality = searchQualityService.calculateSearchQuality();
  const activeIndex = searchStore.getActiveIndexVersion();

  return {
    quality,
    overview: {
      indexedDocuments: searchStore.listDocuments().length,
      indexedChunks: searchStore.listChunks().length,
      activeIndexVersion: activeIndex?.version ?? null,
      queuedFeedback: searchStore.listFeedback("queued").length,
      openZeroResults: searchStore.listZeroResultRecords().filter((record) => record.status === "open").length,
    },
  };
}

export async function getIndexDashboardData(options: PaginationInput = {}) {
  const versions = searchStore.listIndexVersions();
  const jobs = searchStore.listIndexingJobs();
  return {
    versions: paginate(versions, { ...options, maxPageSize: 50 }),
    jobs: paginate(jobs, { ...options, maxPageSize: 100 }),
    activeVersion: searchStore.getActiveIndexVersion(),
  };
}

export async function getQueriesDashboardData(options: PaginationInput = {}) {
  const logs = searchStore.listQueryLogs(5000);
  const grouped = new Map<string, { normalizedQuery: string; count: number; zeroResults: number; lastSeenAt: string }>();

  for (const log of logs) {
    const current = grouped.get(log.normalizedQuery) ?? {
      normalizedQuery: log.normalizedQuery,
      count: 0,
      zeroResults: 0,
      lastSeenAt: log.createdAt,
    };
    current.count += 1;
    current.zeroResults += log.resultCount === 0 ? 1 : 0;
    if (log.createdAt > current.lastSeenAt) current.lastSeenAt = log.createdAt;
    grouped.set(log.normalizedQuery, current);
  }

  const rows = [...grouped.values()].sort((a, b) => b.count - a.count);
  return paginate(rows, { ...options, maxPageSize: 200 });
}

export async function getZeroResultsDashboardData(options: PaginationInput = {}) {
  const rows = searchStore.listZeroResultRecords();
  return paginate(rows, { ...options, maxPageSize: 200 });
}

export async function getQualityDashboardData() {
  const quality = searchQualityService.calculateSearchQuality();
  return { quality };
}

export async function getRAGDashboardData() {
  const { ragQualityService } = await import("@/lib/ai-navigation/rag-quality-service");
  const report = ragQualityService.buildRAGQualityReport();
  const injectionEvents = searchStore
    .listAnalyticsEvents(500)
    .filter((event) => event.eventName.includes("injection") || event.eventName.includes("prompt_injection"));
  return { report, injectionAttempts: injectionEvents.length };
}

export async function getAssistantDashboardData() {
  const events = searchStore.listAnalyticsEvents(2000);
  const assistantEvents = events.filter((event) => event.eventName.startsWith("navigation_assistant"));
  const sessions = searchStore.listSessionMemories();
  return {
    sessionCount: sessions.length,
    eventCount: assistantEvents.length,
    recentSessions: sessions.slice(0, 20).map((memory) => ({
      sessionId: memory.sessionId.slice(0, 8) + "…",
      intent: memory.intent,
      buildingType: memory.buildingType,
      updatedAt: memory.updatedAt,
    })),
  };
}

export async function getContentGapsDashboardData(options: PaginationInput = {}) {
  const gaps = searchStore
    .listZeroResultRecords()
    .filter((record) => record.status === "open")
    .map((record) => ({
      id: record.id,
      normalizedQuery: record.normalizedQuery,
      frequency: record.frequency,
      commercialRelevance: record.commercialRelevance,
      status: record.status,
      lastSeenAt: record.lastSeenAt,
    }));
  return paginate(gaps, { ...options, maxPageSize: 200 });
}

export const searchDashboardService = {
  getMainSearchDashboardData,
  getIndexDashboardData,
  getQueriesDashboardData,
  getZeroResultsDashboardData,
  getQualityDashboardData,
  getRAGDashboardData,
  getAssistantDashboardData,
  getContentGapsDashboardData,
};
