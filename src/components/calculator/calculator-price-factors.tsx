import Link from "next/link";
import { Button } from "@/components/ui/button";
import { calculatorPriceFactors } from "@/data/calculator-copy";
import { cta } from "@/data/copy";

export function CalculatorPriceFactors() {
  return (
    <section aria-labelledby="calc-factors-title">
      <h2 id="calc-factors-title" className="font-display text-2xl">
        Что может изменить итоговую смету
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Цена в калькуляторе помогает сориентироваться. Точная смета считается после уточнения
        участка, проекта, фундамента, инженерии и комплектации.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {calculatorPriceFactors.map((item) => (
          <li
            key={item.title}
            className="rounded-sm border border-graphite/10 p-5"
          >
            <h3 className="font-medium">{item.title}</h3>
            <p className="mt-2 text-sm text-muted">{item.text}</p>
          </li>
        ))}
      </ul>
      <Button asChild className="mt-8" size="lg" variant="outline">
        <Link href="#calculator-lead">{cta.clarifyEstimate} по моему участку</Link>
      </Button>
    </section>
  );
}
