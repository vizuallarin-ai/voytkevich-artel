import { NextResponse } from "next/server";
import { markManualPublicationAsPublishedById } from "@/lib/content-distribution/publication-service";

type Params = { params: Promise<{ publicationId: string }> };
type Body = { publishedUrl: string };

export async function POST(request: Request, { params }: Params) {
  const { publicationId } = await params;
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.publishedUrl?.trim()) {
    return NextResponse.json({ error: "publishedUrl required" }, { status: 400 });
  }
  try {
    const publication = await markManualPublicationAsPublishedById(
      publicationId,
      body.publishedUrl.trim(),
    );
    return NextResponse.json({ publication });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}
