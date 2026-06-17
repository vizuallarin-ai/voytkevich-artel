import type { ContentQualityLevel } from "@/types/content-quality";
import { cn } from "@/lib/utils";

const LEVEL_COLORS: Record<ContentQualityLevel, string> = {
  poor: "bg-red-100 text-red-900",
  acceptable: "bg-amber-100 text-amber-900",
  good: "bg-blue-100 text-blue-900",
  strong: "bg-emerald-100 text-emerald-900",
};

export function ContentQualityBadge({
  level,
  score,
}: {
  level: ContentQualityLevel;
  score?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
        LEVEL_COLORS[level],
      )}
    >
      {level}
      {score !== undefined ? ` (${score})` : ""}
    </span>
  );
}
