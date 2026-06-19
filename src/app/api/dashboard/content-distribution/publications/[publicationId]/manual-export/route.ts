import { NextResponse } from "next/server";
import { markPublicationAsManualExportById } from "@/lib/content-distribution/publication-service";
import { buildManualExportPayload } from "@/lib/content-distribution/manual-export";
import { publicationRepository } from "@/lib/content-distribution/publication-repository";
import { trackPublicationManualExportOpened } from "@/lib/content-distribution/publication-analytics";

type Params = { params: Promise<{ publicationId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { publicationId } = await params;
  try {
    const publication = await markPublicationAsManualExportById(publicationId);
    const exportPayload = buildManualExportPayload(publication);
    trackPublicationManualExportOpened({ publicationId, platformId: publication.platformId });
    return NextResponse.json({ publication, exportPayload });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Manual export failed" },
      { status: 400 },
    );
  }
}

export async function GET(_request: Request, { params }: Params) {
  const { publicationId } = await params;
  const publication = await publicationRepository.getById(publicationId);
  if (!publication) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ exportPayload: buildManualExportPayload(publication) });
}
