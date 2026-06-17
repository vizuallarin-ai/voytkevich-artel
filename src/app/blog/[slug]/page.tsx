import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cms } from "@/lib/cms/local";
import { pageMetadata } from "@/lib/seo";
import { BlogPostTemplate } from "@/components/blog/blog-post-template";
import { TechnicalArticleLayout } from "@/components/technical-content/technical-article-layout";
import { EditorialArticleLayout } from "@/components/editorial-content/EditorialArticleLayout";
import {
  getAllTechnicalArticleSlugs,
  getTechnicalArticleBySlug,
} from "@/lib/technical-content/technical-page-builder";
import { generateTechnicalArticleMetadata } from "@/lib/technical-content/technical-metadata";
import {
  getAllEditorialContentSlugs,
  getEditorialContentBySlug,
} from "@/lib/editorial-content/editorial-page-builder";
import { generateEditorialMetadata } from "@/lib/editorial-content/editorial-metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const [posts, technicalSlugs, editorialSlugs] = await Promise.all([
    cms.getAllBlogPosts(),
    Promise.resolve(getAllTechnicalArticleSlugs()),
    Promise.resolve(getAllEditorialContentSlugs()),
  ]);
  const blogSlugs = new Set(posts.map((p) => p.slug));
  const reserved = new Set([...blogSlugs, ...technicalSlugs]);
  const technicalOnly = technicalSlugs.filter((s) => !blogSlugs.has(s));
  const editorialOnly = editorialSlugs.filter((s) => !reserved.has(s));
  return [
    ...posts.map((p) => ({ slug: p.slug })),
    ...technicalOnly.map((slug) => ({ slug })),
    ...editorialOnly.map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await cms.getBlogPostBySlug(slug);
  if (post) {
    return pageMetadata({
      title: post.seo.title,
      description: post.seo.description,
      path: `/blog/${slug}`,
      image: post.coverImage,
      noindex: post.noindex || post.status === "draft",
    });
  }

  const technical = getTechnicalArticleBySlug(slug);
  if (technical) return generateTechnicalArticleMetadata(technical);

  const editorial = getEditorialContentBySlug(slug);
  if (editorial) return generateEditorialMetadata(editorial);

  return {};
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await cms.getBlogPostBySlug(slug);
  if (post) {
    const [allPosts, projects] = await Promise.all([cms.getAllBlogPosts(), cms.getProjects()]);
    return <BlogPostTemplate post={post} allPosts={allPosts} projects={projects} />;
  }

  const technical = getTechnicalArticleBySlug(slug);
  if (technical) return <TechnicalArticleLayout article={technical} />;

  const editorial = getEditorialContentBySlug(slug);
  if (editorial) return <EditorialArticleLayout item={editorial} />;

  notFound();
}
