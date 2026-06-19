"use client";

type Props = {
  warnings: string[];
  blockers: string[];
};

export function ContentScheduleWarningsPanel({ warnings, blockers }: Props) {
  if (!warnings.length && !blockers.length) {
    return <p className="text-sm text-muted">Нет warnings/blockers</p>;
  }

  return (
    <div className="rounded-sm border border-graphite/10 p-4 space-y-3">
      <h3 className="font-medium text-sm">Schedule validation</h3>
      {blockers.length > 0 && (
        <ul className="text-xs text-destructive list-disc pl-4">
          {blockers.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      {warnings.length > 0 && (
        <ul className="text-xs text-muted list-disc pl-4">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
