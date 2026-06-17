import type { EditorialContentItem } from "@/types/editorial-content";

export function EditorialStoryBlock({ item }: { item: EditorialContentItem }) {
  const { content } = item;

  return (
    <div className="mt-8 space-y-8">
      {content.hook ? (
        <p className="text-lg leading-relaxed text-foreground">{content.hook}</p>
      ) : null}

      {content.intro ? <p className="leading-relaxed text-muted">{content.intro}</p> : null}

      {content.situation ? (
        <section>
          <h2 className="font-display text-2xl">Ситуация</h2>
          <p className="mt-3 leading-relaxed text-muted">{content.situation}</p>
        </section>
      ) : null}

      {content.conflict ? (
        <section>
          <h2 className="font-display text-2xl">В чём был вопрос</h2>
          <p className="mt-3 leading-relaxed text-muted">{content.conflict}</p>
        </section>
      ) : null}

      {content.turningPoint ? (
        <section>
          <h2 className="font-display text-2xl">Что оказалось неочевидным</h2>
          <p className="mt-3 leading-relaxed text-muted">{content.turningPoint}</p>
        </section>
      ) : null}

      {content.storyBody ? (
        <section>
          <div className="prose prose-sm max-w-none leading-relaxed text-muted">{content.storyBody}</div>
        </section>
      ) : null}

      {content.localContext ? (
        <section>
          <h2 className="font-display text-2xl">Локальный контекст</h2>
          <p className="mt-3 leading-relaxed text-muted">{content.localContext}</p>
        </section>
      ) : null}

      {content.newsSummary ? (
        <section>
          <h2 className="font-display text-2xl">Суть</h2>
          <p className="mt-3 leading-relaxed text-muted">{content.newsSummary}</p>
        </section>
      ) : null}

      {content.digestItems?.length ? (
        <section>
          <h2 className="font-display text-2xl">Подборка</h2>
          <ul className="mt-4 space-y-4">
            {content.digestItems.map((digest) => (
              <li key={digest.title} className="rounded-sm border border-graphite/10 p-4">
                <p className="font-display text-base">{digest.title}</p>
                <p className="mt-2 text-sm text-muted">{digest.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {content.conclusion ? (
        <section>
          <h2 className="font-display text-2xl">Итог</h2>
          <p className="mt-3 leading-relaxed text-muted">{content.conclusion}</p>
        </section>
      ) : null}
    </div>
  );
}
