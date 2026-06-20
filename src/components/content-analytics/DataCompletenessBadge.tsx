"use client";

type Props = {
  completeness: string;
  searchAvailable: boolean;
};

export function DataCompletenessBadge({ completeness, searchAvailable }: Props) {
  const tone =
    completeness === "strong" || completeness === "good"
      ? "bg-emerald-100 text-emerald-900"
      : completeness === "partial"
        ? "bg-amber-100 text-amber-900"
        : "bg-graphite/10 text-muted";

  return (
    <span className={`inline-flex rounded-sm px-2 py-0.5 text-xs ${tone}`}>
      data: {completeness}
      {!searchAvailable && " · search: unavailable"}
    </span>
  );
}
