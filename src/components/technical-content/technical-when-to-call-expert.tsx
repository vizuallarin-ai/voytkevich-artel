export function TechnicalWhenToCallExpert({ items }: { items: string[] }) {
  if (!items.length) return null;

  return (
    <section className="mt-10 rounded-sm bg-graphite px-6 py-8 text-background" aria-labelledby="call-expert">
      <h2 id="call-expert" className="font-display text-2xl">
        Когда нужен специалист
      </h2>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-background/90">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden>→</span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
