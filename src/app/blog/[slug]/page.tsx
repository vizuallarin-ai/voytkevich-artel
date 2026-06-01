import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cms } from "@/lib/cms/local";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd, articleSchema, breadcrumbSchema } from "@/components/seo/json-ld";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { LeadForm } from "@/components/forms/lead-form";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await cms.getBlogPosts();
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
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await cms.getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="pt-28 pb-20">
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            description: post.excerpt,
            image: post.coverImage,
            datePublished: post.publishedAt,
            author: post.author,
          }),
          breadcrumbSchema([
            { name: "Главная", url: SITE_URL },
            { name: "Блог", url: `${SITE_URL}/blog` },
            { name: post.title, url: `${SITE_URL}/blog/${slug}` },
          ]),
        ]}
      />
      <div className="container-narrow max-w-3xl px-5 md:px-10">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Блог", href: "/blog" },
            { label: post.title },
          ]}
        />
        <p className="label-caps">{post.category}</p>
        <h1 className="heading-section mt-2">{post.title}</h1>
        <p className="mt-4 text-sm text-muted">
          {post.author} · {new Date(post.publishedAt).toLocaleDateString("ru-RU")} · {post.readTime} мин
        </p>
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-sm">
          <Image src={post.coverImage} alt="" fill className="object-cover" priority />
        </div>
        <div
          className="prose prose-neutral mt-10 max-w-none prose-headings:font-display prose-a:text-wood prose-a:underline-offset-4 prose-p:text-muted"
          dangerouslySetInnerHTML={{
            __html: post.content
              .split("\n")
              .map((line) => {
                const parsed = line
                  // **bold**
                  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                  // [text](url) — internal links as Next.js-friendly <a>
                  .replace(
                    /\[([^\]]+)\]\(([^)]+)\)/g,
                    '<a href="$2" class="text-wood underline underline-offset-4 hover:opacity-80 transition-opacity">$1</a>',
                  );
                if (line.startsWith("## "))
                  return `<h2>${parsed.slice(3)}</h2>`;
                if (line.startsWith("- "))
                  return `<li>${parsed.slice(2)}</li>`;
                if (line.trim()) return `<p>${parsed}</p>`;
                return "";
              })
              .join(""),
          }}
        />
        <div className="mt-16">
          <LeadForm id="blog-lead" title="Нужна консультация?" subtitle="Ответим на вопросы по строительству" />
        </div>
      </div>
    </article>
  );
}
