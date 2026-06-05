import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import { BlogPostCard } from "./blog-post-card";

export function BlogRelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="blog-related-posts" className="mt-16 border-t border-graphite/10 pt-16">
      <h2 id="blog-related-posts" className="heading-section text-2xl">
        Читайте также
      </h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {posts.map((p) => (
          <BlogPostCard key={p.slug} post={p} />
        ))}
      </div>
    </section>
  );
}

export function BlogRelatedServices({ links }: { links: { href: string; label: string }[] }) {
  if (!links.length) return null;
  return (
    <section aria-labelledby="blog-related-services" className="mt-16">
      <h2 id="blog-related-services" className="heading-section text-2xl">
        Полезные разделы по теме
      </h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-2 rounded-sm border border-graphite/10 px-4 py-3 text-sm transition hover:border-wood/40 hover:bg-wood/5"
            >
              <span className="text-wood">→</span>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
