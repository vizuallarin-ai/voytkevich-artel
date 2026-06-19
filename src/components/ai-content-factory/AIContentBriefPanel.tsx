import type { AIContentBrief } from "@/types/ai-content-factory";

type Props = {
  brief?: AIContentBrief;
};

export function AIContentBriefPanel({ brief }: Props) {
  if (!brief) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="font-semibold text-lg">Content brief</h3>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Цель</dt>
          <dd>{brief.contentGoal}</dd>
        </div>
        <div>
          <dt className="text-muted">Интент</dt>
          <dd>{brief.searchIntent}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">Аудитория</dt>
          <dd>{brief.audience}</dd>
        </div>
      </dl>
      {brief.recommendedStructure.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Структура</p>
          <ul className="space-y-2 text-sm">
            {brief.recommendedStructure.map((block, i) => (
              <li key={i} className="rounded-lg bg-muted-bg px-3 py-2">
                <span className="font-medium">{block.title}</span>
                <span className="text-muted"> — {block.purpose}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {brief.risksToAvoid.length > 0 && (
        <div>
          <p className="text-sm font-medium text-destructive mb-1">Риски</p>
          <ul className="list-disc pl-5 text-sm text-muted">
            {brief.risksToAvoid.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
