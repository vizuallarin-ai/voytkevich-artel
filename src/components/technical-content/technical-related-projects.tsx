"use client";

import Link from "next/link";
import type { TechnicalArticle } from "@/types/technical-content";
import { resolveRelatedLinkLabel } from "@/lib/technical-content/technical-related-links";
import { trackTechnicalRelatedProjectClicked } from "@/lib/technical-content/technical-analytics";

export function TechnicalRelatedProjects({ article }: { article: TechnicalArticle }) {
  const links = [
    ...article.related.projectCategories,
    ...article.related.programmaticPages,
    ...article.related.calculators,
  ];
  if (!links.length) return null;

  return (
    <section className="mt-12" aria-labelledby="related-projects">
      <h2 id="related-projects" className="font-display text-2xl">
        Полезные разделы
      </h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {links.map((href) => (
          <li key={href}>
            <Link
              href={href}
              onClick={() =>
                trackTechnicalRelatedProjectClicked({
                  articleSlug: article.slug,
                  href,
                })
              }
              className="block rounded-sm border border-graphite/10 px-4 py-3 text-sm transition hover:border-graphite/30 hover:bg-sand/30"
            >
              {resolveRelatedLinkLabel(href)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
