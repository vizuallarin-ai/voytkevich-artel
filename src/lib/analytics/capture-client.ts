"use client";

import type { AnalyticsEvent } from "@/types/analytics";
import { getOrCreateSessionId } from "@/lib/analytics/session";
import { getStoredUtm, getAttributionData } from "@/lib/analytics/utm";

export async function recordAnalyticsEvent(
  event: Omit<AnalyticsEvent, "timestamp" | "sessionId"> & { timestamp?: string },
): Promise<void> {
  if (typeof window === "undefined") return;

  const utm = getStoredUtm();
  const attribution = getAttributionData();

  const payload: AnalyticsEvent = {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
    sessionId: getOrCreateSessionId(),
    source: {
      utmSource: utm.source,
      utmMedium: utm.medium,
      utmCampaign: utm.campaign,
      utmContent: utm.content,
      utmTerm: utm.term,
      referrer: attribution.referrer,
      landingPage: attribution.landingPage,
      ...event.source,
    },
    page: {
      path: window.location.pathname,
      currentUrl: window.location.pathname + window.location.search,
      referrer: document.referrer || undefined,
      ...event.page,
    },
  };

  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    /* silent */
  }
}

export function inferPageType(path: string): string {
  if (path === "/") return "home";
  if (path.startsWith("/catalog/kategoriya")) return "catalog-category";
  if (path.startsWith("/catalog/")) return "project-page";
  if (path === "/catalog") return "catalog";
  if (path === "/calculator") return "calculator";
  if (path === "/planirovka") return "planner";
  if (path.startsWith("/blog/category")) return "blog-category";
  if (path.startsWith("/blog/")) return "blog-post";
  if (path === "/blog") return "blog";
  if (path.startsWith("/cases/category")) return "case-category";
  if (path.startsWith("/cases/")) return "case-page";
  if (path === "/cases") return "cases";
  if (path.startsWith("/objects-map/")) return "objects-map-area";
  if (path === "/objects-map") return "objects-map";
  if (["/about", "/process", "/faq", "/privacy"].includes(path)) return path.slice(1);
  return "service-page";
}
