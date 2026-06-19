"use client";

import type { ContentPriorityScore } from "@/types/content-prioritization";

type Props = { score: ContentPriorityScore };

export function PriorityScoreBadge({ score }: Props) {
  const colors: Record<string, string> = {
    P1: "bg-emerald-100 text-emerald-900",
    P2: "bg-green-100 text-green-900",
    P3: "bg-amber-100 text-amber-900",
    P4: "bg-orange-100 text-orange-900",
    P5: "bg-graphite/10 text-muted",
  };

  return (
    <span className="inline-flex items-center gap-1">
      <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${colors[score.level]}`}>
        {score.heuristic ? `${score.level}*` : score.level}
      </span>
      <span className="text-[10px] text-muted">{score.score}</span>
      <span
        className={`text-[10px] ${
          score.confidence === "low" ? "text-amber-700" : "text-muted"
        }`}
      >
        {score.confidence}
      </span>
    </span>
  );
}
