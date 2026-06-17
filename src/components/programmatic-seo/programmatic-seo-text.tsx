export function ProgrammaticSEOText({ text }: { text: string }) {
  return (
    <section className="mt-16 border-t border-graphite/10 pt-12" aria-labelledby="seo-text">
      <h2 id="seo-text" className="sr-only">
        Подробнее
      </h2>
      <div className="prose prose-sm max-w-3xl text-muted prose-headings:font-display prose-headings:text-foreground">
        {text.split("\n\n").map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
    </section>
  );
}
