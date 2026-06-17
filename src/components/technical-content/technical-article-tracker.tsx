"use client";

import { useEffect } from "react";
import type { TechnicalArticle } from "@/types/technical-content";
import { trackTechnicalArticleViewed } from "@/lib/technical-content/technical-analytics";

export function TechnicalArticleTracker({ article }: { article: TechnicalArticle }) {
  useEffect(() => {
    trackTechnicalArticleViewed({
      articleSlug: article.slug,
      articleType: article.type,
      clusterId: article.clusterId,
      currentUrl: article.url,
    });
  }, [article]);

  return null;
}
