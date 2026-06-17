import type { Metadata } from "next";
import type { CMSContentKind, ContentFilters } from "@/types/content-cms";
import { contentService } from "@/lib/content-cms/content-service";
import { ContentTable } from "@/components/content-cms/ContentTable";
import Link from "next/link";

type Props = {
  title: string;
  description: string;
  filters?: ContentFilters;
  showKind?: boolean;
  backHref?: string;
};

export async function ContentSectionPage({
  title,
  description,
  filters,
  showKind = true,
  backHref = "/dashboard/content",
}: Props) {
  const items = await contentService.list(filters);

  return (
    <div className="space-y-6">
      <div>
        <Link href={backHref} className="text-sm text-muted underline-offset-4 hover:underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">{description}</p>
        <p className="mt-2 text-xs text-muted">Материалов: {items.length}</p>
      </div>
      <ContentTable items={items} showKind={showKind} />
    </div>
  );
}

export function contentSectionMetadata(title: string): Metadata {
  return {
    title: `CRM — ${title}`,
    robots: { index: false, follow: false },
  };
}

export function kindFilter(kind: CMSContentKind | CMSContentKind[]): ContentFilters {
  return { kind: Array.isArray(kind) ? kind : [kind] };
}
