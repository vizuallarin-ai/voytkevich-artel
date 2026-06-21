"use client";

import { useEffect, useState } from "react";
import type { RecommendationItem } from "@/types/recommendation";
import { cn } from "@/lib/utils";
import { RecommendationCard } from "./RecommendationCard";
import { RecommendationEmptyState } from "./RecommendationEmptyState";

type RecommendationBlockProps = {
  placement: string;
  sessionId?: string;
  contentItemId?: string;
  canonicalUrl?: string;
  title?: string;
  className?: string;
};

type ApiResponse = {
  requestId: string;
  sessionId?: string;
  items: RecommendationItem[];
  count: number;
};

export function RecommendationBlock({
  placement,
  sessionId,
  contentItemId,
  canonicalUrl,
  title = "Рекомендуем",
  className,
}: RecommendationBlockProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ placement });
    if (sessionId) params.set("sessionId", sessionId);
    if (contentItemId) params.set("contentItemId", contentItemId);
    if (canonicalUrl) params.set("canonicalUrl", canonicalUrl);

    setLoading(true);
    fetch(`/api/recommendations?${params.toString()}`)
      .then((r) => r.json())
      .then((json: ApiResponse) => setData(json))
      .finally(() => setLoading(false));
  }, [placement, sessionId, contentItemId, canonicalUrl]);

  if (loading) {
    return <p className="text-sm text-muted">Загрузка рекомендаций…</p>;
  }

  if (!data?.items?.length) {
    return <RecommendationEmptyState className={className} />;
  }

  return (
    <section className={cn("space-y-4", className)} aria-label={title}>
      <h2 className="heading-section text-2xl">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.items.map((item) => (
          <RecommendationCard
            key={item.recommendationId}
            item={item}
            placement={placement}
            sessionId={data.sessionId ?? sessionId}
          />
        ))}
      </div>
    </section>
  );
}
