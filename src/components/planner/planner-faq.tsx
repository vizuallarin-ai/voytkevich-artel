import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { plannerFaq } from "@/data/planner-copy";

export function PlannerFaq() {
  return (
    <section className="mt-16" aria-labelledby="planner-faq-title">
      <h2 id="planner-faq-title" className="font-display text-2xl">
        Вопросы о планировке
      </h2>
      <Accordion type="single" collapsible className="mt-6 max-w-3xl">
        {plannerFaq.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button asChild className="mt-8" size="lg">
        <Link href="#planner-wizard">Собрать мою планировку</Link>
      </Button>
    </section>
  );
}
