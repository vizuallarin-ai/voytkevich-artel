import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import type { Project } from "@/types";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd, articleSchema, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/seo";
import { markdownToHtml } from "@/lib/markdown";
import { getBlogCta } from "@/data/blog-cta-map";
import { getLeadMagnetById } from "@/data/blog-lead-magnets";
import { getCategoryTitle } from "@/data/blog-categories";
import {
  extractTocFromMarkdown,
  getRelatedPosts,
  getRelatedServiceLinks,
  isBlogPostPublic,
} from "@/lib/blog";
import { filterProjects } from "@/lib/filters";
import { BlogInlineCta } from "./blog-inline-cta";
import { BlogFAQ } from "./blog-faq";
import { BlogRelatedPosts, BlogRelatedServices } from "./blog-related";
import { BlogRelatedProjects } from "./blog-related-projects";
import { BlogRelatedCases } from "@/components/cases/blog-related-cases";
import { BlogFinalLeadForm, BlogLeadMagnetBlock, BlogUpdateNotice } from "./blog-lead-blocks";
import { LeadMagnetsBlock } from "@/components/lead-magnets/lead-magnets-block";
import { BlogTableOfContents } from "./blog-table-of-contents";

type Props = {
  post: BlogPost;
  allPosts: BlogPost[];
  projects: Project[];
};

export function BlogPostTemplate({ post, allPosts, projects }: Props) {
  const cta = getBlogCta(post.clusterId, post.categorySlug);
  const heroCta = post.heroCTA ?? cta.primary;
  const toc = extractTocFromMarkdown(post.content);
  const relatedPosts = getRelatedPosts(allPosts, post);
  const serviceLinks = getRelatedServiceLinks(post.relatedServicePages);
  const relatedProjects = post.relatedProjectFilters
    ? filterProjects(projects, post.relatedProjectFilters)
    : [];
  const magnet = post.leadMagnetId ? getLeadMagnetById(post.leadMagnetId) : undefined;
  const date = post.updatedAt ?? post.publishedAt;
  const categoryTitle = getCategoryTitle(post.categorySlug);

  const schemas: Record<string, unknown>[] = [
    articleSchema({
      title: post.h1,
      description: post.excerpt,
      image: post.coverImage,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: post.author,
      url: `${SITE_URL}/blog/${post.slug}`,
    }),
    breadcrumbSchema([
      { name: "Главная", url: SITE_URL },
      { name: "Блог", url: `${SITE_URL}/blog` },
      { name: categoryTitle, url: `${SITE_URL}/blog/category/${post.categorySlug}` },
      { name: post.h1, url: `${SITE_URL}/blog/${post.slug}` },
    ]),
  ];
  if (post.faqs?.length) schemas.push(faqSchema(post.faqs));

  const formTitle =
    magnet?.formTitle ??
    (post.clusterId === "estimate"
      ? "Получить пример сметы"
      : post.clusterId === "mistakes"
        ? "Разобрать мой случай"
        : "Получить предварительный расчёт");

  return (
    <article className="pt-28 pb-20">
      <JsonLd data={schemas} />
      <div className="container-narrow max-w-3xl px-5 md:px-10">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Блог", href: "/blog" },
            { label: categoryTitle, href: `/blog/category/${post.categorySlug}` },
            { label: post.h1 },
          ]}
        />

        <Link
          href={`/blog/category/${post.categorySlug}`}
          className="label-caps hover:text-wood hover:underline"
        >
          {categoryTitle}
        </Link>

        <h1 className="heading-section mt-2">{post.h1}</h1>

        <p className="mt-4 text-sm text-muted">
          {post.author} ·{" "}
          <time dateTime={date}>
            {new Date(date).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          {post.updatedAt && post.updatedAt !== post.publishedAt ? " · обновлено" : ""} ·{" "}
          {post.readTime} мин чтения
        </p>

        {post.needsRegularUpdate ? <BlogUpdateNotice /> : null}

        {post.shortAnswer ? (
          <div className="mt-8 rounded-sm border-l-4 border-wood bg-wood/5 px-5 py-4">
            <p className="text-sm font-medium">Короткий ответ</p>
            <p className="mt-2 text-muted leading-relaxed">{post.shortAnswer}</p>
          </div>
        ) : null}

        <LeadMagnetsBlock
          pageType="blog-post"
          pageSlug={post.slug}
          clusterId={post.clusterId}
          mode="inline"
          maxItems={1}
          context={{ blogPostSlug: post.slug }}
        />

        <div className="mt-6">
          <BlogInlineCta
            cta={{ primary: heroCta, secondary: cta.secondary }}
            variant="compact"
          />
        </div>

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-sm">
          <Image src={post.coverImage} alt={post.h1} fill className="object-cover" priority />
        </div>

        <BlogTableOfContents items={toc} />

        <div
          className="prose prose-neutral mt-10 max-w-none prose-headings:font-display prose-headings:scroll-mt-28 prose-a:text-wood prose-a:underline-offset-4 prose-p:text-muted prose-table:text-sm"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
        />

        <BlogInlineCta
          cta={cta}
          title="Следующий шаг"
          description="Перейдите к инструменту или оставьте заявку — подскажем, с чего начать."
        />

        {magnet ? <BlogLeadMagnetBlock post={post} magnet={magnet} /> : null}

        <LeadMagnetsBlock
          pageType="blog-post"
          pageSlug={post.slug}
          clusterId={post.clusterId}
          mode="cards"
          maxItems={1}
          context={{ blogPostSlug: post.slug }}
        />

        <BlogRelatedProjects projects={relatedProjects} />
        <BlogRelatedCases post={post} />
        <BlogRelatedServices links={serviceLinks} />

        {post.faqs?.length ? <BlogFAQ items={post.faqs} /> : null}

        <BlogRelatedPosts posts={relatedPosts} />

        <BlogFinalLeadForm
          post={post}
          title={formTitle}
          leadMagnetId={post.leadMagnetId}
        />

        {!isBlogPostPublic(post) ? (
          <p className="mt-8 text-xs text-muted">
            Статус: {post.status}. Материал не предназначен для поисковой индексации.
          </p>
        ) : null}
      </div>
    </article>
  );
}
