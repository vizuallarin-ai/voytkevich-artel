import type { AIContentGenerationOutput } from "@/types/ai-content-factory";

type Props = {
  output: AIContentGenerationOutput;
};

export function AIContentOutputPreview({ output }: Props) {
  const { result } = output;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Черновик</p>
        <h2 className="text-xl font-semibold mt-1">{result.h1 ?? result.title}</h2>
        {result.slug && <p className="text-xs text-muted mt-1">/{result.slug}</p>}
      </div>

      {result.article?.intro && (
        <section>
          <h3 className="text-sm font-medium mb-1">Intro</h3>
          <p className="text-sm leading-relaxed">{result.article.intro}</p>
        </section>
      )}

      {result.article?.blocks?.map((block) => (
        <section key={block.id}>
          {block.title && <h3 className="text-sm font-medium mb-1">{block.title}</h3>}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{block.content}</p>
        </section>
      ))}

      {result.faq && result.faq.length > 0 && (
        <section>
          <h3 className="text-sm font-medium mb-2">FAQ</h3>
          <dl className="space-y-3">
            {result.faq.map((item, i) => (
              <div key={i} className="rounded-lg bg-muted-bg p-3">
                <dt className="font-medium text-sm">{item.question}</dt>
                <dd className="text-sm text-muted mt-1">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {result.cta && (
        <section className="rounded-lg border border-dashed p-3 text-sm">
          <p className="font-medium">{result.cta.primary}</p>
          {result.cta.secondary && <p className="text-muted mt-1">{result.cta.secondary}</p>}
        </section>
      )}

      {result.metadata && (
        <section className="text-xs text-muted space-y-1">
          <p>SEO: {result.metadata.title}</p>
          <p>{result.metadata.description}</p>
          <p>
            robots: index={String(result.metadata.robots.index)}, follow=
            {String(result.metadata.robots.follow)}
          </p>
        </section>
      )}
    </div>
  );
}
