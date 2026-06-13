import type { AnalyticsInsight } from "@/types/analytics";

const STYLE: Record<AnalyticsInsight["type"], string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  action: "border-blue-200 bg-blue-50 text-blue-950",
  info: "border-graphite/15 bg-sand/40 text-foreground",
};

export function AnalyticsInsights({ insights }: { insights: AnalyticsInsight[] }) {
  if (!insights.length) return null;

  return (
    <section className="rounded-sm border border-graphite/10 bg-background p-5">
      <h2 className="font-display text-lg">Рекомендации</h2>
      <ul className="mt-4 space-y-3">
        {insights.map((item) => (
          <li
            key={item.id}
            className={`rounded-sm border px-4 py-3 text-sm ${STYLE[item.type]}`}
          >
            {item.text}
            {item.basedOn === "recommendation" ? (
              <span className="ml-2 text-xs opacity-70">(рекомендация)</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
