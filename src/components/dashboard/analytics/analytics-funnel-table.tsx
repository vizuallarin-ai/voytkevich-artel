import type { FunnelReport } from "@/types/analytics";
import { formatPercent } from "@/lib/analytics/report-formatters";

export function AnalyticsFunnelTable({ funnel }: { funnel: FunnelReport }) {
  if (!funnel.hasEnoughData) {
    return (
      <div className="rounded-sm border border-dashed border-graphite/20 p-6 text-sm text-muted">
        Недостаточно событий для воронки «{funnel.title}».
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-graphite/10 bg-background p-5">
      <h3 className="font-display text-lg">{funnel.title}</h3>
      <p className="mt-1 text-sm text-muted">{funnel.question}</p>
      <div className="mt-4 space-y-2">
        {funnel.steps.map((step) => (
          <div key={step.name} className="flex items-center gap-3 text-sm">
            <div className="w-40 shrink-0 text-muted">{step.label}</div>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-sand">
                <div
                  className="h-2 rounded-full bg-wood"
                  style={{
                    width: `${funnel.steps[0].count > 0 ? Math.min(100, (step.count / funnel.steps[0].count) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="w-16 text-right font-medium">{step.count}</div>
            <div className="w-16 text-right text-xs text-muted">
              {step.conversionFromPrev != null && step.conversionFromPrev < 1
                ? formatPercent(step.conversionFromPrev)
                : ""}
            </div>
          </div>
        ))}
      </div>
      {funnel.overallConversion != null ? (
        <p className="mt-3 text-sm">
          Общая конверсия: <strong>{formatPercent(funnel.overallConversion)}</strong>
        </p>
      ) : null}
    </div>
  );
}
