import type { EditorialContentItem } from "@/types/editorial-content";

export function EditorialTakeaways({ item }: { item: EditorialContentItem }) {
  const takeaways = item.content.takeaways ?? [];
  const advice = item.content.practicalAdvice ?? [];
  const items = [...takeaways, ...advice];

  if (!items.length) return null;

  return (
    <section className="mt-10 rounded-sm bg-sand/40 px-6 py-6" aria-label="Практические выводы">
      <h2 className="font-display text-2xl">Практические выводы</h2>
      <ul className="mt-4 space-y-2 text-sm text-muted">
        {items.map((point) => (
          <li key={point} className="flex gap-2">
            <span className="text-graphite" aria-hidden>
              •
            </span>
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}
