export function TechnicalShortAnswer({ text }: { text: string }) {
  return (
    <section className="mt-8 rounded-sm border border-graphite/10 bg-background p-5 shadow-sm" aria-labelledby="short-answer">
      <p id="short-answer" className="label-caps text-muted">
        Короткий ответ
      </p>
      <p className="mt-2 text-base leading-relaxed">{text}</p>
    </section>
  );
}
