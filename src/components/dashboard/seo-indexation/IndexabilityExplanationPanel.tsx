"use client";

import type { IndexabilityDecision } from "@/types/seo-indexation";

type Props = { decision: IndexabilityDecision; title?: string };

export function IndexabilityExplanationPanel({ decision, title = "Indexability" }: Props) {
  return (
    <div className="rounded-sm border border-graphite/10 bg-background p-4 text-sm">
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-muted">{decision.message}</p>
      {decision.blockers.length > 0 && (
        <ul className="mt-2 list-disc pl-4 text-xs text-red-800">
          {decision.blockers.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      {decision.warnings.length > 0 && (
        <ul className="mt-2 list-disc pl-4 text-xs text-amber-800">
          {decision.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
