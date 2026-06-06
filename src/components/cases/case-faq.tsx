"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export { defaultCaseFaqs, casesIndexFaqs } from "@/data/case-faqs";

export function CaseFAQ({ items }: { items: { question: string; answer: string }[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="case-faq-title" className="mt-16">
      <h2 id="case-faq-title" className="heading-section text-2xl">
        Частые вопросы
      </h2>
      <Accordion type="single" collapsible className="mt-6 max-w-3xl">
        {items.map((item, i) => (
          <AccordionItem key={item.question} value={`faq-${i}`}>
            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

