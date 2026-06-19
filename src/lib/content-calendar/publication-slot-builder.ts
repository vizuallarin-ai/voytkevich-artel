import type { PublicationSlot } from "@/types/content-calendar";
import type { ContentScheduleMode } from "@/types/content-calendar";
import { getCapacityRules } from "@/data/content-capacity-rules";
import { DEFAULT_PUBLICATION_HOURS } from "@/data/content-calendar-views";

const slots = new Map<string, PublicationSlot>();

export function buildDailyPublicationSlots(date: string, mode: ContentScheduleMode): PublicationSlot[] {
  const rules = getCapacityRules(mode);
  const result: PublicationSlot[] = [];
  const hours = DEFAULT_PUBLICATION_HOURS;
  const siteSlots = Math.min(rules.maxSitePublicationsPerDay, hours.length);

  for (let i = 0; i < siteSlots; i++) {
    const time = `${String(hours[i] ?? 10).padStart(2, "0")}:00`;
    const id = `${date}-site-${i}`;
    const existing = slots.get(id);
    result.push(
      existing ?? {
        id,
        date,
        time,
        publicationType: "site-full-article",
        status: "empty",
        recommendedContentKinds: ["programmatic-page", "technical-article", "editorial-content"],
        capacityUsed: false,
        createdAt: new Date().toISOString(),
      },
    );
  }

  const extCount = Math.min(rules.maxExternalPublicationsPerDay, 4);
  for (let i = 0; i < extCount; i++) {
    const time = `${String((hours[i] ?? 10) + 1).padStart(2, "0")}:30`;
    const id = `${date}-ext-${i}`;
    result.push(
      slots.get(id) ?? {
        id,
        date,
        time,
        publicationType: "external-teaser",
        status: "empty",
        platformId: i % 2 === 0 ? "telegram" : "vk",
        recommendedContentKinds: ["technical-article", "editorial-content"],
        capacityUsed: false,
        createdAt: new Date().toISOString(),
      },
    );
  }

  return result;
}

export function buildWeeklyPublicationSlots(startDate: string, mode: ContentScheduleMode): PublicationSlot[] {
  const result: PublicationSlot[] = [];
  const start = new Date(startDate);
  for (let d = 0; d < 7; d++) {
    const date = new Date(start);
    date.setDate(start.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    result.push(...buildDailyPublicationSlots(dateStr, mode));
  }
  return result;
}

export function getAvailableSlots(
  startDate: string,
  endDate: string,
  mode: ContentScheduleMode,
  filters?: { publicationType?: PublicationSlot["publicationType"] },
): PublicationSlot[] {
  const all: PublicationSlot[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    all.push(...buildDailyPublicationSlots(d.toISOString().slice(0, 10), mode));
  }
  return all.filter((s) => {
    if (filters?.publicationType && s.publicationType !== filters.publicationType) return false;
    return s.status === "empty" || s.status === "reserved";
  });
}

export function reservePublicationSlot(slotId: string, contentItemId: string): PublicationSlot {
  const slot = slots.get(slotId) ?? buildSlotFromId(slotId);
  slot.status = "reserved";
  slot.contentItemId = contentItemId;
  slot.capacityUsed = true;
  slots.set(slotId, slot);
  return slot;
}

export function releasePublicationSlot(slotId: string): PublicationSlot | null {
  const slot = slots.get(slotId);
  if (!slot) return null;
  slot.status = "empty";
  slot.contentItemId = undefined;
  slot.capacityUsed = false;
  slots.set(slotId, slot);
  return slot;
}

function buildSlotFromId(slotId: string): PublicationSlot {
  const datePart = slotId.slice(0, 10);
  const isExt = slotId.includes("-ext-");
  return {
    id: slotId,
    date: datePart.length === 10 ? datePart : new Date().toISOString().slice(0, 10),
    time: "10:00",
    publicationType: isExt ? "external-teaser" : "site-full-article",
    status: "empty",
    recommendedContentKinds: [],
    capacityUsed: false,
    createdAt: new Date().toISOString(),
  };
}

export function getAllSlots(): PublicationSlot[] {
  return [...slots.values()];
}

export function markSlotScheduled(slotId: string, contentItemId: string, publicationId?: string): void {
  const slot = reservePublicationSlot(slotId, contentItemId);
  slot.status = "scheduled";
  slot.publicationId = publicationId;
  slots.set(slotId, slot);
}
