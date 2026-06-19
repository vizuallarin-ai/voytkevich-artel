import { NextResponse } from "next/server";
import { publicationRepository } from "@/lib/content-distribution/publication-repository";
import { sortQueue } from "@/lib/content-distribution/publication-queue";

export async function GET() {
  const queue = sortQueue(await publicationRepository.getQueue());
  return NextResponse.json({ queue });
}
