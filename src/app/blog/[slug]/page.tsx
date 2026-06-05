import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cms } from "@/lib/cms/local";
import { pageMetadata } from "@/lib/seo";
import { BlogPostTemplate } from "@/components/blog/blog-post-template";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await cms.getAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await cms.getBlogPostBySlug(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.seo.title,
    description: post.seo.description,
    path: `/blog/${slug}`,
    image: post.coverImage,
    noindex: post.noindex || post.status === "draft",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await cms.getBlogPostBySlug(slug);
  if (!post) notFound();

  const [allPosts, projects] = await Promise.all([cms.getAllBlogPosts(), cms.getProjects()]);

  return <BlogPostTemplate post={post} allPosts={allPosts} projects={projects} />;
}
