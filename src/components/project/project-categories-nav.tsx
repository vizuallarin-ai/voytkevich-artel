import Link from "next/link";

type CategoryLink = { slug: string; label: string; href: string };

export function ProjectCategoriesNav({ categories }: { categories: CategoryLink[] }) {
  if (!categories.length) return null;

  return (
    <nav className="mt-6" aria-label="Категории каталога">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Смотреть также</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={c.href}
            className="rounded-full border border-graphite/15 px-3 py-1 text-xs hover:border-graphite"
          >
            {c.label}
          </Link>
        ))}
        <Link
          href="/catalog"
          className="rounded-full border border-graphite/15 px-3 py-1 text-xs hover:border-graphite"
        >
          Весь каталог
        </Link>
      </div>
    </nav>
  );
}
