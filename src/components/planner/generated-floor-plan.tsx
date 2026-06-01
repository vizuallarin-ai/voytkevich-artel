"use client";

import { useState } from "react";
import type { FloorPlan } from "@/types";
import { cn, formatNumber } from "@/lib/utils";

const legend = [
  { kind: "living", label: "Общие зоны" },
  { kind: "bed", label: "Спальни" },
  { kind: "bath", label: "Санузлы" },
  { kind: "service", label: "Гараж / терраса" },
] as const;

export function GeneratedFloorPlan({
  plans,
  twoFloors = false,
}: {
  plans: FloorPlan[];
  twoFloors?: boolean;
}) {
  const [floorIdx, setFloorIdx] = useState(0);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const plan = plans[floorIdx];
  const room = plan?.rooms.find((r) => r.id === activeRoom);

  if (!plan) return null;

  const showEntry = plan.floor === 1;

  return (
    <div>
      {plans.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {plans.map((p, i) => (
            <button
              key={p.floor}
              type="button"
              onClick={() => {
                setFloorIdx(i);
                setActiveRoom(null);
              }}
              className={cn(
                "rounded-sm border px-4 py-2 text-sm transition",
                i === floorIdx
                  ? "border-graphite bg-graphite text-background"
                  : "border-graphite/15 hover:border-graphite/40",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-graphite/15 bg-sand">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          role="img"
          aria-label={`Схема планировки: ${plan.label}`}
        >
          <rect
            x={0.8}
            y={0.8}
            width={98.4}
            height={98.4}
            fill="#f7f5f2"
            stroke="currentColor"
            strokeWidth={0.8}
            className="text-graphite/25"
          />
          {plan.rooms.map((r) => {
            const kind = roomKind(r.id);
            const center = polygonCenter(r.polygon);
            return (
              <g key={r.id}>
                <polygon
                  points={r.polygon}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    roomFill(kind, activeRoom === r.id),
                  )}
                  strokeWidth={activeRoom === r.id ? 1 : 0.55}
                  onMouseEnter={() => setActiveRoom(r.id)}
                  onMouseLeave={() => setActiveRoom(null)}
                  onFocus={() => setActiveRoom(r.id)}
                  onBlur={() => setActiveRoom(null)}
                  tabIndex={0}
                />
                {center.w > 8 && center.h > 7 && (
                  <>
                    <text
                      x={center.x}
                      y={center.y - 1.2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none fill-graphite text-[2.8px] font-medium"
                    >
                      {shortName(r.name)}
                    </text>
                    <text
                      x={center.x}
                      y={center.y + 2.8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none fill-graphite/60 text-[2.4px]"
                    >
                      {r.area} м²
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {showEntry && (
            <g aria-label="Вход">
              <path
                d="M 46 98.5 L 50 94.5 L 54 98.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={0.7}
                className="text-wood"
              />
              <text x={50} y={93.2} textAnchor="middle" className="fill-wood text-[2.5px]">
                вход
              </text>
            </g>
          )}

          {twoFloors && plan.floor === 1 && (
            <text x={92} y={96} textAnchor="end" className="fill-graphite/50 text-[2.4px]">
              ↑ 2 этаж
            </text>
          )}
        </svg>

        {room && (
          <div className="absolute bottom-4 left-4 glass rounded-sm px-4 py-3">
            <p className="font-medium">{room.name}</p>
            <p className="text-sm text-muted">~{formatNumber(room.area)} м²</p>
          </div>
        )}
      </div>

      <ul className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
        {legend.map((item) => (
          <li key={item.kind} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-sm border", legendSwatch(item.kind))} />
            {item.label}
          </li>
        ))}
      </ul>

      <p className="mt-2 text-xs text-muted">
        Размер комнат на схеме пропорционален площади. Это эскиз для подбора проекта, не
        строительная документация.
      </p>
    </div>
  );
}

function roomKind(id: string) {
  if (id === "kitchen" || id === "living") return "living";
  if (id.startsWith("bed")) return "bed";
  if (id.startsWith("bath") || id === "hall" || id.startsWith("hall")) return "bath";
  if (id === "garage" || id === "terrace") return "service";
  if (id === "stairs") return "stairs";
  return "living";
}

function roomFill(kind: ReturnType<typeof roomKind>, active: boolean) {
  const base = {
    living: active ? "fill-wood/50 stroke-wood" : "fill-wood/20 stroke-wood/40",
    bed: active ? "fill-graphite/25 stroke-graphite" : "fill-background stroke-graphite/35",
    bath: active ? "fill-sky-200/80 stroke-sky-600" : "fill-sky-100/60 stroke-sky-500/40",
    service: active ? "fill-stone-300/80 stroke-stone-600" : "fill-stone-200/50 stroke-stone-500/35",
    stairs: active ? "fill-graphite/20 stroke-graphite" : "fill-sand stroke-graphite/30",
  };
  return base[kind];
}

function legendSwatch(kind: (typeof legend)[number]["kind"]) {
  const map = {
    living: "border-wood/40 bg-wood/25",
    bed: "border-graphite/30 bg-background",
    bath: "border-sky-500/40 bg-sky-100/70",
    service: "border-stone-500/35 bg-stone-200/60",
  };
  return map[kind];
}

function polygonCenter(points: string) {
  const coords = points.split(" ").map((p) => p.split(",").map(Number));
  const xs = coords.map(([px]) => px);
  const ys = coords.map(([, py]) => py);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  };
}

function shortName(name: string) {
  return name
    .replace("Спальня ", "Сп. ")
    .replace("Санузел ", "С/у ")
    .replace("Кухня-гостиная", "Кухня-гост.");
}
