"use client";

import { useEffect, useState } from "react";
import type { RecommendationItem } from "@/types/recommendation";
import { cn } from "@/lib/utils";
import { RecommendationCard } from "./RecommendationCard";
import { RecommendationEmptyState } from "./RecommendationEmptyState";

type RelatedContentRecommendationsProps = {
  contentItemId: string;
  sessionId?: string;
  canonicalUrl?: string;
  title?: string;
  className?: string;
};

export function RelatedContentRecommendations({
  contentItemId,
  sessionId,
  canonicalUrl,
  title = "Связанные материалы",
  className,
}: RelatedContentRecommendationsProps) {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [resolvedSessionId, setResolvedSessionId] = useState(sessionId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ contentItemId });
    if (sessionId) params.set("sessionId", sessionId);
    if (canonicalUrl) params.set("canonicalUrl", canonicalUrl);

    setLoading(true);
    fetch(`/api/recommendations/related?${params.toString()}`)
      .then((r) => r.json())
      .then((json: { items: RecommendationItem[]; sessionId?: string }) => {
        setItems(json.items ?? []);
        if (json.sessionId) setResolvedSessionId(json.sessionId);
      })
      .finally(() => setLoading(false));
  }, [contentItemId, sessionId, canonicalUrl]);

  if (loading) return <p className="text-sm text-muted">Загрузка связанных материалов…</p>;
  if (!items.length) return <RecommendationEmptyState title="Нет связанных материалов" className={className} />;

  return (
    <section className={cn("space-y-4", className)} aria-label={title}>
      <h2 className="heading-section text-2xl">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <RecommendationCard
            key={item.recommendationId}
            item={item}
            placement="article-related"
            sessionId={resolvedSessionId}
          />
        ))}
      </div>
    </section>
  );
}
