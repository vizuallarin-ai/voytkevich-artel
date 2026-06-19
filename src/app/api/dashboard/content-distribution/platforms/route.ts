import { NextResponse } from "next/server";
import { externalContentPlatforms } from "@/data/external-content-platforms";
import { isAdapterActive } from "@/lib/content-distribution/platform-adapters";

export async function GET() {
  const platforms = externalContentPlatforms.map((p) => ({
    ...p,
    adapterActive: isAdapterActive(p.id),
  }));
  return NextResponse.json({ platforms });
}
