"use client";

import type { PublicationSlot } from "@/types/content-calendar";

type Props = {
  slot: PublicationSlot;
};

export function PublicationSlotCard({ slot }: Props) {
  return (
    <div
      className={`rounded-sm border p-2 text-xs ${
        slot.status === "empty"
          ? "border-dashed border-graphite/20 text-muted"
          : "border-graphite/10 bg-background"
      }`}
    >
      <p className="font-medium">{slot.time}</p>
      <p className="text-muted">{slot.publicationType}</p>
      {slot.platformId && <p className="text-muted">{slot.platformId}</p>}
      {slot.contentItemId && <p className="truncate mt-1">{slot.contentItemId}</p>}
      <p className="mt-1 capitalize">{slot.status}</p>
    </div>
  );
}
