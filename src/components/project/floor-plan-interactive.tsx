"use client";

import { useState } from "react";
import Image from "next/image";
import type { FloorPlan } from "@/types";
import { cn, formatNumber } from "@/lib/utils";

export function FloorPlanInteractive({ plans }: { plans: FloorPlan[] }) {
  const [floorIdx, setFloorIdx] = useState(0);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const plan = plans[floorIdx];

  if (!plan) {
    return (
      <p className="text-muted">Планировки будут добавлены в карточку проекта.</p>
    );
  }

  const room = plan.rooms.find((r) => r.id === activeRoom);

  return (
    <div>
      {plans.length > 1 && (
        <div className="mb-4 flex gap-2">
          {plans.map((p, i) => (
            <button
              key={p.floor}
              type="button"
              onClick={() => {
                setFloorIdx(i);
                setActiveRoom(null);
              }}
              className={cn(
                "rounded-sm border px-4 py-2 text-sm",
                i === floorIdx && "border-graphite bg-graphite text-background"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-sand">
        <Image src={plan.image} alt={plan.label} fill className="object-cover opacity-40" />
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`Интерактивная планировка: ${plan.label}`}
        >
          {plan.rooms.map((r) => (
            <polygon
              key={r.id}
              points={r.polygon}
              className={cn(
                "cursor-pointer transition-all duration-300",
                activeRoom === r.id
                  ? "fill-wood/50 stroke-wood"
                  : "fill-graphite/10 stroke-graphite/30 hover:fill-wood/30"
              )}
              strokeWidth="0.5"
              onMouseEnter={() => setActiveRoom(r.id)}
              onMouseLeave={() => setActiveRoom(null)}
              onFocus={() => setActiveRoom(r.id)}
              onBlur={() => setActiveRoom(null)}
              tabIndex={0}
            />
          ))}
        </svg>
        {room && (
          <div className="absolute bottom-4 left-4 glass rounded-sm px-4 py-3">
            <p className="font-medium">{room.name}</p>
            <p className="text-sm text-muted">{formatNumber(room.area)} м²</p>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-muted">Наведите на комнату, чтобы увидеть площадь</p>
    </div>
  );
}
