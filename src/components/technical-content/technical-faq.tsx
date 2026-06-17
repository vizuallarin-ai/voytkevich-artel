"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { TechnicalArticle } from "@/types/technical-content";
import { trackTechnicalFaqOpened } from "@/lib/technical-content/technical-analytics";

export function TechnicalFAQ({ article }: { article: TechnicalArticle }) {
  if (!article.faq.length) return null;

  return (
    <section className="mt-12" aria-labelledby="technical-faq">
      <h2 id="technical-faq" className="font-display text-2xl">
        Частые вопросы
      </h2>
      <Accordion
        type="single"
        collapsible
        className="mt-4"
        onValueChange={(value) => {
          if (value) {
            trackTechnicalFaqOpened({ articleSlug: article.slug, faqId: value });
          }
        }}
      >
        {article.faq.map((item, i) => (
          <AccordionItem key={item.question} value={`faq-${i}`}>
            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
