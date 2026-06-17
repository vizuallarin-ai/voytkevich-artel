import type { CMSContentItem } from "@/types/content-cms";

export function ContentLeadContextPanel({ item }: { item: CMSContentItem }) {
  return (
    <dl className="space-y-2 text-sm">
      <div>
        <dt className="text-muted">Kind</dt>
        <dd>{item.kind}</dd>
      </div>
      <div>
        <dt className="text-muted">Rubric / cluster</dt>
        <dd>{item.rubricId ?? item.clusterId ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-muted">Lead magnets</dt>
        <dd>{item.related.leadMagnets?.join(", ") ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-muted">UTM campaign</dt>
        <dd>{item.distribution.utmCampaignId ?? "—"}</dd>
      </div>
    </dl>
  );
}
