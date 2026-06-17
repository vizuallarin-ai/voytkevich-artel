import type { ProgrammaticPageData } from "@/types/programmatic-page-template";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ProgrammaticFAQ({ page }: { page: ProgrammaticPageData }) {
  return (
    <section className="mt-16" aria-labelledby="programmatic-faq">
      <h2 id="programmatic-faq" className="font-display text-2xl md:text-3xl">
        Частые вопросы
      </h2>
      <Accordion type="single" collapsible className="mt-6 max-w-3xl">
        {page.faq.map((item, i) => (
          <AccordionItem key={item.question} value={`faq-${i}`}>
            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
