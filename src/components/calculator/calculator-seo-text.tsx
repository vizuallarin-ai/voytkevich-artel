import { calculatorSeo } from "@/data/calculator-copy";

export function CalculatorSeoText() {
  return (
    <section className="mt-16 max-w-3xl" aria-labelledby="calc-seo-title">
      <h2 id="calc-seo-title" className="font-display text-2xl">
        {calculatorSeo.h2}
      </h2>
      <div className="mt-4 space-y-4 text-muted leading-relaxed">
        {calculatorSeo.paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
    </section>
  );
}
