import Link from "next/link";
import type { TocItem } from "@/lib/blog";

export function BlogTableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 4) return null;
  return (
    <nav aria-label="Содержание статьи" className="my-8 rounded-sm border border-graphite/10 p-5 md:p-6">
      <p className="label-caps">Содержание</p>
      <ol className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={`#${item.id}`} className="text-muted hover:text-wood hover:underline">
              {item.title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
