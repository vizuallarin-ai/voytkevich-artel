import type { UrlLifecycleStatus } from "@/types/url-lifecycle";
import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";
import type { IndexabilityDecision } from "@/types/seo-indexation";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";

export type UrlLifecycleState = {
  url: string;
  pageId: string;
  status: UrlLifecycleStatus;
  previousStatus?: UrlLifecycleStatus;
  updatedAt: string;
  notes?: string;
};

const lifecycleStore = new Map<string, UrlLifecycleState>();

function statusFromPage(page: IndexablePageInput, decision: IndexabilityDecision): UrlLifecycleStatus {
  if (page.status === "archived") return "archived";
  if (page.status === "rejected") return "removed";
  if (decision.canonicalUrl && decision.canonicalUrl !== page.url) return "canonicalized-away";
  if (decision.status === "blocked") return "deindexed";
  if (decision.indexable && decision.sitemap) return "sitemap-listed";
  if (decision.indexable) return "indexable";
  if (page.status === "published") return "published";
  if (page.status === "approved") return "approved";
  if (page.status === "review") return "review";
  if (page.status === "draft" || page.status === "ai-generated") return "draft";
  return "planned";
}

export function deriveUrlLifecycleStatus(
  page: IndexablePageInput,
  decision?: IndexabilityDecision,
): UrlLifecycleStatus {
  return statusFromPage(page, decision ?? evaluateIndexability(page));
}

export function updateUrlLifecycle(page: IndexablePageInput): UrlLifecycleState {
  const decision = evaluateIndexability(page);
  const status = statusFromPage(page, decision);
  const previous = lifecycleStore.get(page.id);

  const state: UrlLifecycleState = {
    url: page.url,
    pageId: page.id,
    status,
    previousStatus: previous?.status,
    updatedAt: new Date().toISOString(),
    notes: decision.message,
  };

  lifecycleStore.set(page.id, state);
  return state;
}

export function getUrlLifecycle(pageId: string): UrlLifecycleState | undefined {
  return lifecycleStore.get(pageId);
}

export function listUrlLifecycles(): UrlLifecycleState[] {
  return [...lifecycleStore.values()];
}

export function getPagesByLifecycleStatus(status: UrlLifecycleStatus): UrlLifecycleState[] {
  return listUrlLifecycles().filter((s) => s.status === status);
}
