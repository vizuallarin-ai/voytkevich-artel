"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ObjectsMapFAQ({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="objects-map-faq" className="mt-16">
      <h2 id="objects-map-faq" className="heading-section text-2xl">
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
