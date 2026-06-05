import Link from "next/link";
import { catalogSeoBlock } from "@/data/catalog-copy";
import { cta } from "@/data/copy";
import { Button } from "@/components/ui/button";

export function CatalogSeoSection() {
  return (
    <section className="mt-20 border-t border-graphite/10 pt-16" aria-labelledby="catalog-seo-title">
      <h2 id="catalog-seo-title" className="font-display text-2xl md:text-3xl">
        {catalogSeoBlock.title}
      </h2>
      <div className="mt-6 max-w-3xl space-y-4 text-muted">
        {catalogSeoBlock.paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
      <nav className="mt-8 flex flex-wrap gap-4 text-sm" aria-label="Связанные разделы">
        <Link href="/calculator" className="underline underline-offset-4 hover:text-foreground">
          Калькулятор стоимости
        </Link>
        <Link href="/planirovka" className="underline underline-offset-4 hover:text-foreground">
          Планировщик
        </Link>
        <Link href="/process" className="underline underline-offset-4 hover:text-foreground">
          Процесс строительства
        </Link>
        <Link href="/blog" className="underline underline-offset-4 hover:text-foreground">
          Блог
        </Link>
        <Link href="/about" className="underline underline-offset-4 hover:text-foreground">
          О компании
        </Link>
      </nav>
      <Button asChild className="mt-8" variant="outline">
        <Link href="/catalog#catalog-picker">{cta.buildConsultation}</Link>
      </Button>
    </section>
  );
}
