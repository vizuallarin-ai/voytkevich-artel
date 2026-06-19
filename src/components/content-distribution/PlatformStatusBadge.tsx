import type { ExternalContentPlatform } from "@/types/content-distribution";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  manual: "bg-orange-100 text-orange-800",
  "needs-api": "bg-amber-100 text-amber-900",
  future: "bg-muted-bg text-muted",
  disabled: "bg-red-100 text-red-800",
};

export function PlatformStatusBadge({
  status,
  adapterActive,
}: {
  status: ExternalContentPlatform["adapterStatus"];
  adapterActive?: boolean;
}) {
  const label =
    status === "needs-api" && adapterActive
      ? "active (env)"
      : status;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        STYLES[status] ?? STYLES.future,
      )}
    >
      {label}
    </span>
  );
}
