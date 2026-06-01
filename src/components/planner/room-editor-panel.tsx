"use client";

import { RotateCcw } from "lucide-react";
import type { LayoutRoom } from "@/lib/planner-layout";
import { areaLimits } from "@/lib/planner-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export function RoomEditorPanel({
  rooms,
  selectedId,
  onSelect,
  onAreaChange,
  onReset,
  isCustomized,
  floorLabel,
}: {
  rooms: LayoutRoom[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAreaChange: (id: string, area: number) => void;
  onReset: () => void;
  isCustomized: boolean;
  floorLabel: string;
}) {
  const editable = rooms.filter((r) => r.id !== "stairs");

  return (
    <div className="rounded-sm border border-graphite/10 bg-muted-bg/50 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Комнаты · {floorLabel}</p>
          <p className="text-xs text-muted">Настройте площадь каждого помещения</p>
        </div>
        {isCustomized && (
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Сбросить
          </Button>
        )}
      </div>

      <ul className="space-y-4">
        {editable.map((room) => {
          const limits = areaLimits(room.id);
          const selected = selectedId === room.id;
          return (
            <li
              key={room.id}
              className={cn(
                "rounded-sm border p-3 transition",
                selected
                  ? "border-wood bg-background shadow-sm"
                  : "border-transparent bg-background/60 hover:border-graphite/10",
              )}
            >
              <button
                type="button"
                className="mb-2 flex w-full items-center justify-between text-left text-sm"
                onClick={() => onSelect(room.id)}
              >
                <span className="font-medium">{room.name}</span>
                <span className="text-muted">{room.area} м²</span>
              </button>
              <Label className="sr-only">Площадь {room.name}</Label>
              <Slider
                min={limits.min}
                max={limits.max}
                step={1}
                value={[room.area]}
                onValueChange={([v]) => onAreaChange(room.id, v)}
                onPointerDown={() => onSelect(room.id)}
              />
              <p className="mt-1 text-[10px] text-muted">
                {limits.min}–{limits.max} м²
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
