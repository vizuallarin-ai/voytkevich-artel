import type { ExternalPublication } from "@/types/content-distribution";
import { getExternalPlatform } from "@/data/external-content-platforms";

export function PublicationPreview({ publication }: { publication: ExternalPublication }) {
  const platform = getExternalPlatform(publication.platformId);
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{publication.payload.title}</h3>
        <span className="text-xs text-muted">{platform?.title ?? publication.platformId}</span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{publication.payload.text}</p>
      {publication.payload.hashtags?.length ? (
        <p className="text-xs text-muted">{publication.payload.hashtags.join(" ")}</p>
      ) : null}
    </div>
  );
}
