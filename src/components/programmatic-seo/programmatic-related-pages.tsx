"use client";

import Link from "next/link";
import type { ProgrammaticPageData } from "@/types/programmatic-page-template";
import { trackProgrammaticRelatedPageClicked } from "@/lib/programmatic-seo/programmatic-analytics";

export function ProgrammaticRelatedPages({ page }: { page: ProgrammaticPageData }) {
  const { pages, articles, projects } = page.related;
  if (!pages.length && !articles.length && !projects.length) return null;

  const track = (title: string, url: string) => {
    trackProgrammaticRelatedPageClicked({ pageSlug: page.analytics.pageSlug, title, url });
  };

  return (
    <section className="mt-16" aria-labelledby="related-pages">
      <h2 id="related-pages" className="font-display text-2xl md:text-3xl">
        Связанные подборки
      </h2>

      {pages.length > 0 ? (
        <div className="mt-6">
          <p className="label-caps text-muted">Страницы</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {pages.map((item) => (
              <li key={item.url}>
                <Link
                  href={item.url}
                  onClick={() => track(item.title, item.url)}
                  className="block rounded-sm border border-graphite/10 px-4 py-3 text-sm transition hover:border-graphite/30 hover:bg-sand/30"
                >
                  <span className="text-xs text-muted">{item.relation}</span>
                  <span className="mt-0.5 block font-medium">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {articles.length > 0 ? (
        <div className="mt-8">
          <p className="label-caps text-muted">Статьи</p>
          <ul className="mt-3 space-y-2">
            {articles.map((item) => (
              <li key={item.url}>
                <Link
                  href={item.url}
                  onClick={() => track(item.title, item.url)}
                  className="text-sm underline-offset-4 hover:underline"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
