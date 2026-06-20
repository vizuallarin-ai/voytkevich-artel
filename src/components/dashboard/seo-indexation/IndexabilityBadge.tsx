"use client";

type Props = {
  status: string;
  indexable: boolean;
};

export function IndexabilityBadge({ status, indexable }: Props) {
  const tone = indexable
    ? "bg-emerald-100 text-emerald-900"
    : status === "blocked"
      ? "bg-red-100 text-red-900"
      : "bg-amber-100 text-amber-900";

  return (
    <span className={`inline-flex rounded-sm px-2 py-0.5 text-xs font-medium ${tone}`}>
      {indexable ? "indexable" : status}
    </span>
  );
}
