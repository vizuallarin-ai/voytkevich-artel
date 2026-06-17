"use client";

import type { EditorialContentItem } from "@/types/editorial-content";
import { LeadMagnetForm } from "@/components/lead-magnets/lead-magnet-form";
import { getLeadMagnetByIdFromData } from "@/data/lead-magnets";
import {
  buildEditorialAnalyticsPayload,
  trackEditorialLeadMagnetClicked,
} from "@/lib/editorial-content/editorial-analytics";

export function EditorialLeadMagnet({ item }: { item: EditorialContentItem }) {
  const magnetId = item.cta.leadMagnetId;
  if (!magnetId) return null;

  const magnet = getLeadMagnetByIdFromData(magnetId);
  if (!magnet) return null;

  return (
    <section className="mt-12 rounded-sm border border-graphite/10 bg-sand/30 p-6">
      <h2 className="font-display text-xl">{magnet.title}</h2>
      <p className="mt-2 text-sm text-muted">{magnet.description}</p>
      <div
        className="mt-4"
        onClick={() =>
          trackEditorialLeadMagnetClicked(
            buildEditorialAnalyticsPayload(item, { leadMagnetId: magnet.id }),
          )
        }
        role="presentation"
      >
        <LeadMagnetForm
          magnet={magnet}
          context={{
            pageType: "blog",
            pageSlug: item.slug,
            selectedCTA: magnet.cta.primaryLabel,
          }}
          compact
        />
      </div>
    </section>
  );
}
