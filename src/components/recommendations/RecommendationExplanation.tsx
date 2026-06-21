"use client";

import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

type RecommendationExplanationProps = {
  explanation: string;
  reasonCodes?: string[];
  className?: string;
};

export function RecommendationExplanation({
  explanation,
  reasonCodes = [],
  className,
}: RecommendationExplanationProps) {
  if (!explanation) return null;

  return (
    <div className={cn("mt-3 rounded-sm border border-graphite/5 bg-graphite/[0.02] p-3", className)}>
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
        <div className="min-w-0">
          <p className="text-xs text-muted">{explanation}</p>
          {reasonCodes.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1">
              {reasonCodes.map((code) => (
                <li
                  key={code}
                  className="rounded-sm border border-graphite/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted"
                >
                  {code}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
