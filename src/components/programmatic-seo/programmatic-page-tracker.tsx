"use client";

import { useEffect } from "react";
import type { ProgrammaticPageData } from "@/types/programmatic-page-template";
import { trackProgrammaticPageViewed } from "@/lib/programmatic-seo/programmatic-analytics";

export function ProgrammaticPageTracker({ page }: { page: ProgrammaticPageData }) {
  useEffect(() => {
    trackProgrammaticPageViewed({
      pageType: page.analytics.pageType,
      pageSlug: page.analytics.pageSlug,
      templateType: page.templateType,
      objectTypeId: page.taxonomy.objectTypeId,
      materialId: page.taxonomy.materialId,
      sizeId: page.taxonomy.sizeId,
      featureId: page.taxonomy.featureId,
      regionId: page.taxonomy.regionId,
      intentId: page.taxonomy.intentId,
      matchedProjectsCount: page.projects.matched.length,
    });
  }, [page]);

  return null;
}
