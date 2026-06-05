import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { calculatorFaq } from "@/data/calculator-copy";
import { cta } from "@/data/copy";

export function CalculatorFaq() {
  return (
    <section className="mt-16" aria-labelledby="calc-faq-title">
      <h2 id="calc-faq-title" className="font-display text-2xl">
        Вопросы о расчёте стоимости
      </h2>
      <Accordion type="single" collapsible className="mt-6 max-w-3xl">
        {calculatorFaq.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button asChild className="mt-8" size="lg">
        <Link href="#calculator-lead">Получить подробный расчёт</Link>
      </Button>
      <p className="mt-3 text-xs text-muted">
        Или{" "}
        <Link href="/catalog" className="underline underline-offset-2">
          {cta.viewProjects}
        </Link>
      </p>
    </section>
  );
}
