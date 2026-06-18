"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatPriceRange, quickHeroEstimate } from "@/lib/calculator";
import { pluralize } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { cta } from "@/data/copy";

export function HeroCalculator({ className }: { className?: string }) {
  const [area, setArea] = useState([150]);
  const estimate = useMemo(() => quickHeroEstimate(area[0]), [area]);

  return (
    <div className={cn("glass rounded-sm p-5 md:p-6 lg:p-8", className)}>
      <div className="lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-8 xl:gap-12">
        <div className="min-w-0">
          <p className="label-caps">Ориентир по бюджету</p>
          <p className="mt-2 text-sm text-muted">Площадь дома: {area[0]} м²</p>
          <Slider
            className="mt-4"
            min={80}
            max={300}
            step={5}
            value={area}
            onValueChange={setArea}
            aria-label="Площадь дома"
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-graphite/10 pt-4 lg:mt-0 lg:w-full lg:max-w-xl lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 xl:pl-12">
          <div>
            <p className="text-xs text-muted">Ориентир «под ключ»</p>
            <p className="mt-1 font-display text-lg md:text-xl">
              {formatPriceRange(estimate.priceMin, estimate.priceMax)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Срок строительства</p>
            <p className="mt-1 font-display text-xl md:text-2xl">
              {estimate.months}{" "}
              {pluralize(estimate.months, "месяц", "месяца", "месяцев")}
            </p>
          </div>
        </div>
      </div>
      <Button asChild className="mt-6 w-full lg:mt-8" size="lg">
        <Link href="/calculator">{cta.calculateCost}</Link>
      </Button>
    </div>
  );
}
