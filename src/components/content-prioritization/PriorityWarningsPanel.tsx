"use client";

type Props = { warnings: string[] };

export function PriorityWarningsPanel({ warnings }: Props) {
  if (!warnings.length) return null;
  return (
    <div className="rounded-sm border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-sm font-medium text-amber-900 mb-2">Warnings</h3>
      <ul className="text-xs text-amber-900 list-disc pl-4">
        {warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
