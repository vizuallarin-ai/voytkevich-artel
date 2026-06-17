"use client";

import Link from "next/link";
import type { ProgrammaticPageData } from "@/types/programmatic-page-template";
import { trackProgrammaticFilterUsed } from "@/lib/programmatic-seo/programmatic-analytics";

export function ProgrammaticFilters({ page }: { page: ProgrammaticPageData }) {
  return (
    <nav className="mt-8" aria-label="Быстрые подборки">
      <p className="label-caps text-muted">Быстрые подборки</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {page.filterLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={() =>
                trackProgrammaticFilterUsed({
                  pageSlug: page.analytics.pageSlug,
                  filterLabel: link.label,
                  filterHref: link.href,
                })
              }
              className="inline-block rounded-full border border-graphite/15 bg-background px-4 py-2 text-sm transition hover:border-graphite/40 hover:bg-sand/50"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
