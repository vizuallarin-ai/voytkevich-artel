import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { ScenarioCards } from "@/components/home/scenario-cards";
import { CalculatorPromo } from "@/components/home/calculator-promo";
import { HomeGeoLinks } from "@/components/home/home-geo-links";
import { HomeSectionImage } from "@/components/home/home-section-image";
import { LeadForm } from "@/components/forms/lead-form";
import { LeadMagnetsBlock } from "@/components/lead-magnets/lead-magnets-block";
import { ProjectCard } from "@/components/catalog/project-card";
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal";
import { StatDisplay } from "@/components/animations/stat-display";
import { companyStats } from "@/data/company";
import {
  audienceSegments,
  casesBlock,
  catalogHomeCategories,
  finalLeadBlock,
  hiddenCostsBlock,
  homeFaqItems,
  homeProcessSteps,
  homeSeoText,
  keyBenefits,
  trustHomeBlock,
  whatWeTakeBlock,
} from "@/data/home";
import { cta, founderBlock, pageMeta } from "@/data/copy";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cms } from "@/lib/cms/local";
import { pageMetadata } from "@/lib/seo";
import { photos, unsplash, homeSectionPhotos } from "@/data/images";

export const metadata: Metadata = pageMetadata({
  title: pageMeta.home.title,
  description: pageMeta.home.description,
  path: "/",
});

