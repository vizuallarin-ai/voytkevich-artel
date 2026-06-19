import type { PublicationValidationResult } from "@/types/content-distribution";

export function PublicationValidationPanel({
  validation,
}: {
  validation: PublicationValidationResult;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
      <h3 className="font-semibold">Validation</h3>
      {validation.blockers.length > 0 && (
        <div>
          <p className="font-medium text-destructive">Blockers</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            {validation.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}
      {validation.warnings.length > 0 && (
        <div>
          <p className="font-medium text-amber-700">Warnings</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-muted">
            {validation.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-muted border-t pt-2">
        canApprove: {validation.canApprove ? "да" : "нет"} · canPublish:{" "}
        {validation.canPublish ? "да" : "нет"} · manual:{" "}
        {validation.requiresManualExport ? "да" : "нет"}
      </p>
    </div>
  );
}
