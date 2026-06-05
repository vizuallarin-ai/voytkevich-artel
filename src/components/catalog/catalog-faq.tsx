import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { catalogFaq } from "@/data/catalog-copy";
import { cta } from "@/data/copy";

export function CatalogFaq() {
  return (
    <section className="mt-16" aria-labelledby="catalog-faq-title">
      <h2 id="catalog-faq-title" className="font-display text-2xl">
        Вопросы о каталоге проектов
      </h2>
      <Accordion type="single" collapsible className="mt-6 max-w-3xl">
        {catalogFaq.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button asChild className="mt-8" size="lg">
        <Link href="/catalog#catalog-picker">Подобрать проект под мой участок</Link>
      </Button>
      <p className="mt-3 text-xs text-muted">
        Или{" "}
        <Link href="/calculator" className="underline underline-offset-2">
          {cta.calculateCost}
        </Link>
      </p>
    </section>
  );
}
