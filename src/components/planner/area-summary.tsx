import type { AreaSummary } from "@/lib/planner-area";
import { cn, formatNumber } from "@/lib/utils";

export function AreaSummaryPanel({ summary }: { summary: AreaSummary }) {
  const statusColor =
    summary.status === "exceeded"
      ? "text-wood"
      : summary.status === "within"
        ? "text-muted"
        : "text-foreground";

  return (
    <section aria-labelledby="area-summary-title" className="rounded-sm border border-graphite/10 p-5 md:p-6">
      <h2 id="area-summary-title" className="font-display text-xl">
        Сводка по площади
      </h2>
      <p className={cn("mt-2 text-sm font-medium", statusColor)}>{summary.statusLabel}</p>
      <p className="mt-1 text-sm text-muted">{summary.statusHint}</p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <SummaryRow label="Целевой ориентир" value={`${formatNumber(summary.targetArea)} м²`} />
        <SummaryRow label="Сумма помещений" value={`${formatNumber(summary.totalArea)} м²`} highlight />
        <SummaryRow label="Жилая площадь" value={`${formatNumber(summary.livingArea)} м²`} />
        <SummaryRow label="Техническая" value={`${formatNumber(summary.technicalArea)} м²`} />
        <SummaryRow label="Санузлы" value={`${formatNumber(summary.sanitaryArea)} м²`} />
        <SummaryRow label="Проходные зоны" value={`${formatNumber(summary.passageArea)} м²`} />
        <SummaryRow label="Терраса / гараж" value={`${formatNumber(summary.additionalArea)} м²`} />
        <SummaryRow label="Внутренняя сумма" value={`${formatNumber(summary.internalArea)} м²`} />
      </dl>

      <p className="mt-4 text-xs text-muted">
        Схема условная и нужна для сбора вводных. Архитектурная планировка создаётся отдельно.
      </p>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 border-b border-graphite/10 pb-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("font-medium", highlight && "font-display text-lg")}>{value}</dd>
    </div>
  );
}
