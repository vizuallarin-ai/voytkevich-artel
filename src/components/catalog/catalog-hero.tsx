import Link from "next/link";
import { Button } from "@/components/ui/button";
import { catalogHero } from "@/data/catalog-copy";
import { cta } from "@/data/copy";

export function CatalogHero({ projectCount }: { projectCount: number }) {
  return (
    <header>
      <p className="label-caps">Каталог проектов</p>
      <h1 className="heading-section mt-2">{catalogHero.h1}</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted">{catalogHero.subtitle}</p>
      <p className="mt-3 text-sm text-muted">
        {projectCount} {projectCount === 1 ? "проект" : "проектов"} в каталоге
      </p>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:max-w-3xl">
        {catalogHero.facts.map((fact) => (
          <li key={fact} className="flex gap-2 text-sm text-muted">
            <span className="text-wood" aria-hidden>
              —
            </span>
            {fact}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/catalog#catalog-picker">{cta.discussPlot}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/calculator">{cta.calculateCost}</Link>
        </Button>
      </div>
    </header>
  );
}
