import Link from "next/link";
import Image from "next/image";
import type { CaseItem } from "@/types/case";
import type { Project } from "@/types";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd, articleSchema, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/forms/lead-form";
import {
  buildCaseLeadComment,
  buildCaseLeadSource,
  formatCaseLocation,
  getRelatedCases,
  getRelatedBlogPostsForCase,
  isCasePublic,
  caseStatusLabel,
} from "@/lib/cases";
import { getBuiltObjectByCaseSlug } from "@/lib/built-objects";
import { allBuiltObjects } from "@/data/built-objects";
import { filterProjects } from "@/lib/filters";
import { CaseFAQ, defaultCaseFaqs } from "./case-faq";
import { CaseRelatedLinks, CaseRelatedProjects, RelatedCasesSection } from "./case-related";

type Props = {
  item: CaseItem;
  allCases: CaseItem[];
  projects: Project[];
};

export function CasePageTemplate({ item, allCases, projects }: Props) {
  const isPublic = isCasePublic(item);
  const location = formatCaseLocation(item);
  const faqs = item.faqs?.length ? item.faqs : defaultCaseFaqs;

  const relatedProjects = (() => {
    if (item.project?.projectSlug) {
      const linked = projects.find((p) => p.slug === item.project!.projectSlug);
      if (linked) return [linked, ...filterProjects(projects, { material: linked.specs.material ? [linked.specs.material] : undefined }).filter((p) => p.slug !== linked.slug)].slice(0, 5);
    }
    const filters: Parameters<typeof filterProjects>[1] = { sort: "featured" };
    if (item.house.material) {
      const m = item.house.material;
      if (["каркас", "газобетон", "кирпич", "брус", "клееный брус"].includes(m)) {
        filters.material = [m as import("@/types").Material];
      }
    }
    if (item.house.floors) filters.floors = [item.house.floors];
    if (item.house.area) {
      filters.areaMin = Math.max(0, item.house.area - 30);
      filters.areaMax = item.house.area + 30;
    }
    return filterProjects(projects, filters);
  })();

  const relatedCases = getRelatedCases(allCases, item);
  const blogPosts = getRelatedBlogPostsForCase(item);
  const blogLinks = blogPosts.map((p) => ({ href: `/blog/${p.slug}`, label: p.title }));
  const mapObject = getBuiltObjectByCaseSlug(allBuiltObjects, item.slug);

  const schemas: Record<string, unknown>[] = [
    articleSchema({
      title: item.h1,
      description: item.excerpt,
      image: item.gallery?.[0]?.src ?? `${SITE_URL}/og-default.jpg`,
      datePublished: item.timeline?.startDate ?? `${item.timeline?.year ?? 2024}-01-01`,
      dateModified: item.timeline?.finishDate,
      author: "Строительная артель Александра Войткевича",
      url: `${SITE_URL}/cases/${item.slug}`,
    }),
    breadcrumbSchema([
      { name: "Главная", url: SITE_URL },
      { name: "Кейсы", url: `${SITE_URL}/cases` },
      { name: item.h1, url: `${SITE_URL}/cases/${item.slug}` },
    ]),
  ];
  if (faqs.length) schemas.push(faqSchema(faqs));

  const summaryRows = [
    { label: "Площадь", value: item.house.area ? `${item.house.area} м²` : null },
    { label: "Этажность", value: item.house.floors ? `${item.house.floors} эт.` : null },
    { label: "Материал", value: item.house.material },
    { label: "Назначение", value: item.house.purpose?.join(", ") },
    { label: "Локация", value: location },
    { label: "Формат работ", value: item.house.workFormat },
    { label: "Срок", value: item.timeline?.durationMonths ? `${item.timeline.durationMonths} мес.` : item.timeline?.year ? `${item.timeline.year}` : null },
    { label: "Проект", value: item.project?.customProject ? "Индивидуальный" : item.project?.projectTitle },
    { label: "Комплектация", value: item.house.completion },
    { label: "Статус", value: isPublic ? "Построен и сдан" : caseStatusLabel(item.status) },
  ].filter((r) => r.value);

  return (
    <article className="pt-28 pb-20">
      <JsonLd data={schemas} />
      <div className="container-narrow max-w-3xl px-5 md:px-10">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Кейсы", href: "/cases" },
            { label: item.h1 },
          ]}
        />

        {!isPublic ? (
          <div className="mt-6 rounded-sm border border-amber-200/60 bg-amber-50/80 px-4 py-3 text-sm text-muted dark:border-amber-900/40 dark:bg-amber-950/20">
            Это внутренняя заготовка ({caseStatusLabel(item.status)}). Не является публичным
            подтверждённым кейсом построенного дома.
          </div>
        ) : null}

        <h1 className="heading-section mt-6">{item.h1}</h1>
        <p className="mt-4 text-muted leading-relaxed">{item.excerpt}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags?.map((tag) => (
            <span key={tag} className="rounded-full bg-wood/10 px-2.5 py-0.5 text-xs text-wood">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild>
            <Link href="#case-lead">{item.leadCTA?.label ?? "Хочу похожий дом"}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/calculator?source=case&case=${item.slug}`}>Рассчитать стоимость</Link>
          </Button>
          {mapObject ? (
            <Button asChild variant="outline">
              <Link href="/objects-map">Посмотреть на карте</Link>
            </Button>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-muted">
          Каждый участок и проект индивидуальны. Стоимость и сроки похожего дома уточняются после
          вводных.
        </p>

        {item.budget?.showBudget === false && item.budget.note ? (
          <p className="mt-4 text-sm text-muted">{item.budget.note}</p>
        ) : null}

        {summaryRows.length > 0 ? (
          <section aria-labelledby="case-summary" className="mt-12">
            <h2 id="case-summary" className="heading-section text-2xl">
              Кратко об объекте
            </h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {summaryRows.map((row) => (
                <div key={row.label} className="rounded-sm border border-graphite/10 p-4">
                  <dt className="text-xs text-muted">{row.label}</dt>
                  <dd className="mt-1 font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section aria-labelledby="case-task" className="mt-12">
          <h2 id="case-task" className="heading-section text-2xl">
            Задача клиента
          </h2>
          <h3 className="mt-4 font-display text-lg">{item.clientTask.title}</h3>
          <p className="mt-2 text-muted leading-relaxed">{item.clientTask.description}</p>
          {item.clientTask.goals?.length ? (
            <ul className="mt-4 list-disc space-y-1 pl-6 text-sm text-muted">
              {item.clientTask.goals.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          ) : null}
        </section>

        {item.initialInputs ? (
          <section aria-labelledby="case-inputs" className="mt-12">
            <h2 id="case-inputs" className="heading-section text-2xl">
              С чем стартовали
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {item.initialInputs.land ? <li>• Участок: {item.initialInputs.land}</li> : null}
              {item.initialInputs.familyScenario ? <li>• Сценарий: {item.initialInputs.familyScenario}</li> : null}
              {item.initialInputs.budgetGoal ? <li>• Бюджет: {item.initialInputs.budgetGoal}</li> : null}
              {item.initialInputs.projectGoal ? <li>• Проект: {item.initialInputs.projectGoal}</li> : null}
              {item.initialInputs.constraints?.map((c) => (
                <li key={c}>• {c}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {item.project ? (
          <section aria-labelledby="case-solution" className="mt-12">
            <h2 id="case-solution" className="heading-section text-2xl">
              Какое решение выбрали
            </h2>
            {item.project.customProject ? (
              <p className="mt-4 text-muted">Индивидуальное решение под участок и задачу клиента.</p>
            ) : item.project.projectSlug ? (
              <div className="mt-4">
                <p className="text-muted">
                  За основу взят проект{" "}
                  <Link href={`/catalog/${item.project.projectSlug}`} className="text-wood underline">
                    {item.project.projectTitle}
                  </Link>
                  .
                </p>
                <Button asChild variant="outline" className="mt-4" size="sm">
                  <Link href={`/catalog/${item.project.projectSlug}`}>Смотреть похожий проект</Link>
                </Button>
              </div>
            ) : null}
          </section>
        ) : null}

        {item.challenges?.length ? (
          <section aria-labelledby="case-challenges" className="mt-12">
            <h2 id="case-challenges" className="heading-section text-2xl">
              Что было сложным и как решили
            </h2>
            <div className="mt-6 space-y-6">
              {item.challenges.map((ch) => (
                <div key={ch.title} className="rounded-sm border border-graphite/10 p-5">
                  <h3 className="font-display text-lg">{ch.title}</h3>
                  <p className="mt-2 text-sm text-muted">{ch.description}</p>
                  <p className="mt-3 text-sm">
                    <span className="font-medium">Решение: </span>
                    {ch.solution}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {item.stages?.length ? (
          <section aria-labelledby="case-stages" className="mt-12">
            <h2 id="case-stages" className="heading-section text-2xl">
              Этапы работ
            </h2>
            <ol className="mt-6 space-y-6">
              {item.stages.map((stage, i) => (
                <li key={stage.title} className="border-l-2 border-wood/30 pl-5">
                  <p className="text-xs text-muted">Этап {i + 1}{stage.date ? ` · ${stage.date}` : ""}</p>
                  <h3 className="mt-1 font-display text-lg">{stage.title}</h3>
                  <p className="mt-2 text-sm text-muted">{stage.description}</p>
                  {stage.image ? (
                    <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-sm">
                      <Image src={stage.image} alt={stage.title} fill className="object-cover" />
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
            <Button asChild variant="ghost" className="mt-6 h-auto px-0 text-wood">
              <Link href="/process">Посмотреть, как проходит строительство →</Link>
            </Button>
          </section>
        ) : null}

        {item.gallery?.length ? (
          <section aria-labelledby="case-gallery" className="mt-12">
            <h2 id="case-gallery" className="heading-section text-2xl">
              Фото объекта
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {item.gallery.map((img) => (
                <figure key={img.src} className="overflow-hidden rounded-sm">
                  <div className="relative aspect-[4/3]">
                    <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="50vw" />
                  </div>
                  {img.caption ? (
                    <figcaption className="mt-2 text-xs text-muted">{img.caption}</figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {item.result ? (
          <section aria-labelledby="case-result" className="mt-12">
            <h2 id="case-result" className="heading-section text-2xl">
              Что получилось
            </h2>
            <p className="mt-4 text-muted leading-relaxed">{item.result.description}</p>
            {item.result.highlights?.length ? (
              <ul className="mt-4 list-disc space-y-1 pl-6 text-sm text-muted">
                {item.result.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        {item.testimonial?.verified ? (
          <section aria-labelledby="case-testimonial" className="mt-12 rounded-sm border border-graphite/10 bg-graphite/[0.02] p-6">
            <h2 id="case-testimonial" className="heading-section text-xl">
              Отзыв заказчика
            </h2>
            <blockquote className="mt-4 text-muted leading-relaxed">&ldquo;{item.testimonial.text}&rdquo;</blockquote>
            <p className="mt-4 text-sm font-medium">
              {item.testimonial.authorName}
              {item.testimonial.authorLabel ? `, ${item.testimonial.authorLabel}` : ""}
            </p>
          </section>
        ) : item.testimonial && !isPublic ? (
          <p className="mt-8 text-xs text-muted">
            Отзыв в заготовке не подтверждён (verified: false) — не публикуется на сайте.
          </p>
        ) : null}

        {item.takeaways?.length ? (
          <section aria-labelledby="case-takeaways" className="mt-12">
            <h2 id="case-takeaways" className="heading-section text-2xl">
              Что можно взять из этого кейса для своего дома
            </h2>
            <ul className="mt-4 list-disc space-y-1 pl-6 text-muted">
              {item.takeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <CaseRelatedProjects projects={relatedProjects} caseSlug={item.slug} />
        <RelatedCasesSection cases={relatedCases} />
        <CaseRelatedLinks serviceSlugs={item.relatedServiceSlugs} blogLinks={blogLinks} />
        <CaseFAQ items={faqs} />

        <div id="case-lead" className="mt-16 border-t border-graphite/10 pt-16">
          <LeadForm
            id="case-lead-form"
            title="Хотите похожий дом?"
            subtitle={
              item.leadCTA?.description ??
              "Оставьте контакты — обсудим участок, площадь, материал, бюджет и подскажем, можно ли взять этот кейс или похожий проект за основу."
            }
            source={buildCaseLeadSource(item)}
            prefilledComment={buildCaseLeadComment(item, "similar-house")}
            submitLabel="Обсудить похожий дом"
            footnote="Сначала уточним вводные. Стоимость и сроки похожего дома считаются отдельно."
          />
        </div>
      </div>
    </article>
  );
}
