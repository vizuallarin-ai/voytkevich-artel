"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { BlogCtaPair } from "@/data/blog-cta-map";
import { trackCtaClicked } from "@/lib/analytics/cta-tracking";

type Props = {
  cta: BlogCtaPair;
  variant?: "default" | "compact";
  title?: string;
  description?: string;
  blogPostSlug?: string;
};

export function BlogInlineCta({
  cta,
  variant = "default",
  title,
  description,
  blogPostSlug,
}: Props) {
  const isCompact = variant === "compact";
  return (
    <aside
      className={
        isCompact
          ? "my-8 rounded-sm border border-wood/20 bg-wood/5 p-5"
          : "my-10 rounded-sm border border-wood/30 bg-wood/5 p-6 md:p-8"
      }
    >
      {title ? <p className="font-display text-lg md:text-xl">{title}</p> : null}
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      <div className={`flex flex-col gap-3 sm:flex-row ${title || description ? "mt-4" : ""}`}>
        <Button asChild size={isCompact ? "sm" : "default"}>
          <Link
            href={cta.primary.href}
            onClick={() =>
              trackCtaClicked(cta.primary.label, {
                pageType: "blog-post",
                pageSlug: blogPostSlug,
                sourceSection: "blog_inline_cta",
              })
            }
          >
            {cta.primary.label}
          </Link>
        </Button>
        {cta.secondary.href.startsWith("#") || cta.secondary.href.startsWith("/") ? (
          <Button asChild variant="outline" size={isCompact ? "sm" : "default"}>
            <Link
              href={cta.secondary.href}
              onClick={() =>
                trackCtaClicked(cta.secondary.label, {
                  pageType: "blog-post",
                  pageSlug: blogPostSlug,
                  sourceSection: "blog_inline_cta",
                })
              }
            >
              {cta.secondary.label}
            </Link>
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