export default async function HomePage() {
  const allProjects = await cms.getProjects();
  const featured = allProjects.filter((p) => p.featured).slice(0, 6);
  const displayProjects = featured.length >= 3 ? featured : allProjects.slice(0, 6);

  return (
    <>
      <Hero />

      <ScenarioCards />

      {/* 3. Ключевые преимущества */}
      <section className="section-padding bg-muted-bg" aria-labelledby="benefits-title">
        <div className="container-narrow">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <p className="label-caps">Преимущества</p>
              <h2 id="benefits-title" className="heading-section mt-2">
                Почему строительство с нами понятнее и спокойнее
              </h2>
            </Reveal>
            <HomeSectionImage
              src={homeSectionPhotos.gazobetonExterior}
              alt="Дом из газобетона — фасад готового объекта"
            />
          </div>
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {keyBenefits.map((b) => (
              <StaggerItem key={b.title}>
                <div className="h-full rounded-sm border border-graphite/10 bg-background p-6">
                  <h3 className="font-display text-lg">{b.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{b.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CalculatorPromo />

      {/* 5. Каталог */}
      <section id="catalog-preview" className="section-padding">
        <div className="container-narrow">
          <Reveal>
            <p className="label-caps">Каталог</p>
            <h2 className="heading-section mt-2">Проекты домов под разные задачи и бюджеты</h2>
            <p className="mt-4 max-w-2xl text-muted">
              Готовые проекты с ориентировочной ценой, сроком и материалом. Каждый можно адаптировать
              под участок и комплектацию.
            </p>
          </Reveal>

          <nav
            className="mt-8 flex flex-wrap gap-2"
            aria-label="Категории проектов"
          >
            {catalogHomeCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalog/kategoriya/${cat.slug}`}
                className="rounded-full border border-graphite/15 bg-background px-3 py-1.5 text-xs transition hover:border-graphite"
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          <Stagger className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {displayProjects.map((p) => (
              <StaggerItem key={p.id}>
                <ProjectCard project={p} />
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/catalog">Смотреть все проекты</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/#lead">{cta.discussPlot}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Защита от скрытых доплат */}
      <section className="section-padding bg-muted-bg" aria-labelledby="hidden-costs-title">
        <div className="container-narrow">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <Reveal>
              <p className="label-caps">Прозрачность</p>
              <h2 id="hidden-costs-title" className="heading-section mt-2">
                {hiddenCostsBlock.title}
              </h2>
              <p className="mt-4 max-w-3xl text-muted">{hiddenCostsBlock.problem}</p>
              <p className="mt-4 max-w-3xl text-muted">{hiddenCostsBlock.position}</p>
            </Reveal>
            <HomeSectionImage
              src={homeSectionPhotos.construction}
              alt="Строительство дома — работы на объекте"
            />
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {hiddenCostsBlock.solutions.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-sm border border-graphite/10 bg-muted-bg/50 px-5 py-4 text-sm"
              >
                <span className="font-display text-wood" aria-hidden>
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-10" size="lg">
            <Link href="/#lead">{cta.preliminaryEstimate}</Link>
          </Button>
        </div>
      </section>

      {/* 7. Процесс */}
      <section className="section-padding" aria-labelledby="process-title">
        <div className="container-narrow">
          <Reveal>
            <p className="label-caps">Процесс</p>
            <h2 id="process-title" className="heading-section mt-2">
              Понятный путь от идеи до готового дома
            </h2>
          </Reveal>
          <div className="mt-12 space-y-6">
            {homeProcessSteps.map((step, i) => (
              <Reveal key={step.id} delay={i * 0.04}>
                <div className="grid gap-4 border-b border-graphite/10 pb-6 md:grid-cols-[3rem_1fr]">
                  <span className="font-display text-3xl text-sand">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-lg font-medium">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted">{step.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Button asChild className="mt-8" variant="outline">
            <Link href="/process">Посмотреть процесс подробнее</Link>
          </Button>
        </div>
      </section>

      {/* 8. Кейсы — честная заготовка */}
      <section className="section-padding bg-muted-bg" aria-labelledby="cases-title">
        <div className="container-narrow">
          <Reveal>
            <p className="label-caps">Примеры</p>
            <h2 id="cases-title" className="heading-section mt-2">
              {casesBlock.title}
            </h2>
            <p className="mt-4 max-w-3xl text-sm text-muted">{casesBlock.disclaimer}</p>
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {displayProjects.slice(0, 3).map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-sm border border-graphite/10"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={p.images[0]}
                    alt={`Проект ${p.name} — пример из каталога`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg">{p.name}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {p.specs.area} м² · {p.specs.material} · {p.specs.buildTimeMonths} мес.
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Задача: подобрать дом под участок и бюджет семьи
                  </p>
                  <Button asChild variant="ghost" className="mt-4 px-0" size="sm">
                    <Link href={`/catalog/${p.slug}`}>Смотреть проект</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <Link href="/cases">Раздел кейсов</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/catalog">Смотреть проекты</Link>
            </Button>
            <Button asChild>
              <Link href="/#lead">Хочу похожий дом</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 9. Доверие */}
      <section className="section-padding bg-graphite text-background" aria-labelledby="trust-title">
        <div className="container-narrow">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <p className="label-caps text-background/50">Доверие</p>
              <h2 id="trust-title" className="heading-section mt-2">
                {trustHomeBlock.title}
              </h2>
              <p className="mt-4 text-background/80">{trustHomeBlock.description}</p>
              <div className="mt-8">
                <p className="font-display text-xl">{founderBlock.title}</p>
                <p className="mt-3 text-sm text-background/70">{founderBlock.description}</p>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {companyStats.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl md:text-3xl">
                      <StatDisplay value={s.value} suffix={s.suffix} decimals={s.decimals} />
                    </p>
                    <p className="mt-1 text-xs text-background/60">{s.label}</p>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-10" variant="outline">
                <Link href="/about" className="border-background/30 text-background hover:bg-background/10">
                  Узнать о компании
                </Link>
              </Button>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                <Image
                  src={unsplash(photos.teamFounder, { w: 800, h: 1000 })}
                  alt="Руководитель строительной артели — контроль проекта и стройки"
                  fill
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <HomeGeoLinks />

      {/* 10. Для кого */}
      <section className="section-padding" aria-labelledby="audience-title">
        <div className="container-narrow">
          <Reveal>
            <p className="label-caps">Для кого</p>
            <h2 id="audience-title" className="heading-section mt-2">
              Для каких задач строим дома
            </h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {audienceSegments.map((card) => (
              <StaggerItem key={card.title}>
                <div className="h-full rounded-sm border border-graphite/10 bg-background p-6">
                  <h3 className="font-display text-xl">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{card.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 11. Что входит */}
      <section className="section-padding" aria-labelledby="scope-title">
        <div className="container-narrow">
          <Reveal>
            <p className="label-caps">Комплектация</p>
            <h2 id="scope-title" className="heading-section mt-2">
              {whatWeTakeBlock.title}
            </h2>
            <p className="mt-4 max-w-2xl text-muted">{whatWeTakeBlock.footnote}</p>
          </Reveal>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {whatWeTakeBlock.items.map((item) => (
              <li
                key={item}
                className="flex gap-2 rounded-sm border border-graphite/10 bg-background px-4 py-3 text-sm leading-snug"
              >
                <span className="text-wood" aria-hidden>
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-10" variant="outline">
            <Link href="/#lead">Обсудить комплектацию</Link>
          </Button>
        </div>
      </section>

      {/* 12. SEO-текст */}
      <section className="section-padding bg-muted-bg" aria-labelledby="seo-text-title">
        <div className="container-narrow max-w-3xl">
          <Reveal>
            <h2 id="seo-text-title" className="heading-section text-2xl md:text-3xl">
              {homeSeoText.title}
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted md:text-base">
              {homeSeoText.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            <p className="mt-6 text-sm">
              <Link href="/calculator" className="text-wood underline underline-offset-4">
                Калькулятор стоимости
              </Link>
              {" · "}
              <Link href="/catalog" className="text-wood underline underline-offset-4">
                Каталог проектов
              </Link>
              {" · "}
              <Link href="/blog" className="text-wood underline underline-offset-4">
                Блог о строительстве
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* 12b. Лид-магниты — промежуточные шаги */}
      <section className="section-padding" aria-labelledby="lead-magnets-home">
        <div className="container-narrow">
          <LeadMagnetsBlock
            pageType="home"
            magnetIds={[
              "mistakes-checklist",
              "cost-review",
              "budget-project-selection",
              "land-checklist",
            ]}
            maxItems={4}
          />
        </div>
      </section>

      {/* 13. FAQ */}
      <section className="section-padding bg-muted-bg" aria-labelledby="faq-title">
        <div className="container-narrow max-w-3xl">
          <Reveal>
            <h2 id="faq-title" className="heading-section">
              Частые вопросы
            </h2>
          </Reveal>
          <Accordion type="single" collapsible className="mt-8">
            {homeFaqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/#lead">Задать вопрос по моему дому</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/faq">{cta.allFaq}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 14. Финальная форма */}
      <section id="lead" className="section-padding bg-muted-bg">
        <div className="container-narrow grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="label-caps">{finalLeadBlock.label}</p>
            <h2 className="heading-section mt-2">{finalLeadBlock.title}</h2>
            <p className="mt-4 text-muted">{finalLeadBlock.subtitle}</p>
            <p className="mt-6 text-sm text-muted">{finalLeadBlock.footnote}</p>
          </Reveal>
          <LeadForm
            title={cta.preliminaryEstimate}
            subtitle="Имя и телефон — на втором шаге уточним площадь, бюджет и участок. Ответ в течение рабочего дня."
            leadConfig={{
              sourceType: "home",
              formId: "home-lead",
              formName: "Главная форма заявки",
              requestType: "callback",
              requestTitle: cta.preliminaryEstimate,
              selectedCTA: cta.preliminaryEstimate,
              conversionGoal: "callback_request",
            }}
          />
        </div>
      </section>
    </>
  );
}
