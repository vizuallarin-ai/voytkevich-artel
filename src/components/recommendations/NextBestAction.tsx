"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextBestAction } from "@/types/next-best-action";
import { cn } from "@/lib/utils";
import { ChevronRight, Zap } from "lucide-react";
import { RecommendationExplanation } from "./RecommendationExplanation";
import { RecommendationEmptyState } from "./RecommendationEmptyState";

type NextBestActionProps = {
  sessionId?: string;
  contentItemId?: string;
  canonicalUrl?: string;
  title?: string;
  className?: string;
};

export function NextBestAction({
  sessionId,
  contentItemId,
  canonicalUrl,
  title = "Что сделать дальше",
  className,
}: NextBestActionProps) {
  const [actions, setActions] = useState<NextBestAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (sessionId) params.set("sessionId", sessionId);
    if (contentItemId) params.set("contentItemId", contentItemId);
    if (canonicalUrl) params.set("canonicalUrl", canonicalUrl);

    setLoading(true);
    fetch(`/api/recommendations/next-action?${params.toString()}`)
      .then((r) => r.json())
      .then((json: { actions: NextBestAction[] }) => setActions(json.actions ?? []))
      .finally(() => setLoading(false));
  }, [sessionId, contentItemId, canonicalUrl]);

  if (loading) return <p className="text-sm text-muted">Загрузка действий…</p>;
  if (!actions.length) return <RecommendationEmptyState title="Нет предложенных действий" className={className} />;

  return (
    <section className={cn("space-y-4", className)} aria-label={title}>
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-muted" aria-hidden />
        <h2 className="heading-section text-2xl">{title}</h2>
      </div>
      <ul className="grid gap-3">
        {actions.map((action) => (
          <li key={action.id}>
            <div className="rounded-sm border border-graphite/10 bg-background p-4">
              {action.url ? (
                <Link
                  href={action.url}
                  className="flex items-center justify-between gap-3 font-display text-lg hover:underline"
                >
                  <span>{action.title}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                </Link>
              ) : (
                <p className="font-display text-lg">{action.title}</p>
              )}
              {action.description && (
                <p className="mt-1 text-sm text-muted">{action.description}</p>
              )}
              <RecommendationExplanation
                explanation={action.explanation}
                reasonCodes={action.reasonCodes}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
