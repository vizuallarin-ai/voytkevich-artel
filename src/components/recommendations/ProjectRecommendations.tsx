"use client";

import { useEffect, useState } from "react";
import type { RecommendationItem } from "@/types/recommendation";
import { cn } from "@/lib/utils";
import { Home } from "lucide-react";
import { RecommendationCard } from "./RecommendationCard";
import { RecommendationEmptyState } from "./RecommendationEmptyState";

type ProjectRecommendationsProps = {
  sessionId?: string;
  contentItemId?: string;
  canonicalUrl?: string;
  title?: string;
  className?: string;
};

export function ProjectRecommendations({
  sessionId,
  contentItemId,
  canonicalUrl,
  title = "Похожие проекты",
  className,
}: ProjectRecommendationsProps) {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [resolvedSessionId, setResolvedSessionId] = useState(sessionId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (sessionId) params.set("sessionId", sessionId);
    if (contentItemId) params.set("contentItemId", contentItemId);
    if (canonicalUrl) params.set("canonicalUrl", canonicalUrl);

    setLoading(true);
    fetch(`/api/recommendations/projects?${params.toString()}`)
      .then((r) => r.json())
      .then((json: { items: RecommendationItem[]; sessionId?: string }) => {
        setItems(json.items ?? []);
        if (json.sessionId) setResolvedSessionId(json.sessionId);
      })
      .finally(() => setLoading(false));
  }, [sessionId, contentItemId, canonicalUrl]);

  if (loading) return <p className="text-sm text-muted">Загрузка проектов…</p>;
  if (!items.length) return <RecommendationEmptyState title="Нет похожих проектов" className={className} />;

  return (
    <section className={cn("space-y-4", className)} aria-label={title}>
      <div className="flex items-center gap-2">
        <Home className="h-5 w-5 text-muted" aria-hidden />
        <h2 className="heading-section text-2xl">{title}</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <RecommendationCard
            key={item.recommendationId}
            item={item}
            placement="project-similar"
            sessionId={resolvedSessionId}
          />
        ))}
      </div>
    </section>
  );
}
