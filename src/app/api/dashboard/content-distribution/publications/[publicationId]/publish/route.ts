import { NextResponse } from "next/server";
import { publishPublication } from "@/lib/content-distribution/publication-service";

type Params = { params: Promise<{ publicationId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { publicationId } = await params;
  try {
    const publication = await publishPublication(publicationId);
    return NextResponse.json({ publication });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Publish failed" },
      { status: 400 },
    );
  }
}
