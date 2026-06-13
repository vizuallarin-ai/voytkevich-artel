import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cms } from "@/lib/cms/local";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProjectGallery } from "@/components/project/project-gallery";
import { ProjectHero } from "@/components/project/project-hero";
import { ProjectSpecs } from "@/components/project/project-specs";
import { ProjectAudience } from "@/components/project/project-audience";
import { ProjectFloorPlanSection } from "@/components/project/project-floor-plan-section";
import { ProjectIncludedWorks } from "@/components/project/project-included-works";
import { ProjectPackages } from "@/components/project/project-packages";
import { ProjectPriceFactors } from "@/components/project/project-price-factors";
import { ProjectAdaptation } from "@/components/project/project-adaptation";
import { ProjectBuildSteps } from "@/components/project/project-build-steps";
import { ProjectRelated } from "@/components/project/project-related";
import { ProjectRelatedCases } from "@/components/cases/project-related-cases";
import { ProjectRelatedBuiltObjects } from "@/components/objects-map/related-built-objects";
import { ProjectSeoBlock } from "@/components/project/project-seo-block";
import { ProjectLeadSection } from "@/components/project/project-lead-section";
import { LeadMagnetsBlock } from "@/components/lead-magnets/lead-magnets-block";
import { ProjectCategoriesNav } from "@/components/project/project-categories-nav";
import { ProjectInlineCta } from "@/components/project/project-inline-cta";
import { ProjectStickyCta, ProjectSidebar } from "@/components/project/project-sticky-cta";
import { ProjectViewTracker } from "@/components/project/project-view-tracker";
import { JsonLd, projectSchema, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cta } from "@/data/copy";
import { buildProjectSeoMeta, projectFaqFor } from "@/lib/project-content";
import { getProjectCategories } from "@/lib/project-categories";
import { findSimilarProjects } from "@/lib/similar-projects";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await cms.getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await cms.getProjectBySlug(slug);
  if (!project) return {};
  const seo = buildProjectSeoMeta(project);
  return pageMetadata({
    title: seo.title,
    description: seo.description,
    path: `/catalog/${slug}`,
    image: project.images[0],
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await cms.getProjectBySlug(slug);
  if (!project) notFound();

  const allProjects = await cms.getProjects();
  const similar = findSimilarProjects(project, allProjects, 6);
  const projectFaq = projectFaqFor(project);
  const categories = getProjectCategories(project);

  return (
    <article className="pb-28 pt-28 md:pb-20">
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
          faqSchema(projectFaq.map((f) => ({ question: f.question, answer: f.answer }))),
        ]}
      />
      <ProjectViewTracker slug={slug} />
      <ProjectStickyCta project={project} />

      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Каталог", href: "/catalog" },
            { label: project.name },
          ]}
        />

        <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_280px] lg:items-start">
          <div className="min-w-0 space-y-16">
            <ProjectHero project={project} />
            <ProjectCategoriesNav categories={categories} />

            <ProjectGallery images={project.gallery} name={project.name} specs={project.specs} />

            <ProjectSpecs project={project} />
            <ProjectInlineCta label="Уточнить стоимость" />

            <section aria-labelledby="project-about-title">
              <h2 id="project-about-title" className="font-display text-2xl">
                О проекте
              </h2>
              <p className="mt-4 text-muted">{project.description}</p>
              {project.shortDescription && project.shortDescription !== project.description && (
                <p className="mt-3 text-sm text-muted">{project.shortDescription}</p>
              )}
              <ul className="mt-6 flex flex-wrap gap-2">
                {project.features.map((f) => (
                  <li key={f} className="rounded-full bg-sand px-3 py-1 text-xs">
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <ProjectAudience project={project} />
            <ProjectFloorPlanSection project={project} />
            <ProjectIncludedWorks />
            <ProjectPackages project={project} />
            <ProjectPriceFactors />
            <ProjectAdaptation />
            <ProjectBuildSteps />

            <ProjectRelated similar={similar} />
            <ProjectRelatedCases projectSlug={slug} />
            <ProjectRelatedBuiltObjects projectSlug={slug} />

            <section aria-labelledby="project-faq-title">
              <h2 id="project-faq-title" className="font-display text-2xl">
                FAQ по проекту
              </h2>
              <Accordion type="single" collapsible className="mt-6 max-w-3xl">
                {projectFaq.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button asChild className="mt-8" size="lg">
                <Link href="#project-lead">{cta.projectEstimate}</Link>
              </Button>
            </section>

            <ProjectSeoBlock project={project} />

            <LeadMagnetsBlock
              pageType="project-page"
              pageSlug={slug}
              magnetIds={["cost-review", "layout-review"]}
              maxItems={2}
              mode="cards"
              prefilledArea={String(project.specs.area)}
              context={{
                projectSlug: slug,
                projectTitle: project.name,
              }}
            />

            <div className="max-w-lg">
              <ProjectLeadSection project={project} slug={slug} />
            </div>
          </div>

          <ProjectSidebar project={project} />
        </div>
      </div>
    </article>
  );
}
