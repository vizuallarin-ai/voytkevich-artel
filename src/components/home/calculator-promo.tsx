import Link from "next/link";
import { Check } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { Button } from "@/components/ui/button";
import { calculatorPromo } from "@/data/home";
import { cta } from "@/data/copy";
import { formatPriceRange, quickHeroEstimate } from "@/lib/calculator";

export function CalculatorPromo() {
  const example = quickHeroEstimate(calculatorPromo.example.area);

  return (
    <section id="calculator-promo" className="section-padding" aria-labelledby="calc-promo-title">
      <div className="container-narrow">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="label-caps">Калькулятор</p>
            <h2 id="calc-promo-title" className="heading-section mt-2">
              {calculatorPromo.title}
            </h2>
            <p className="mt-4 text-muted">{calculatorPromo.description}</p>
            <p className="mt-6 text-sm font-medium">Учитываем:</p>
            <ul className="mt-3 space-y-2">
              {calculatorPromo.factors.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted">
                  <Check className="h-4 w-4 shrink-0 text-wood" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-muted">{calculatorPromo.disclaimer}</p>
            <Button asChild className="mt-8" size="lg">
              <Link href="/calculator">{calculatorPromo.example.cta}</Link>
            </Button>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass rounded-sm p-8">
              <p className="label-caps">Пример расчёта</p>
              <dl className="mt-6 space-y-4">
                <div className="flex justify-between border-b border-graphite/10 pb-3">
                  <dt className="text-sm text-muted">Дом</dt>
                  <dd className="font-medium">{calculatorPromo.example.area} м²</dd>
                </div>
                <div className="flex justify-between border-b border-graphite/10 pb-3">
                  <dt className="text-sm text-muted">Материал</dt>
                  <dd className="font-medium capitalize">{calculatorPromo.example.material}</dd>
                </div>
                <div className="flex justify-between border-b border-graphite/10 pb-3">
                  <dt className="text-sm text-muted">Этажность</dt>
                  <dd className="font-medium">{calculatorPromo.example.floors} этаж</dd>
                </div>
                <div className="flex justify-between border-b border-graphite/10 pb-3">
                  <dt className="text-sm text-muted">Предварительно</dt>
                  <dd className="font-display text-2xl">
                    {formatPriceRange(example.priceMin, example.priceMax)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted">Срок</dt>
                  <dd className="font-medium">от {example.months} мес.</dd>
                </div>
              </dl>
              <Button asChild variant="outline" className="mt-8 w-full" size="lg">
                <Link href="/calculator">{cta.calculateCost}</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
