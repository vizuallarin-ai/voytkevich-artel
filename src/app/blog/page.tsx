import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { cms } from "@/lib/cms/local";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Блог о строительстве домов — NordHaus",
  description: "Статьи о выборе дома, стоимости, технологиях, ипотеке и энергоэффективности.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await cms.getBlogPosts();

  return (
    <div className="pt-28 pb-20">
      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Блог" }]} />
        <h1 className="heading-section">Блог</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Экспертные материалы для тех, кто планирует строительство загородного дома.
        </p>
        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block overflow-hidden rounded-sm"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-4 text-xs text-muted">{post.category} · {post.readTime} мин</p>
              <h2 className="mt-1 font-display text-xl group-hover:text-wood">{post.title}</h2>
              <p className="mt-2 text-sm text-muted line-clamp-2">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
