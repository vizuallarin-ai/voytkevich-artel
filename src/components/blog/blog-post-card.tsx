import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/types/blog";
import { getCategoryTitle } from "@/data/blog-categories";

export function BlogPostCard({ post }: { post: BlogPost }) {
  const date = post.updatedAt ?? post.publishedAt;
  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-graphite/10 bg-background shadow-sm transition hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <Link
            href={`/blog/category/${post.categorySlug}`}
            className="hover:text-wood hover:underline"
          >
            {getCategoryTitle(post.categorySlug)}
          </Link>
          <span>·</span>
          <time dateTime={date}>
            {new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
          </time>
          <span>·</span>
          <span>{post.readTime} мин</span>
        </div>
        {post.badge ? (
          <span className="mt-3 inline-block rounded-full bg-wood/10 px-2.5 py-0.5 text-xs text-wood">
            {post.badge}
          </span>
        ) : null}
        <h2 className="mt-2 font-display text-xl leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-wood hover:underline">
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 flex-1 text-sm text-muted line-clamp-3">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="mt-4 inline-block text-sm font-medium text-wood hover:underline">
          Читать →
        </Link>
      </div>
    </article>
  );
}
