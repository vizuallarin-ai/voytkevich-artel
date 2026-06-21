"use client";

import type { RecommendationItem } from "@/types/recommendation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";
import { RecommendationExplanation } from "./RecommendationExplanation";
import { RecommendationFeedback } from "./RecommendationFeedback";

type RecommendationCardProps = {
  item: RecommendationItem;
  placement?: string;
  sessionId?: string;
  className?: string;
  showExplanation?: boolean;
  showFeedback?: boolean;
};

export function RecommendationCard({
  item,
  placement,
  sessionId,
  className,
  showExplanation = true,
  showFeedback = true,
}: RecommendationCardProps) {
  const href = item.targetUrl ?? (item.contentItemId ? `/content/${item.contentItemId}` : "#");

  return (
    <article
      className={cn(
        "rounded-sm border border-graphite/10 bg-background p-4 transition-colors hover:bg-sand/30",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-muted">{item.type}</p>
          <h3 className="mt-1 font-display text-lg leading-snug">
            <Link href={href} className="hover:underline">
              {item.title}
            </Link>
          </h3>
          {item.description && (
            <p className="mt-2 text-sm text-muted line-clamp-2">{item.description}</p>
          )}
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1 rounded-sm border border-graphite/10 px-2 py-0.5">
          <Sparkles className="h-3 w-3" aria-hidden />
          {item.confidence}
        </span>
        <span className="rounded-sm border border-graphite/10 px-2 py-0.5">{item.source}</span>
      </div>

      {showExplanation && (
        <RecommendationExplanation explanation={item.explanation} reasonCodes={item.reasonCodes} />
      )}

      {showFeedback && (
        <RecommendationFeedback
          recommendationId={item.recommendationId}
          contentItemId={item.contentItemId}
          placement={placement}
          sessionId={sessionId}
        />
      )}
    </article>
  );
}
