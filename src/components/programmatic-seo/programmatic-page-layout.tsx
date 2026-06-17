import type { ProgrammaticPageData } from "@/types/programmatic-page-template";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ProgrammaticPageTracker } from "./programmatic-page-tracker";
import { ProgrammaticHero } from "./programmatic-hero";
import { ProgrammaticProjectGrid } from "./programmatic-project-grid";
import { ProgrammaticFilters } from "./programmatic-filters";
import { ProgrammaticCTA } from "./programmatic-cta";
import { ProgrammaticLeadMagnet } from "./programmatic-lead-magnet";
import { ProgrammaticFAQ } from "./programmatic-faq";
import { ProgrammaticRelatedPages } from "./programmatic-related-pages";
import { ProgrammaticSEOText } from "./programmatic-seo-text";
import { ProgrammaticLeadForm } from "./programmatic-lead-form";
import { ProgrammaticStickyCta } from "./programmatic-sticky-cta";

function hasBlock(page: ProgrammaticPageData, block: string) {
  return page.blocks.includes(block as ProgrammaticPageData["blocks"][number]);
}

export function ProgrammaticPageLayout({ page }: { page: ProgrammaticPageData }) {
  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: page.h1 },
  ];

  return (
    <div className="pt-28 pb-32">
      <ProgrammaticPageTracker page={page} />
      <JsonLd data={page.schema} />

      <div className="container-narrow px-5 md:px-10 lg:px-16">
        {hasBlock(page, "breadcrumbs") ? <Breadcrumbs items={crumbs} /> : null}

        {hasBlock(page, "hero") ? <ProgrammaticHero page={page} /> : null}

        {hasBlock(page, "intro") && page.content.intro ? (
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted">{page.content.intro}</p>
        ) : null}

        {hasBlock(page, "filters") && page.filterLinks.length > 0 ? (
          <ProgrammaticFilters page={page} />
        ) : null}

        {hasBlock(page, "project-grid") ? <ProgrammaticProjectGrid page={page} /> : null}

        {hasBlock(page, "cta") ? <ProgrammaticCTA page={page} position="middle" /> : null}

        {hasBlock(page, "who-it-fits") && page.content.whoItFits?.length ? (
          <section className="mt-16" aria-labelledby="who-it-fits">
            <h2 id="who-it-fits" className="font-display text-2xl md:text-3xl">
              Кому подходит
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {page.content.whoItFits.map((item) => (
                <li key={item} className="rounded-sm border border-graphite/10 bg-sand/30 px-4 py-3 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasBlock(page, "cost-factors") && page.content.costFactors?.length ? (
          <section className="mt-16" aria-labelledby="cost-factors">
            <h2 id="cost-factors" className="font-display text-2xl md:text-3xl">
              От чего зависит стоимость
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {page.content.costFactors.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-graphite" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasBlock(page, "how-to-choose") && page.content.howToChoose?.length ? (
          <section className="mt-16" aria-labelledby="how-to-choose">
            <h2 id="how-to-choose" className="font-display text-2xl md:text-3xl">
              Как выбрать
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
              {page.content.howToChoose.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
        ) : null}

        {hasBlock(page, "lead-magnet") && page.leadMagnet ? (
          <ProgrammaticLeadMagnet page={page} />
        ) : null}

        {hasBlock(page, "related-pages") ? <ProgrammaticRelatedPages page={page} /> : null}

        {hasBlock(page, "faq") && page.faq.length > 0 ? <ProgrammaticFAQ page={page} /> : null}

        {hasBlock(page, "seo-text") && page.content.seoText ? (
          <ProgrammaticSEOText text={page.content.seoText} />
        ) : null}

        {hasBlock(page, "final-form") ? <ProgrammaticLeadForm page={page} /> : null}
      </div>

      <ProgrammaticStickyCta page={page} />
    </div>
  );
}
