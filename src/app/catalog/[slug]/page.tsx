import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cms } from "@/lib/cms/local";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProjectGallery } from "@/components/project/project-gallery";
import { FloorPlanInteractive } from "@/components/project/floor-plan-interactive";
import { LeadForm } from "@/components/forms/lead-form";
import { ProjectViewTracker } from "@/components/project/project-view-tracker";
import { JsonLd, projectSchema, breadcrumbSchema } from "@/components/seo/json-ld";
import { formatPrice } from "@/lib/utils";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqItems } from "@/data/faq";
import { cta } from "@/data/copy";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await cms.getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await cms.getProjectBySlug(slug);
  if (!project) return {};
  return pageMetadata({
    title: project.seo.title,
    description: project.seo.description,
    path: `/catalog/${slug}`,
    image: project.images[0],
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await cms.getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article className="pt-28 pb-20">
      <JsonLd
        data={[
          projectSchema({
            name: project.name,
            description: project.description,
            price: project.price,
            image: project.images[0],
            slug: project.slug,
          }),
          breadcrumbSchema([
            { name: "Главная", url: SITE_URL },
            { name: "Каталог", url: `${SITE_URL}/catalog` },
            { name: project.name, url: `${SITE_URL}/catalog/${slug}` },
          ]),
        ]}
      />
      <ProjectViewTracker slug={slug} />

      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Каталог", href: "/catalog" },
            { label: project.name },
          ]}
        />
        <header className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="label-caps">{project.specs.style} · {project.specs.material}</p>
            <h1 className="heading-section mt-2">{project.name}</h1>
            <p className="mt-4 text-lg text-muted">{project.tagline}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl md:text-4xl">{formatPrice(project.price)}</p>
            <p className="mt-2 text-sm text-muted">
              {project.specs.area} м² · {project.specs.buildTimeMonths} мес. · {project.specs.bedrooms} спален
            </p>
            <Button asChild className="mt-4" size="lg">
              <Link href="#project-lead">{cta.projectEstimateThis}</Link>
            </Button>
          </div>
        </header>

        <div className="mt-10">
          <ProjectGallery images={project.gallery} name={project.name} />
        </div>

        <section className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl">О проекте</h2>
            <p className="mt-4 text-muted">{project.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {project.features.map((f) => (
                <li key={f} className="rounded-full bg-sand px-3 py-1 text-xs">
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl">Планировки</h2>
            <div className="mt-4">
              <FloorPlanInteractive plans={project.floorPlans} />
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl">Комплектации</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {project.packages.map((pkg) => (
              <div key={pkg.id} className="rounded-sm border border-graphite/10 p-6">
                <h3 className="text-lg font-medium">{pkg.name}</h3>
                <p className="mt-2 font-display text-2xl">от {formatPrice(pkg.priceFrom)}</p>
                <ul className="mt-4 space-y-1 text-sm text-muted">
                  {pkg.includes.map((i) => (
                    <li key={i}>— {i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl">Этапы строительства</h2>
          <div className="mt-6 space-y-4">
            {project.buildStages.map((s) => (
              <div key={s.title} className="flex justify-between border-b border-graphite/10 py-4">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted">{s.description}</p>
                </div>
                <p className="text-sm text-wood">{s.duration}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-3xl">
          <h2 className="font-display text-2xl">FAQ по проекту</h2>
          <Accordion type="single" collapsible className="mt-6">
            {faqItems.slice(0, 3).map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section id="project-lead" className="mt-16 max-w-lg">
          <LeadForm
            title={cta.projectEstimateThis}
            subtitle={`Смета по проекту «${project.name}» с разбивкой по этапам — в течение рабочего дня`}
            source={`project-${slug}`}
          />
        </section>
      </div>
    </article>
  );
}
