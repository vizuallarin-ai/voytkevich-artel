"use client";

import { useState } from "react";
import Image from "next/image";
import type { BuiltHome } from "@/types";
import { cn } from "@/lib/utils";

export function BuiltHomesMap({ homes }: { homes: BuiltHome[] }) {
  const [active, setActive] = useState(homes[0]?.id);

  const selected = homes.find((h) => h.id === active);

  const toX = (lng: number) => ((lng - 104.1) / 0.35) * 100;
  const toY = (lat: number) => ((52.4 - lat) / 0.25) * 100;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-sm bg-sand">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&h=800&q=80')] bg-cover" />
        {homes.map((h) => (
          <button
            key={h.id}
            type="button"
            className={cn(
              "absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background transition",
              active === h.id ? "scale-150 bg-wood" : "bg-graphite hover:scale-125"
            )}
            style={{ left: `${toX(h.lng)}%`, top: `${toY(h.lat)}%` }}
            onClick={() => setActive(h.id)}
            aria-label={h.name}
          />
        ))}
      </div>
      {selected && (
        <article className="flex flex-col justify-center">
          <div className="relative aspect-video overflow-hidden rounded-sm">
            <Image src={selected.image} alt={selected.name} fill className="object-cover" />
          </div>
          <h3 className="mt-4 font-display text-2xl">{selected.name}</h3>
          <p className="mt-2 text-muted">
            {selected.area} м² · сдан в {selected.year}
          </p>
        </article>
      )}
    </div>
  );
}
