import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { BlogCategory } from "@/types/blog";

export function BlogHomeHero() {
  return (
    <header className="max-w-3xl">
      <h1 className="heading-section">Блог о строительстве домов в Иркутске</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Разбираем стоимость, проекты, материалы, фундамент, участки, сметы, ошибки и этапы
        строительства — простым языком, чтобы вы могли принимать решения спокойнее и не строить
        дом вслепую.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild>
          <Link href="/calculator?source=blog&cluster=cost">Рассчитать стоимость дома</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/catalog">Смотреть проекты</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/planirovka?source=blog&cluster=planning">Собрать планировку</Link>
        </Button>
      </div>
    </header>
  );
}

export function BlogCategoryNav({ categories }: { categories: BlogCategory[] }) {
  return (
    <nav aria-label="Категории блога" className="mt-12">
      <h2 className="label-caps">Категории</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => (
          <li key={cat.slug}>
            <Link
              href={`/blog/category/${cat.slug}`}
              className="block rounded-sm border border-graphite/10 p-4 transition hover:border-wood/40 hover:bg-wood/5"
            >
              <span className="font-display text-base">{cat.title}</span>
              <p className="mt-1 text-xs text-muted line-clamp-2">{cat.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export const blogQuickTopics = [
  { label: "Сколько стоит дом", href: "/blog/skolko-stoit-postroit-dom-v-irkutske" },
  { label: "Какой материал выбрать", href: "/blog/brus-karkas-ili-gazobeton" },
  { label: "Как выбрать участок", href: "/blog/chto-proverit-na-uchastke-pered-stroitelstvom" },
  { label: "Какой фундамент", href: "/blog/kakoy-fundament-vybrat-dlya-chastnogo-doma" },
  { label: "Как читать смету", href: "/blog/kak-chitat-smetu-na-dom" },
  { label: "Как выбрать проект", href: "/blog/kak-vybrat-proekt-doma-pod-uchastok" },
  { label: "Ошибки при строительстве", href: "/blog/oshibki-pri-stroitelstve" },
] as const;

export function BlogPopularTopics() {
  return (
    <section aria-labelledby="blog-topics-title" className="mt-16">
      <h2 id="blog-topics-title" className="heading-section text-2xl">
        Популярные темы
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {blogQuickTopics.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="inline-block rounded-full border border-graphite/15 px-4 py-2 text-sm transition hover:border-wood/40 hover:bg-wood/5"
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
