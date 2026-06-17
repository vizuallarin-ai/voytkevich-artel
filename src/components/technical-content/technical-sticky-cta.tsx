"use client";

import Link from "next/link";
import type { TechnicalArticle } from "@/types/technical-content";
import { Button } from "@/components/ui/button";
import { trackTechnicalCtaClicked } from "@/lib/technical-content/technical-analytics";

export function TechnicalStickyCta({ article }: { article: TechnicalArticle }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-graphite/10 bg-background/95 p-3 backdrop-blur md:hidden">
      <Button
        asChild
        className="w-full"
        onClick={() =>
          trackTechnicalCtaClicked({
            articleSlug: article.slug,
            cta: article.cta.primary,
            position: "sticky",
          })
        }
      >
        <Link href="#technical-lead-form">{article.cta.primary}</Link>
      </Button>
    </div>
  );
}
