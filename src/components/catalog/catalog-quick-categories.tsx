import Link from "next/link";
import { catalogQuickGroups } from "@/data/catalog-categories";

export function CatalogQuickCategories() {
  return (
    <section aria-labelledby="catalog-quick-title">
      <h2 id="catalog-quick-title" className="font-display text-xl md:text-2xl">
        Быстрый выбор проекта
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Не знаете, с чего начать? Выберите сценарий — покажем подходящие проекты.
      </p>
      <div className="mt-6 space-y-6">
        {catalogQuickGroups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{group.title}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-graphite/15 px-3 py-1.5 text-xs transition hover:border-graphite hover:bg-muted-bg/80"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">
        <Link href="/catalog#catalog-picker" className="underline underline-offset-4 hover:text-foreground">
          Не знаете, с чего начать? Подберём проект под участок →
        </Link>
      </p>
    </section>
  );
}
