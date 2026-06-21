"use client";

import { cn } from "@/lib/utils";
import { Compass } from "lucide-react";

type RecommendationEmptyStateProps = {
  title?: string;
  message?: string;
  className?: string;
};

export function RecommendationEmptyState({
  title = "Пока нет рекомендаций",
  message = "Продолжайте изучать материалы — мы подберём релевантные варианты.",
  className,
}: RecommendationEmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-sm border border-dashed border-graphite/10 bg-graphite/[0.02] p-6 text-center",
        className,
      )}
    >
      <Compass className="mx-auto h-8 w-8 text-muted" aria-hidden />
      <h3 className="mt-3 font-display text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted">{message}</p>
    </div>
  );
}
