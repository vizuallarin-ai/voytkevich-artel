"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordAnalyticsEvent, inferPageType } from "@/lib/analytics/capture-client";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/dashboard")) return;

    recordAnalyticsEvent({
      name: "page_viewed",
      category: "page",
      page: {
        path: pathname,
        pageType: inferPageType(pathname),
        pageTitle: typeof document !== "undefined" ? document.title : undefined,
      },
    });
  }, [pathname]);

  return null;
}
