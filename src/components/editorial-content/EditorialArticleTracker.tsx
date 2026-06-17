"use client";

import { useEffect } from "react";
import type { EditorialContentItem } from "@/types/editorial-content";
import {
  buildEditorialAnalyticsPayload,
  trackEditorialArticleViewed,
} from "@/lib/editorial-content/editorial-analytics";

export function EditorialArticleTracker({ item }: { item: EditorialContentItem }) {
  useEffect(() => {
    trackEditorialArticleViewed(buildEditorialAnalyticsPayload(item));
  }, [item]);

  return null;
}
