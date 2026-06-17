import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { contentService } from "@/lib/content-cms/content-service";
import { ContentPreviewPanel } from "@/components/content-cms/ContentPreviewPanel";

export const metadata: Metadata = {
  title: "CRM — Preview",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ contentId: string }> };

export default async function ContentPreviewPage({ params }: Props) {
  const { contentId } = await params;
  const id = decodeURIComponent(contentId);
  const preview = await contentService.getPreview(id);
  if (!preview) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/content/items/${encodeURIComponent(id)}`}
        className="text-sm text-muted underline-offset-4 hover:underline"
      >
        ← К материалу
      </Link>
      <h1 className="heading-section text-2xl">Preview (dashboard only)</h1>
      <ContentPreviewPanel preview={preview} />
    </div>
  );
}
