import { NextResponse } from "next/server";
import { approvePublication } from "@/lib/content-distribution/publication-service";

type Params = { params: Promise<{ publicationId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { publicationId } = await params;
  try {
    const publication = await approvePublication(publicationId);
    return NextResponse.json({ publication });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Approve failed" },
      { status: 400 },
    );
  }
}
