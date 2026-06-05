"use client";

import { Plus, Trash2 } from "lucide-react";
import type { PlannerRoomItem } from "@/lib/planner-scenarios";
import {
  ROOM_TYPE_LABELS,
  clampRoomArea,
  type PlannerRoomType,
} from "@/lib/planner-rooms";
import { ROOM_TYPE_GROUPS } from "@/data/planner-copy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function PlannerRoomListEditor({
  rooms,
  onChange,
  onAdd,
  onRemove,
}: {
  rooms: PlannerRoomItem[];
  onChange: (id: string, patch: Partial<PlannerRoomItem>) => void;
  onAdd: (type: PlannerRoomType) => void;
  onRemove: (id: string) => void;
}) {
  const total = rooms.reduce((s, r) => s + (Number.isFinite(r.area) ? r.area : 0), 0);

  return (
    <section aria-labelledby="room-list-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="room-list-title" className="font-display text-xl">
            Состав помещений
          </h2>
          <p className="mt-1 text-sm text-muted">
            Сумма: {total > 0 ? `${total} м²` : "—"} · {rooms.length} помещений
          </p>
        </div>
        <AddRoomMenu onAdd={onAdd} />
      </div>

      <ul className="mt-6 space-y-4">
        {rooms.map((room) => (
          <li
            key={room.id}
            className="rounded-sm border border-graphite/10 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1 space-y-3">
                <Input
                  value={room.name}
                  onChange={(e) => onChange(room.id, { name: e.target.value })}
                  aria-label="Название помещения"
                />
                <p className="text-xs text-muted">{ROOM_TYPE_LABELS[room.type]}</p>
                <div>
                  <Label className="text-xs">Площадь: {room.area} м²</Label>
                  <Slider
                    className="mt-2"
                    min={2}
                    max={80}
                    step={1}
                    value={[room.area]}
                    onValueChange={([v]) =>
                      onChange(room.id, { area: clampRoomArea(room.type, v) })
                    }
                  />
                </div>
              </div>
              {!room.required && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(room.id)}
                  aria-label={`Удалить ${room.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AddRoomMenu({ onAdd }: { onAdd: (type: PlannerRoomType) => void }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-sm border border-graphite/15 px-4 py-2 text-sm hover:bg-sand/50">
        <Plus className="h-4 w-4" />
        Добавить комнату
      </summary>
      <div className="absolute right-0 z-10 mt-2 max-h-64 w-56 overflow-y-auto rounded-sm border border-graphite/10 bg-background p-2 shadow-lg">
        {Object.entries(ROOM_TYPE_GROUPS).map(([group, types]) => (
          <div key={group} className="mb-2">
            <p className="px-2 py-1 text-[10px] uppercase text-muted">{group}</p>
            {types.map((type) => (
              <button
                key={type}
                type="button"
                className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-sand"
                onClick={() => onAdd(type as PlannerRoomType)}
              >
                {ROOM_TYPE_LABELS[type as PlannerRoomType]}
              </button>
            ))}
          </div>
        ))}
      </div>
    </details>
  );
}
