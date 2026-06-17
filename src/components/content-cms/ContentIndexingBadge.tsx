import { cn } from "@/lib/utils";

export function ContentIndexingBadge({
  indexable,
  sitemap,
}: {
  indexable: boolean;
  sitemap?: boolean;
}) {
  if (indexable) {
    return (
      <span className="inline-flex rounded-sm bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
        index{sitemap ? " + sitemap" : ""}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-sm bg-graphite/10 px-2 py-0.5 text-xs font-medium text-muted",
      )}
    >
      noindex
    </span>
  );
}
