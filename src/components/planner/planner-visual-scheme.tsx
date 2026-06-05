import type { PlannerRoomItem } from "@/lib/planner-scenarios";
import { ROOM_ZONE_MAP, type PlannerRoomType } from "@/lib/planner-rooms";
import { ZONE_LABELS } from "@/data/planner-copy";
import { cn } from "@/lib/utils";

const ZONE_ORDER = ["living", "sanitary", "technical", "passage", "additional"] as const;

export function PlannerVisualScheme({ rooms }: { rooms: PlannerRoomItem[] }) {
  const grouped = ZONE_ORDER.map((zone) => ({
    zone,
    label: ZONE_LABELS[zone],
    items: rooms.filter((r) => {
      const z = ROOM_ZONE_MAP[r.type as PlannerRoomType];
      return z === zone && r.area > 0;
    }),
  })).filter((g) => g.items.length > 0);

  if (!grouped.length) {
    return (
      <p className="rounded-sm border border-dashed border-graphite/20 p-6 text-center text-sm text-muted">
        Добавьте помещения или выберите сценарий, чтобы увидеть схему.
      </p>
    );
  }

  const maxArea = Math.max(...rooms.map((r) => r.area), 1);

  return (
    <section aria-labelledby="planner-scheme-title">
      <h2 id="planner-scheme-title" className="font-display text-xl">
        Планировочная схема
      </h2>
      <p className="mt-2 text-sm text-muted">
        Условная группировка помещений — не архитектурный план.
      </p>
      <div className="mt-6 space-y-6">
        {grouped.map(({ zone, label, items }) => (
          <div key={zone}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((room) => (
                <li
                  key={room.id}
                  className={cn(
                    "rounded-sm border border-graphite/10 p-3",
                    zone === "additional" && "bg-sand/40",
                    zone === "technical" && "bg-muted-bg",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{room.name}</span>
                    <span className="shrink-0 text-sm text-muted">{room.area} м²</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
                    <div
                      className="h-full bg-graphite/60"
                      style={{ width: `${Math.min(100, (room.area / maxArea) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted">Эт. {room.floor}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
