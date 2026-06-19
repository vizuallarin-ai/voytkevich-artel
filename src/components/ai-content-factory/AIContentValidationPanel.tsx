import type { AIContentValidationResult } from "@/types/ai-content-validation";
import { cn } from "@/lib/utils";

type Props = {
  validation: AIContentValidationResult;
};

const LEVEL_STYLES: Record<string, string> = {
  poor: "bg-red-100 text-red-800",
  acceptable: "bg-amber-100 text-amber-800",
  good: "bg-emerald-100 text-emerald-800",
  strong: "bg-emerald-200 text-emerald-900",
};

export function AIContentValidationPanel({ validation }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-semibold">Validation</h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            LEVEL_STYLES[validation.qualityLevel] ?? LEVEL_STYLES.acceptable,
          )}
        >
          {validation.qualityLevel}
        </span>
        {validation.valid ? (
          <span className="text-xs text-emerald-600">Без blockers</span>
        ) : (
          <span className="text-xs text-destructive">Есть blockers</span>
        )}
      </div>

      {validation.blockers.length > 0 && (
        <div>
          <p className="text-sm font-medium text-destructive mb-1">Blockers</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {validation.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div>
          <p className="text-sm font-medium text-amber-700 mb-1">Warnings</p>
          <ul className="list-disc pl-5 text-sm text-muted space-y-1">
            {validation.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.requiredActions.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-1">Required actions</p>
          <ul className="flex flex-wrap gap-2">
            {validation.requiredActions.map((a) => (
              <li
                key={a}
                className="rounded-full bg-muted-bg px-2 py-0.5 text-xs font-medium"
              >
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <Flag label="CTA" ok={validation.flags.hasCTA} />
        <Flag label="FAQ" ok={validation.flags.hasFAQ} />
        <Flag label="Links" ok={validation.flags.hasRelatedLinks} />
        <Flag label="Meta" ok={validation.flags.hasMetadata} />
      </div>

      <p className="text-xs text-muted border-t pt-3">
        canSaveToCMS: {validation.canSaveToCMS ? "да" : "нет"} · canSendToReview:{" "}
        {validation.canSendToReview ? "да" : "нет"} · canApprove/canPublish: всегда нет
      </p>
    </div>
  );
}

function Flag({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={cn(
        "rounded px-2 py-1 text-center",
        ok ? "bg-emerald-50 text-emerald-700" : "bg-muted-bg text-muted",
      )}
    >
      {label}: {ok ? "✓" : "—"}
    </span>
  );
}
