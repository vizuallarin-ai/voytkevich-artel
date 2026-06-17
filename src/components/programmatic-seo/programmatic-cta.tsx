"use client";

import Link from "next/link";
import type { ProgrammaticPageData } from "@/types/programmatic-page-template";
import { Button } from "@/components/ui/button";
import { trackProgrammaticCtaClicked } from "@/lib/programmatic-seo/programmatic-analytics";

export function ProgrammaticCTA({
  page,
  position = "middle",
}: {
  page: ProgrammaticPageData;
  position?: "middle" | "hero";
}) {
  const track = (label: string) => {
    trackProgrammaticCtaClicked({
      pageType: page.analytics.pageType,
      pageSlug: page.analytics.pageSlug,
      templateType: page.templateType,
      cta: label,
      position,
    });
  };

  return (
    <section
      className="mt-12 rounded-sm bg-graphite px-6 py-8 text-background md:px-10 md:py-10"
      aria-label="Призыв к действию"
    >
      <p className="font-display text-xl md:text-2xl">{page.cta.primary}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button
          asChild
          variant="sand"
          className="bg-background text-graphite hover:bg-sand"
          onClick={() => track(page.cta.primary)}
        >
          <Link href="#programmatic-lead-form">{page.cta.primary}</Link>
        </Button>
        {page.cta.secondary ? (
          <Button
            asChild
            variant="outline"
            className="border-background/30 text-background hover:bg-background/10"
            onClick={() => track(page.cta.secondary!)}
          >
            <Link href="#programmatic-projects">{page.cta.secondary}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
