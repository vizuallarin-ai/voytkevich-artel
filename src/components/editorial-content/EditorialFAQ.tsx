"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { EditorialContentItem } from "@/types/editorial-content";

export function EditorialFAQ({ item }: { item: EditorialContentItem }) {
  if (!item.faq?.length) return null;

  return (
    <section className="mt-12" aria-labelledby="editorial-faq">
      <h2 id="editorial-faq" className="font-display text-2xl">
        Частые вопросы
      </h2>
      <Accordion type="single" collapsible className="mt-4">
        {item.faq.map((faqItem, i) => (
          <AccordionItem key={faqItem.question} value={`faq-${i}`}>
            <AccordionTrigger className="text-left">{faqItem.question}</AccordionTrigger>
            <AccordionContent className="text-muted">{faqItem.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
