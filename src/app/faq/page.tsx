import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { faqItems } from "@/data/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd, faqSchema } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";
import { LeadForm } from "@/components/forms/lead-form";

export const metadata: Metadata = pageMetadata({
  title: "FAQ — частые вопросы о строительстве домов",
  description: "Ответы о стоимости, сроках, ипотеке, гарантиях и процессе строительства.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="pt-28 pb-20">
      <JsonLd data={faqSchema(faqItems)} />
      <div className="container-narrow grid gap-16 px-5 md:px-10 lg:grid-cols-2 lg:px-16">
        <div>
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "FAQ" }]} />
          <h1 className="heading-section">Частые вопросы</h1>
          <Accordion type="single" collapsible className="mt-8">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <LeadForm title="Не нашли ответ?" subtitle="Задайте вопрос архитектору" />
      </div>
    </div>
  );
}
