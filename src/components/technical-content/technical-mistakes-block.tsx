export function TechnicalMistakesBlock({ mistakes }: { mistakes: string[] }) {
  if (!mistakes.length) return null;

  return (
    <section className="mt-10" aria-labelledby="technical-mistakes">
      <h2 id="technical-mistakes" className="font-display text-2xl">
        Частые ошибки
      </h2>
      <ul className="mt-4 space-y-3">
        {mistakes.map((item) => (
          <li
            key={item}
            className="rounded-sm border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
