"use client";

import type { ProgrammaticPageData } from "@/types/programmatic-page-template";
import { LeadMagnetForm } from "@/components/lead-magnets/lead-magnet-form";
import { getLeadMagnetByIdFromData } from "@/data/lead-magnets";
import { trackProgrammaticLeadMagnetClicked } from "@/lib/programmatic-seo/programmatic-analytics";

const MAGNET_ID_MAP: Record<string, string> = {
  "project-selection-checklist": "budget-project-selection",
};

function resolveMagnetId(id: string): string {
  return MAGNET_ID_MAP[id] ?? id;
}

export function ProgrammaticLeadMagnet({ page }: { page: ProgrammaticPageData }) {
  if (!page.leadMagnet) return null;

  const magnet = getLeadMagnetByIdFromData(resolveMagnetId(page.leadMagnet.id));
  if (!magnet) return null;

  return (
    <section className="mt-16 rounded-sm border border-graphite/10 bg-sand/30 p-6 md:p-8">
      <h2 className="font-display text-2xl">{magnet.title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">{magnet.description}</p>
      <div
        className="mt-6"
        onClick={() =>
          trackProgrammaticLeadMagnetClicked({
            pageSlug: page.analytics.pageSlug,
            leadMagnetId: magnet.id,
          })
        }
        role="presentation"
      >
        <LeadMagnetForm
          magnet={magnet}
          context={{
            pageType: "catalog",
            pageSlug: page.analytics.pageSlug,
            clusterId: page.analytics.clusterId,
            selectedCTA: magnet.cta.primaryLabel,
          }}
          compact
        />
      </div>
    </section>
  );
}
