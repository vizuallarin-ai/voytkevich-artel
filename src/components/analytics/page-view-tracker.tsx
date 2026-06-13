"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordAnalyticsEvent, inferPageType } from "@/lib/analytics/capture-client";
import { getTypedPageView } from "@/lib/analytics/typed-page-views";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/dashboard")) return;

    const pageType = inferPageType(pathname);

    recordAnalyticsEvent({
      name: "page_viewed",
      category: "page",
      page: {
        path: pathname,
        pageType,
        pageTitle: typeof document !== "undefined" ? document.title : undefined,
      },
    });

    const typed = getTypedPageView(pathname);
    if (typed) {
      recordAnalyticsEvent({
        name: typed.name,
        category: typed.category,
        page: { path: pathname, pageType, pageSlug: typed.pageSlug },
        context: typed.context,
      });
    }
  }, [pathname]);

  return null;
}
