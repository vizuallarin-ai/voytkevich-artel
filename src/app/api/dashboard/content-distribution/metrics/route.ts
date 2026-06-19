import { NextResponse } from "next/server";
import { publicationRepository } from "@/lib/content-distribution/publication-repository";

export async function GET() {
  const metrics = await publicationRepository.getMetrics();
  return NextResponse.json({ metrics });
}
