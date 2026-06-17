"use client";

import Link from "next/link";
import type { ProgrammaticPageData } from "@/types/programmatic-page-template";
import { Button } from "@/components/ui/button";
import { trackProgrammaticCtaClicked } from "@/lib/programmatic-seo/programmatic-analytics";

export function ProgrammaticStickyCta({ page }: { page: ProgrammaticPageData }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-graphite/10 bg-background/95 p-3 backdrop-blur md:hidden">
      <Button
        asChild
        className="w-full"
        onClick={() =>
          trackProgrammaticCtaClicked({
            pageSlug: page.analytics.pageSlug,
            cta: page.cta.primary,
            position: "sticky",
          })
        }
      >
        <Link href="#programmatic-lead-form">{page.cta.primary}</Link>
      </Button>
    </div>
  );
}
