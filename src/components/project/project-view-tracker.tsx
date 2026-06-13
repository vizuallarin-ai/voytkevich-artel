"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { recordAnalyticsEvent } from "@/lib/analytics/capture-client";

export function ProjectViewTracker({ slug }: { slug: string }) {
  const { add } = useRecentlyViewed();

  useEffect(() => {
    add(slug);
    recordAnalyticsEvent({
      name: "project_viewed",
      category: "project",
      page: { path: `/catalog/${slug}`, pageType: "project-page", pageSlug: slug },
      context: { projectSlug: slug },
    });
  }, [slug, add]);

  return null;
}
