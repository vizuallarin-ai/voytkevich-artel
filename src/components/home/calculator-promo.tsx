import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { Button } from "@/components/ui/button";
import { calculatorPromo } from "@/data/home";
import { cta } from "@/data/copy";
import { homeSectionPhotos } from "@/data/images";
import { formatPriceRange, quickHeroEstimate } from "@/lib/calculator";

export function CalculatorPromo() {
  const example = quickHeroEstimate(calculatorPromo.example.area);

  return (
    <section id="calculator-promo" className="section-padding" aria-labelledby="calc-promo-title">
      <div className="container-narrow">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-sm border border-graphite/10 lg:mb-0">
              <Image
                src={homeSectionPhotos.karkasExterior}
                alt="Каркасный дом под ключ — фасад снаружи"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
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
        </div>

        <Reveal delay={0.1}>
          <div className="glass mt-12 rounded-sm p-8">
            <p className="label-caps">Пример расчёта</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-b border-graphite/10 pb-3">
                <dt className="text-sm text-muted">Дом</dt>
                <dd className="mt-1 font-medium">{calculatorPromo.example.area} м²</dd>
              </div>
              <div className="border-b border-graphite/10 pb-3">
                <dt className="text-sm text-muted">Материал</dt>
                <dd className="mt-1 font-medium capitalize">{calculatorPromo.example.material}</dd>
              </div>
              <div className="border-b border-graphite/10 pb-3">
                <dt className="text-sm text-muted">Предварительно</dt>
                <dd className="mt-1 font-display text-xl">
                  {formatPriceRange(example.priceMin, example.priceMax)}
                </dd>
              </div>
              <div className="border-b border-graphite/10 pb-3">
                <dt className="text-sm text-muted">Срок</dt>
                <dd className="mt-1 font-medium">от {example.months} мес.</dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="mt-8 w-full sm:w-auto" size="lg">
              <Link href="/calculator">{cta.calculateCost}</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
