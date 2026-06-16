import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import { cms } from "@/lib/cms/local";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { blogCategories, getBlogCategoryBySlug } from "@/data/blog-categories";
import { getPostsByCategory } from "@/lib/blog";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { BlogInlineCta } from "@/components/blog/blog-inline-cta";
import { BlogRelatedServices } from "@/components/blog/blog-related";
import { getRelatedServiceLinks } from "@/lib/blog";
import { getBlogCta, categoryToCluster } from "@/data/blog-cta-map";
import { BlogFAQ } from "@/components/blog/blog-faq";
import { filterProjects } from "@/lib/filters";
import { BlogRelatedProjects } from "@/components/blog/blog-related-projects";
import { LeadForm } from "@/components/forms/lead-form";
import { cta as siteCta } from "@/data/copy";

type Props = { params: Promise<{ categorySlug: string }> };

export async function generateStaticParams() {
  return blogCategories.map((c) => ({ categorySlug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getBlogCategoryBySlug(categorySlug);
  if (!category) return {};
  return pageMetadata({
    title: category.seoTitle,
    description: category.seoDescription,
    path: `/blog/category/${categorySlug}`,
  });
}

const categoryFaqs: Record<string, { question: string; answer: string }[]> = {
  cost: [
    {
      question: "Можно ли узнать точную цену дома в статьях?",
      answer: "Статьи дают логику и ориентиры. Точная смета — после вводных по участку и проекту.",
    },
  ],
  "foundation-land": [
    {
      question: "Можно ли выбрать фундамент без геологии?",
      answer: "Ориентир возможен, но финальное решение — после данных об участке.",
    },
  ],
};

export default async function BlogCategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const category = getBlogCategoryBySlug(categorySlug);
  if (!category) notFound();

  const allPosts = await cms.getAllBlogPosts();
  const posts = getPostsByCategory(allPosts, categorySlug);
  const projects = await cms.getProjects();
  const cta = getBlogCta(categoryToCluster[categorySlug] ?? categorySlug, categorySlug);
  const serviceLinks = getRelatedServiceLinks(category.relatedServicePages);
  const faqs = categoryFaqs[categorySlug] ?? [];

  const relatedProjects =
    categorySlug === "cost"
      ? filterProjects(projects, { priceMax: 10_000_000, sort: "price-asc" })
      : categorySlug === "materials"
        ? filterProjects(projects, { sort: "featured" })
        : [];

  return (
    <div className="pt-28 pb-20">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Главная", url: SITE_URL },
            { name: "Блог", url: `${SITE_URL}/blog` },
            { name: category.title, url: `${SITE_URL}/blog/category/${categorySlug}` },
          ]),
          ...(faqs.length ? [faqSchema(faqs)] : []),
        ]}
      />
      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Блог", href: "/blog" },
            { label: category.title },
          ]}
        />

        <h1 className="heading-section mt-4">{category.title}</h1>
        <p className="mt-4 max-w-2xl text-muted leading-relaxed">{category.description}</p>

        <div className="mt-8">
          <BlogInlineCta
            cta={{
              primary: { label: category.primaryCTA, href: category.primaryCTAHref },
              secondary: cta.secondary,
            }}
            variant="compact"
          />
        </div>

        {posts.length > 0 ? (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-muted">Материалы в этой категории скоро появятся.</p>
        )}

        <BlogRelatedServices links={serviceLinks} />
        {relatedProjects.length > 0 ? (
          <BlogRelatedProjects projects={relatedProjects} />
        ) : null}

        {faqs.length ? <BlogFAQ items={faqs} /> : null}

        <section id="blog-lead" className="mt-16 scroll-mt-28 border-t border-graphite/10 pt-16">
          <LeadForm
            id="blog-category-lead"
            title={category.primaryCTA}
            subtitle="Опишите задачу — подскажем следующий шаг: расчёт, проект или консультация."
            submitLabel={siteCta.getConsultation}
            leadConfig={{
              sourceType: "blog",
              formId: "blog-category-lead",
              formName: `Блог — категория ${category.title}`,
              pageSlug: categorySlug,
              requestType: "consultation",
              requestTitle: category.primaryCTA,
              selectedCTA: category.primaryCTA,
              conversionGoal: "callback_request",
              context: { blog: { title: category.title, categorySlug, clusterId: categorySlug } },
            }}
          />
        </section>
      </div>
    </div>
  );
}
