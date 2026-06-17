"use client";

import Link from "next/link";
import type { TechnicalArticle } from "@/types/technical-content";
import { Button } from "@/components/ui/button";
import { trackTechnicalCtaClicked } from "@/lib/technical-content/technical-analytics";

export function TechnicalCTA({
  article,
  position = "middle",
}: {
  article: TechnicalArticle;
  position?: "middle" | "hero";
}) {
  const track = (label: string) => {
    trackTechnicalCtaClicked({
      articleSlug: article.slug,
      articleType: article.type,
      clusterId: article.clusterId,
      cta: label,
      position,
    });
  };

  if (position === "hero") {
    return (
      <Button asChild onClick={() => track(article.cta.primary)}>
        <Link href="#technical-lead-form">{article.cta.primary}</Link>
      </Button>
    );
  }

  return (
    <section className="mt-10 rounded-sm bg-sand/50 px-6 py-8" aria-label="Призыв к действию">
      <p className="font-display text-xl">{article.cta.primary}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button asChild onClick={() => track(article.cta.primary)}>
          <Link href="#technical-lead-form">{article.cta.primary}</Link>
        </Button>
        {article.cta.secondary ? (
          <Button asChild variant="outline" onClick={() => track(article.cta.secondary!)}>
            <Link href="/calculator">{article.cta.secondary}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
