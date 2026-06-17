"use client";

import type { TechnicalArticle } from "@/types/technical-content";
import { LeadMagnetForm } from "@/components/lead-magnets/lead-magnet-form";
import { getLeadMagnetByIdFromData } from "@/data/lead-magnets";
import { trackTechnicalLeadMagnetClicked } from "@/lib/technical-content/technical-analytics";

export function TechnicalLeadMagnet({ article }: { article: TechnicalArticle }) {
  const magnetId = article.cta.leadMagnetId;
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
          trackTechnicalLeadMagnetClicked({
            articleSlug: article.slug,
            leadMagnetId: magnet.id,
          })
        }
        role="presentation"
      >
        <LeadMagnetForm
          magnet={magnet}
          context={{
            pageType: "blog",
            pageSlug: article.slug,
            clusterId: article.clusterId,
            selectedCTA: magnet.cta.primaryLabel,
          }}
          compact
        />
      </div>
    </section>
  );
}
