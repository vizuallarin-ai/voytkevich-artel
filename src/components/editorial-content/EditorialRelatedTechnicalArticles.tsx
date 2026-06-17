"use client";

import Link from "next/link";
import type { EditorialContentItem } from "@/types/editorial-content";
import {
  buildEditorialAnalyticsPayload,
  trackEditorialRelatedTechnicalArticleClicked,
} from "@/lib/editorial-content/editorial-analytics";
import {
  resolveEditorialLinkLabel,
  resolveEditorialTechnicalArticleUrl,
} from "@/lib/editorial-content/editorial-related-links";

export function EditorialRelatedTechnicalArticles({ item }: { item: EditorialContentItem }) {
  const slugs = item.related.technicalArticles;
  if (!slugs.length) return null;

  return (
    <section className="mt-10" aria-label="Связанные материалы">
      <h2 className="font-display text-2xl">Полезные материалы по теме</h2>
      <ul className="mt-4 space-y-2">
        {slugs.map((slug) => {
          const href = slug.startsWith("/") ? slug : resolveEditorialTechnicalArticleUrl(slug);
          const label = slug.startsWith("/")
            ? resolveEditorialLinkLabel(slug)
            : resolveEditorialLinkLabel(href, slug);

          return (
            <li key={slug}>
              <Link
                href={href}
                className="text-sm underline-offset-4 hover:underline"
                onClick={() =>
                  trackEditorialRelatedTechnicalArticleClicked(
                    buildEditorialAnalyticsPayload(item, { relatedTechnicalArticleSlug: slug }),
                  )
                }
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
