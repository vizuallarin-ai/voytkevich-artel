import Link from "next/link";
import { Button } from "@/components/ui/button";
import { calculatorHero } from "@/data/calculator-copy";
import { cta } from "@/data/copy";

export function CalculatorHero() {
  return (
    <header className="max-w-3xl">
      <p className="label-caps">Калькулятор</p>
      <h1 className="heading-section mt-2">{calculatorHero.h1}</h1>
      <p className="mt-4 text-lg text-muted">{calculatorHero.intro}</p>
      <p className="mt-2 text-sm text-muted">{calculatorHero.micro}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {calculatorHero.quickFacts.map((fact) => (
          <li
            key={fact}
            className="rounded-full bg-sand/80 px-3 py-1 text-xs text-muted"
          >
            {fact}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <a href="#calculator-form">{cta.calculateMyHome}</a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="#calculator-lead">{cta.getConsultation}</Link>
        </Button>
      </div>
    </header>
  );
}
