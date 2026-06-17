"use client";

import Link from "next/link";
import type { EditorialContentItem } from "@/types/editorial-content";
import {
  buildEditorialAnalyticsPayload,
  trackEditorialRelatedProjectClicked,
} from "@/lib/editorial-content/editorial-analytics";
import { resolveEditorialLinkLabel } from "@/lib/editorial-content/editorial-related-links";

export function EditorialRelatedProjects({ item }: { item: EditorialContentItem }) {
  const links = [
    ...item.related.projectCategories,
    ...item.related.programmaticPages,
    ...item.related.calculators,
  ].filter(Boolean);

  if (!links.length) return null;

  return (
    <section className="mt-10" aria-label="Связанные проекты и разделы">
      <h2 className="font-display text-2xl">Куда перейти дальше</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {links.map((href) => (
          <li key={href}>
            <Link
              href={href}
              className="block rounded-sm border border-graphite/10 px-4 py-3 text-sm transition-colors hover:bg-sand/40"
              onClick={() =>
                trackEditorialRelatedProjectClicked(
                  buildEditorialAnalyticsPayload(item, { relatedProjectId: href }),
                )
              }
            >
              {resolveEditorialLinkLabel(href)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
