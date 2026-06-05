"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ServicePage } from "@/types/service-page";

export function ServiceFAQ({ page }: { page: ServicePage }) {
  return (
    <section aria-labelledby="service-faq-title">
      <h2 id="service-faq-title" className="heading-section text-2xl md:text-3xl">
        Частые вопросы
      </h2>
      <Accordion type="single" collapsible className="mt-6 max-w-3xl">
        {page.faqs.map((item, i) => (
          <AccordionItem key={item.question} value={`faq-${i}`}>
            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
