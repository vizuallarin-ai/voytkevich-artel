import Link from "next/link";
import { priceFactors } from "@/lib/project-content";
import { Button } from "@/components/ui/button";

export function ProjectPriceFactors() {
  return (
    <section aria-labelledby="project-price-factors-title">
      <h2 id="project-price-factors-title" className="font-display text-2xl">
        Почему итоговая смета может отличаться от цены в карточке
      </h2>
      <p className="mt-4 max-w-3xl text-muted">
        Цена в карточке помогает сориентироваться. Точная смета считается после уточнения
        участка, проекта, фундамента, инженерии и комплектации. Так заказчик заранее понимает
        состав работ и не принимает решение только по цене «от».
      </p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {priceFactors.map((f) => (
          <li
            key={f}
            className="flex gap-2 rounded-sm border border-graphite/10 px-4 py-3 text-sm"
          >
            <span className="text-wood" aria-hidden>
              —
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Button asChild className="mt-8" variant="outline">
        <Link href="#project-lead">Уточнить смету по проекту</Link>
      </Button>
    </section>
  );
}
