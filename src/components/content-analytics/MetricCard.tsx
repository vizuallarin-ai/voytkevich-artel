"use client";

type Props = {
  label: string;
  value: number | string | null;
  hint?: string;
};

export function MetricCard({ label, value, hint }: Props) {
  return (
    <div className="rounded-sm border border-graphite/10 p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums">
        {value == null ? "—" : value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
