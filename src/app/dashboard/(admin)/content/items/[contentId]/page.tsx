import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentService } from "@/lib/content-cms/content-service";
import { ContentItemDetail } from "@/components/content-cms/ContentItemDetail";

export const metadata: Metadata = {
  title: "CRM — Материал",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ contentId: string }> };

export default async function ContentItemPage({ params }: Props) {
  const { contentId } = await params;
  const id = decodeURIComponent(contentId);
  const item = await contentService.getById(id);
  if (!item) notFound();

  const auditLog = contentService.getAuditLog(id);

  return <ContentItemDetail item={item} auditLog={auditLog} />;
}
