import { NextResponse } from "next/server";
import { publicationRepository } from "@/lib/content-distribution/publication-repository";
import { getDistributionAuditLog } from "@/lib/content-distribution/distribution-audit-log";
import { validatePublicationById } from "@/lib/content-distribution/publication-service";

type Params = { params: Promise<{ publicationId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { publicationId } = await params;
  const publication = await publicationRepository.getById(publicationId);
  if (!publication) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const audit = getDistributionAuditLog(publicationId);
  return NextResponse.json({ publication, audit });
}

export async function POST(_request: Request, { params }: Params) {
  const { publicationId } = await params;
  try {
    const result = await validatePublicationById(publicationId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Validation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
