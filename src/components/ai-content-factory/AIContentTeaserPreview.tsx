import type { AIContentTeaser } from "@/types/ai-content-factory";

type Props = {
  teasers?: AIContentTeaser[];
};

export function AIContentTeaserPreview({ teasers }: Props) {
  if (!teasers?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="font-semibold">Teaser-пакет ({teasers.length})</h3>
      <p className="text-xs text-muted">
        Только preview — автодистрибуция на Этапе 25 запрещена.
      </p>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {teasers.map((t) => (
          <article key={t.id} className="rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-medium uppercase text-xs">{t.platformId}</span>
              <span className="text-[10px] text-muted">{t.teaserStyle}</span>
            </div>
            <p className="font-medium">{t.hook}</p>
            <p className="text-muted mt-1">{t.body}</p>
            <p className="text-xs mt-2 italic">{t.openLoop}</p>
            <p className="text-xs mt-2 text-primary">{t.readMoreCTA}</p>
            <p className="text-[10px] text-muted mt-1 break-all">{t.utmUrl}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
