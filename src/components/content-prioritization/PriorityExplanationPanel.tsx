"use client";

import type { ContentPriorityScore } from "@/types/content-prioritization";
import { explainMissingData } from "@/lib/content-prioritization/priority-explainer";

type Props = { score: ContentPriorityScore; title?: string };

export function PriorityExplanationPanel({ score, title }: Props) {
  const missing = explainMissingData(score);

  return (
    <div className="rounded-sm border border-graphite/10 p-4 space-y-3 text-sm">
      {title && <h3 className="font-medium">{title}</h3>}
      <p className="text-xs leading-relaxed">{score.explanation}</p>
      <p className="text-xs text-primary">{score.recommendedAction}</p>
      {score.heuristic && (
        <p className="text-xs text-amber-700">Heuristic mode — частотность не подтверждена</p>
      )}
      {missing.length > 0 && (
        <p className="text-xs text-muted">Missing data: {missing.join(", ")}</p>
      )}
      {score.warnings.length > 0 && (
        <ul className="text-xs text-amber-800 list-disc pl-4">
          {score.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
