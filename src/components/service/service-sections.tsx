import Link from "next/link";
import { ArrowRight, Calculator, LayoutGrid } from "lucide-react";
import type { ServicePage } from "@/types/service-page";
import { Button } from "@/components/ui/button";
import {
  buildServiceCalculatorUrl,
  buildServicePlannerUrl,
  getServicePagePath,
} from "@/lib/service-pages";

export function ServiceHero({ page }: { page: ServicePage }) {
  const calcUrl = buildServiceCalculatorUrl(page);
  const catalogUrl = page.relatedCatalogHref ?? "/catalog";

  return (
    <header className="relative overflow-hidden rounded-sm border border-graphite/10 bg-muted-bg/40 p-6 md:p-10 lg:p-12">
      <div className="relative z-10 max-w-3xl">
        <p className="label-caps">{page.serviceType}</p>
        <h1 className="heading-section mt-2">{page.h1}</h1>
        <p className="mt-4 text-lg text-muted">{page.subtitle}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={calcUrl}>
              <Calculator className="mr-2 h-4 w-4" aria-hidden />
              {page.cta.heroPrimary}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={catalogUrl}>
              <LayoutGrid className="mr-2 h-4 w-4" aria-hidden />
              {page.cta.heroSecondary}
            </Link>
          </Button>
        </div>

        <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(page.quickFacts ?? []).map((fact) => (
            <li
              key={fact}
              className="flex items-start gap-2 text-sm text-muted before:mt-1.5 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-graphite"
            >
              {fact}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-muted">
          Стоимость зависит от участка, проекта, фундамента, инженерии, материалов и комплектации.
        </p>
      </div>
    </header>
  );
}

export function ServiceIntro({ page }: { page: ServicePage }) {
  return (
    <section aria-labelledby="service-intro-title">
      <h2 id="service-intro-title" className="heading-section text-2xl md:text-3xl">
        О направлении
      </h2>
      <p className="mt-4 max-w-3xl text-muted leading-relaxed">{page.intro}</p>
    </section>
  );
}

export function ServiceAudience({ page }: { page: ServicePage }) {
  return (
    <section aria-labelledby="service-audience-title">
      <h2 id="service-audience-title" className="heading-section text-2xl md:text-3xl">
        Кому подходит
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {page.audience.map((item) => (
          <article
            key={item.title}
            className="rounded-sm border border-graphite/10 bg-background p-5 shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-display text-lg">{item.title}</h3>
            <p className="mt-2 text-sm text-muted">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ServiceIncludes({ page, note }: { page: ServicePage; note: string }) {
  return (
    <section aria-labelledby="service-includes-title" className="rounded-sm bg-muted-bg/60 p-6 md:p-8">
      <h2 id="service-includes-title" className="heading-section text-2xl md:text-3xl">
        Что входит в работу
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {page.includes.map((item) => (
          <li key={item.title} className="flex gap-3 text-sm">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-graphite" aria-hidden />
            <span>
              <span className="font-medium text-foreground">{item.title}</span>
              {item.description && (
                <span className="mt-0.5 block text-muted">{item.description}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">{note}</p>
    </section>
  );
}

export function ServiceExclusions({ page }: { page: ServicePage }) {
  if (!page.exclusions?.length) return null;
  return (
    <section aria-labelledby="service-exclusions-title">
      <h2 id="service-exclusions-title" className="heading-section text-2xl md:text-3xl">
        {page.exclusionsTitle ?? "На что обратить внимание"}
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {page.exclusions.map((item) => (
          <li
            key={item.title}
            className="rounded-sm border border-dashed border-graphite/20 px-4 py-3 text-sm text-muted"
          >
            {item.title}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ServicePriceFactors({ page }: { page: ServicePage }) {
  const calcUrl = buildServiceCalculatorUrl(page);
  return (
    <section aria-labelledby="service-price-title">
      <h2 id="service-price-title" className="heading-section text-2xl md:text-3xl">
        От чего зависит стоимость
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {page.priceFactors.map((item) => (
          <div key={item.title} className="rounded-sm border border-graphite/10 p-4">
            <h3 className="font-medium">{item.title}</h3>
            {item.description && (
              <p className="mt-1 text-sm text-muted">{item.description}</p>
            )}
          </div>
        ))}
      </div>
      <Button asChild className="mt-8" size="lg">
        <Link href={calcUrl}>
          {page.cta.priceFactors ?? page.cta.calculator ?? "Рассчитать стоимость"}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </section>
  );
}

export function ServiceCalculatorCTA({ page }: { page: ServicePage }) {
  const calcUrl = buildServiceCalculatorUrl(page);
  const plannerUrl = buildServicePlannerUrl(page);
  return (
    <section
      aria-labelledby="service-calc-cta-title"
      className="grid gap-6 rounded-sm border border-graphite/10 bg-graphite p-6 text-background md:grid-cols-2 md:p-8"
    >
      <div>
        <h2 id="service-calc-cta-title" className="font-display text-2xl">
          {page.cta.calculator ?? "Рассчитать стоимость"}
        </h2>
        <p className="mt-2 text-sm text-background/80">
          Предварительный расчёт по площади, материалу, этажности и комплектации. Точная смета — после
          уточнения участка и проекта.
        </p>
        <Button asChild className="mt-6 bg-background text-graphite hover:bg-background/90" size="lg">
          <Link href={calcUrl}>{page.cta.calculator ?? "Рассчитать стоимость"}</Link>
        </Button>
      </div>
      <div className="rounded-sm border border-background/20 p-5">
        <h3 className="font-display text-xl">Собрать планировку</h3>
        <p className="mt-2 text-sm text-background/80">
          Планировщик поможет определить площадь и набор комнат — удобная отправная точка перед
          проектом.
        </p>
        <Button asChild variant="outline" className="mt-4 border-background/40 text-background hover:bg-background/10" size="lg">
          <Link href={plannerUrl}>Собрать планировку</Link>
        </Button>
      </div>
    </section>
  );
}

export function ServiceProcess({ steps }: { page: ServicePage; steps: ServicePage["process"] }) {
  const items = steps ?? [];
  if (!items.length) return null;
  return (
    <section aria-labelledby="service-process-title">
      <h2 id="service-process-title" className="heading-section text-2xl md:text-3xl">
        Процесс работы
      </h2>
      <ol className="mt-8 space-y-6">
        {items.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-graphite text-sm font-medium text-background">
              {i + 1}
            </span>
            <div>
              <h3 className="font-display text-lg">{step.title}</h3>
              {step.description && (
                <p className="mt-1 text-sm text-muted">{step.description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6">
        <Link href="/process" className="text-sm font-medium underline underline-offset-4 hover:text-muted">
          Подробнее о процессе строительства →
        </Link>
      </p>
    </section>
  );
}

export function ServiceTrustBlock() {
  const facts = [
    { value: "2014", label: "строим с года" },
    { value: "127+", label: "построенных домов" },
    { value: "5 лет", label: "гарантия на конструктив" },
    { value: "Фотоотчёты", label: "контроль на объекте" },
  ];
  return (
    <section
      aria-labelledby="service-trust-title"
      className="rounded-sm border border-graphite/10 bg-muted-bg/40 p-6 md:p-8"
    >
      <h2 id="service-trust-title" className="heading-section text-2xl md:text-3xl">
        Почему строительство должно быть понятным
      </h2>
      <p className="mt-4 max-w-3xl text-muted">
        Дом — дорогой и тревожный проект. Вы должны понимать смету, этапы, материалы и ответственность
        подрядчика. Предварительный расчёт не заменяет смету, а проект адаптируется под участок и задачи
        семьи.
      </p>
      <dl className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="font-display text-2xl md:text-3xl">{f.value}</dt>
            <dd className="mt-1 text-sm text-muted">{f.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ServiceRisks({ page }: { page: ServicePage }) {
  const leadAnchor = `#lead-${page.slug}`;
  return (
    <section aria-labelledby="service-risks-title">
      <h2 id="service-risks-title" className="heading-section text-2xl md:text-3xl">
        Какие ошибки важно избежать
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {page.risks.map((item) => (
          <div
            key={item.title}
            className="rounded-sm border border-graphite/10 bg-background p-5"
          >
            <h3 className="font-medium">{item.title}</h3>
            {item.description && (
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            )}
          </div>
        ))}
      </div>
      <Button asChild variant="outline" className="mt-8" size="lg">
        <Link href={leadAnchor}>{page.cta.risks ?? "Разобрать мой случай"}</Link>
      </Button>
    </section>
  );
}

export function ServiceSeoText({ page }: { page: ServicePage }) {
  const paragraphs = page.seoText.split("\n\n").filter(Boolean);
  return (
    <section aria-labelledby="service-seo-text-title" className="border-t border-graphite/10 pt-12">
      <h2 id="service-seo-text-title" className="sr-only">
        Подробнее о {page.title.toLowerCase()}
      </h2>
      <div className="prose-service max-w-3xl space-y-4 text-muted leading-relaxed">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
      <Button asChild className="mt-8" size="lg">
        <Link href={buildServiceCalculatorUrl(page)}>
          {page.cta.calculator ?? "Рассчитать стоимость"}
        </Link>
      </Button>
    </section>
  );
}

export function ServiceRelatedLinks({ page }: { page: ServicePage }) {
  return (
    <section aria-labelledby="service-related-title">
      <h2 id="service-related-title" className="heading-section text-2xl md:text-3xl">
        Полезные разделы
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {page.relatedLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-sm border border-graphite/10 p-4 transition hover:border-graphite/25 hover:shadow-sm"
          >
            <span className="font-medium group-hover:underline">{link.label}</span>
            {link.description && (
              <span className="mt-1 block text-sm text-muted">{link.description}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Hidden anchor target for hero path reference */
export function servicePageLeadId(page: ServicePage): string {
  return `lead-${page.slug}`;
}

export function getServicePageUrl(page: ServicePage): string {
  return getServicePagePath(page.slug);
}
