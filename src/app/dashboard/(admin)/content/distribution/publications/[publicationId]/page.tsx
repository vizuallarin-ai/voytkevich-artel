import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicationRepository } from "@/lib/content-distribution/publication-repository";
import { getDistributionAuditLog } from "@/lib/content-distribution/distribution-audit-log";
import { validatePublication } from "@/lib/content-distribution/publication-validator";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { PublicationPreview } from "@/components/content-distribution/PublicationPreview";
import { PublicationStatusBadge } from "@/components/content-distribution/PublicationStatusBadge";
import { PublicationValidationPanel } from "@/components/content-distribution/PublicationValidationPanel";
import { UTMPreview } from "@/components/content-distribution/UTMPreview";
import { PublicationActions } from "@/components/content-distribution/PublicationActions";
import { getExternalPlatform } from "@/data/external-content-platforms";

type Props = { params: Promise<{ publicationId: string }> };

export const metadata: Metadata = {
  title: "CRM — Публикация",
  robots: { index: false, follow: false },
};

export default async function PublicationDetailPage({ params }: Props) {
  const { publicationId } = await params;
  const publication = await publicationRepository.getById(publicationId);
  if (!publication) notFound();

  const content = await contentRepository.getContentById(publication.contentItemId);
  const validation = validatePublication(publication, content);
  const audit = getDistributionAuditLog(publicationId);
  const platform = getExternalPlatform(publication.platformId);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/content/distribution/publications" className="text-sm text-muted underline">
        ← Публикации
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="heading-section text-2xl">{publication.payload.title}</h1>
        <PublicationStatusBadge status={publication.status} />
      </div>
      <p className="text-xs font-mono text-muted">{publication.id}</p>
      <p className="text-sm text-muted">
        Площадка: {platform?.title ?? publication.platformId} · Материал:{" "}
        <Link href={`/dashboard/content/items/${publication.contentItemId}`} className="text-primary underline">
          {content?.title ?? publication.contentItemId}
        </Link>
      </p>

      <PublicationPreview publication={publication} />
      <UTMPreview
        utmUrl={publication.payload.utmUrl}
        canonicalUrl={publication.payload.fullArticleUrl}
      />
      <PublicationValidationPanel validation={validation} />
      <PublicationActions
        publication={publication}
        canPublish={validation.canPublish}
        requiresManualExport={validation.requiresManualExport}
      />

      {publication.error && (
        <p className="text-sm text-destructive">
          Error: {publication.error.message}
        </p>
      )}
      {publication.publishedUrl && (
        <p className="text-sm">
          Published:{" "}
          <a href={publication.publishedUrl} className="text-primary underline" target="_blank" rel="noreferrer">
            {publication.publishedUrl}
          </a>
        </p>
      )}

      {audit.length > 0 && (
        <div className="rounded-xl border p-4 text-xs space-y-1">
          <p className="font-medium text-sm mb-2">Audit log</p>
          {audit.map((e) => (
            <p key={e.id} className="text-muted">
              {new Date(e.at).toLocaleString("ru-RU")} — {e.event}
              {e.message ? `: ${e.message}` : ""}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
