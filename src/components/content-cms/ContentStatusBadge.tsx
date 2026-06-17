import type { ContentStatus } from "@/types/content-workflow";
import { CONTENT_STATUS_LABELS } from "@/data/content-statuses";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Partial<Record<ContentStatus, string>> = {
  published: "bg-emerald-100 text-emerald-900",
  approved: "bg-blue-100 text-blue-900",
  review: "bg-amber-100 text-amber-900",
  "ai-generated": "bg-purple-100 text-purple-900",
  rejected: "bg-red-100 text-red-900",
  noindex: "bg-graphite/10 text-muted",
  draft: "bg-sand text-foreground",
  planned: "bg-sand/60 text-muted",
};

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
        STATUS_COLORS[status] ?? "bg-graphite/10 text-muted",
      )}
    >
      {CONTENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}
