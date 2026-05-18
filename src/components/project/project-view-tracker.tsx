"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export function ProjectViewTracker({ slug }: { slug: string }) {
  const { add } = useRecentlyViewed();

  useEffect(() => {
    add(slug);
  }, [slug, add]);

  return null;
}
