"use client";

import type { ContentCalendarItem } from "@/types/content-calendar";
import type { PublicationSlot } from "@/types/content-calendar";
import { ContentCalendarItemCard } from "./ContentCalendarItemCard";
import { PublicationSlotCard } from "./PublicationSlotCard";

type Props = {
  date: string;
  scheduled: ContentCalendarItem[];
  slots: PublicationSlot[];
};

export function ContentCalendarGrid({ date, scheduled, slots }: Props) {
  const daySlots = slots.filter((s) => s.date === date);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2 space-y-3">
        <h2 className="font-semibold text-sm">
          Scheduled — {new Date(date).toLocaleDateString("ru-RU")}
        </h2>
        {scheduled.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {scheduled.map((item) => (
              <ContentCalendarItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">На этот день ничего не запланировано.</p>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold text-sm">Publication slots</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {daySlots.slice(0, 8).map((slot) => (
            <PublicationSlotCard key={slot.id} slot={slot} />
          ))}
        </div>
      </section>
    </div>
  );
}
