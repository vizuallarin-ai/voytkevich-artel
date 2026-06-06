import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd, faqSchema } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";
import { allCases, publishedCases } from "@/data/cases";
import { publishedBuiltObjects } from "@/data/built-objects";
import { getFeaturedCases, getPublishedCases } from "@/lib/cases";
import {
  CasesHomeHero,
  CasesHowToRead,
  CasesSeoText,
} from "@/components/cases/cases-home-sections";
import { CasesListClient } from "@/components/cases/cases-list-client";
import { CaseCard } from "@/components/cases/case-card";
import { CaseFAQ } from "@/components/cases/case-faq";
import { casesIndexFaqs } from "@/data/case-faqs";
import { LeadForm } from "@/components/forms/lead-form";
import { Button } from "@/components/ui/button";

const hasPublished = publishedCases.length > 0;
const hasMapObjects = publishedBuiltObjects.length > 0;

export const metadata: Metadata = pageMetadata({
  title: hasPublished
    ? "Кейсы строительства домов в Иркутске — построенные дома и задачи клиентов"
    : "Кейсы строительства домов в Иркутске",
  description: hasPublished
    ? "Кейсы строительства домов: задачи клиентов, участки, проекты, материалы, этапы, сложности и результаты."
    : "Раздел кейсов готовится к наполнению реальными объектами, фото этапов и разбором решений.",
  path: "/cases",
});

export default function CasesPage() {
  const published = getPublishedCases(allCases);
  const featured = getFeaturedCases(allCases);

  return (
    <div className="pt-28 pb-20">
      <JsonLd data={faqSchema(casesIndexFaqs)} />
      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Кейсы" }]} />

        <CasesHomeHero hasPublished={hasPublished} />

        {featured.length > 0 ? (
          <section aria-labelledby="cases-featured" className="mt-16">
            <h2 id="cases-featured" className="heading-section text-2xl">
              Избранные кейсы
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => (
                <CaseCard key={item.slug} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        <CasesListClient cases={published} />

        <CasesHowToRead />

        {hasMapObjects ? (
          <div className="mt-12 rounded-sm border border-graphite/10 p-6 text-center">
            <p className="font-display text-lg">География построенных объектов</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Посмотрите районы и объекты на карте — без точных адресов частных домов.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/objects-map">Смотреть карту объектов</Link>
            </Button>
          </div>
        ) : null}

        <div className="mt-16 rounded-sm border border-wood/30 bg-wood/5 p-6 text-center md:p-8">
          <p className="font-display text-xl">Хотите похожий дом?</p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            Обсудим участок, площадь, материал и подберём проект или адаптацию под вашу задачу.
          </p>
          <Button asChild className="mt-4">
            <Link href="#cases-lead">Оставить заявку</Link>
          </Button>
        </div>

        <CasesSeoText hasPublished={hasPublished} />
        <CaseFAQ items={casesIndexFaqs} />

        <div id="cases-lead" className="mt-16 border-t border-graphite/10 pt-16">
          <LeadForm
            id="cases-home-lead"
            title="Хотите похожий дом?"
            subtitle="Оставьте контакты — обсудим задачу и подскажем следующий шаг: проект, расчёт или консультация."
            source="cases:home"
            prefilledComment="Источник: /cases"
            submitLabel="Обсудить похожий дом"
          />
        </div>
      </div>
    </div>
  );
}
