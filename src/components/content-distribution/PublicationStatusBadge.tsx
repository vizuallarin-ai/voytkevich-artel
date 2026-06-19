import type { ExternalPublicationStatus } from "@/types/content-distribution";
import { DISTRIBUTION_STATUS_LABELS } from "@/data/distribution-statuses";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  draft: "bg-muted-bg text-muted",
  review: "bg-amber-100 text-amber-900",
  approved: "bg-blue-100 text-blue-900",
  scheduled: "bg-indigo-100 text-indigo-900",
  publishing: "bg-purple-100 text-purple-900",
  published: "bg-emerald-100 text-emerald-900",
  failed: "bg-red-100 text-red-900",
  "manual-export": "bg-orange-100 text-orange-900",
  "needs-api": "bg-gray-100 text-gray-700",
  cancelled: "bg-muted-bg text-muted line-through",
  archived: "bg-muted-bg text-muted",
};

export function PublicationStatusBadge({ status }: { status: ExternalPublicationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        STYLES[status] ?? STYLES.draft,
      )}
    >
      {DISTRIBUTION_STATUS_LABELS[status] ?? status}
    </span>
  );
}
