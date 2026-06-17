"use client";

import Link from "next/link";
import type { EditorialContentItem } from "@/types/editorial-content";
import { Button } from "@/components/ui/button";
import {
  buildEditorialAnalyticsPayload,
  trackEditorialCtaClicked,
} from "@/lib/editorial-content/editorial-analytics";

export function EditorialCTA({
  item,
  position = "middle",
}: {
  item: EditorialContentItem;
  position?: "middle" | "hero";
}) {
  const track = (label: string) => {
    trackEditorialCtaClicked(
      buildEditorialAnalyticsPayload(item, { cta: label, position }),
    );
  };

  if (position === "hero") {
    return (
      <Button asChild onClick={() => track(item.cta.primary)}>
        <Link href="#editorial-lead-form">{item.cta.primary}</Link>
      </Button>
    );
  }

  return (
    <section className="mt-10 rounded-sm bg-sand/50 px-6 py-8" aria-label="Призыв к действию">
      <p className="font-display text-xl">{item.cta.primary}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button asChild onClick={() => track(item.cta.primary)}>
          <Link href="#editorial-lead-form">{item.cta.primary}</Link>
        </Button>
        {item.cta.secondary ? (
          <Button asChild variant="outline" onClick={() => track(item.cta.secondary!)}>
            <Link href="/catalog">{item.cta.secondary}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
