"use client";

import { useCallback, useRef, useState } from "react";
import type { FloorPlan } from "@/types";
import type { LayoutRoom } from "@/lib/planner-layout";
import {
  legendSwatch,
  plannerLegend,
  rectCenter,
  roomFill,
  roomKind,
  shortRoomName,
} from "@/lib/planner-visual";
import { cn, formatNumber } from "@/lib/utils";

type DragState = {
  id: string;
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

export function PlannerCanvas({
  plans,
  floorIdx,
  onFloorChange,
  roomsOnFloor,
  selectedId,
  onSelect,
  onMove,
  twoFloors = false,
}: {
  plans: FloorPlan[];
  floorIdx: number;
  onFloorChange: (idx: number) => void;
  roomsOnFloor: LayoutRoom[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  twoFloors?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const safeIdx =
    plans.length === 0 ? 0 : Math.min(Math.max(0, floorIdx), plans.length - 1);
  const plan = plans[safeIdx] ?? plans[0];
  const active = roomsOnFloor.find((r) => r.id === selectedId);

  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const loc = pt.matrixTransform(matrix.inverse());
    return { x: loc.x, y: loc.y };
  }, []);

  const handlePointerDown = (room: LayoutRoom, e: React.PointerEvent) => {
    if (room.id === "stairs") return;
    const svg = svgRef.current;
    if (!svg) return;
    svg.setPointerCapture(e.pointerId);
    const { x, y } = clientToSvg(e.clientX, e.clientY);
    onSelect(room.id);
    setDrag({
      id: room.id,
      pointerId: e.pointerId,
      offsetX: x - room.x,
      offsetY: y - room.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    const { x, y } = clientToSvg(e.clientX, e.clientY);
    onMove(drag.id, x - drag.offsetX, y - drag.offsetY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (drag?.pointerId === e.pointerId) {
      svgRef.current?.releasePointerCapture(e.pointerId);
      setDrag(null);
    }
  };

  if (!plan || plans.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-graphite/20 p-8 text-center text-sm text-muted">
        Загрузка планировки…
      </p>
    );
  }

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
                onFloorChange(i);
                onSelect(null);
              }}
              className={cn(
                "rounded-sm border px-4 py-2 text-sm transition",
                i === safeIdx
                  ? "border-graphite bg-graphite text-background"
                  : "border-graphite/15 hover:border-graphite/40",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <p className="mb-3 text-xs text-muted">
        Перетащите комнату мышью или пальцем. Площадь — слайдером в списке ниже.
      </p>

      <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-graphite/15 bg-sand touch-none">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="h-full w-full cursor-default"
          role="img"
          aria-label={`Редактор планировки: ${plan.label}`}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
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

          {roomsOnFloor.map((room) => {
            const kind = roomKind(room.id);
            const isActive = selectedId === room.id;
            const isDragging = drag?.id === room.id;
            const center = rectCenter(room.x, room.y, room.w, room.h);
            const draggable = room.id !== "stairs";

            return (
              <g key={room.id}>
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.w}
                  height={room.h}
                  rx={0.4}
                  className={cn(
                    roomFill(kind, isActive, isDragging),
                    draggable && "cursor-grab active:cursor-grabbing",
                  )}
                  strokeWidth={isActive || isDragging ? 1 : 0.55}
                  onPointerDown={(e) => handlePointerDown(room, e)}
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
                      {shortRoomName(room.name)}
                    </text>
                    <text
                      x={center.x}
                      y={center.y + 2.8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none fill-graphite/60 text-[2.4px]"
                    >
                      {room.area} м²
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

        {active && (
          <div className="absolute bottom-4 left-4 glass rounded-sm px-4 py-3">
            <p className="font-medium">{active.name}</p>
            <p className="text-sm text-muted">~{formatNumber(active.area)} м²</p>
          </div>
        )}
      </div>

      <ul className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
        {plannerLegend.map((item) => (
          <li key={item.kind} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-sm border", legendSwatch(item.kind))} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
