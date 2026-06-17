"use client";

import Link from "next/link";
import type { TechnicalArticle } from "@/types/technical-content";
import { resolveRelatedLinkLabel } from "@/lib/technical-content/technical-related-links";
import { trackTechnicalRelatedArticleClicked } from "@/lib/technical-content/technical-analytics";

export function TechnicalRelatedArticles({ article }: { article: TechnicalArticle }) {
  if (!article.related.articles.length) return null;

  return (
    <section className="mt-12" aria-labelledby="related-articles">
      <h2 id="related-articles" className="font-display text-2xl">
        Читайте также
      </h2>
      <ul className="mt-4 space-y-2">
        {article.related.articles.map((href) => (
          <li key={href}>
            <Link
              href={href}
              onClick={() =>
                trackTechnicalRelatedArticleClicked({
                  articleSlug: article.slug,
                  relatedSlug: href,
                })
              }
              className="text-sm underline-offset-4 hover:underline"
            >
              {resolveRelatedLinkLabel(href)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
