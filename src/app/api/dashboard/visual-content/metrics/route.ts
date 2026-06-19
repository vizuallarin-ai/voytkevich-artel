import { NextResponse } from "next/server";
import { imageAssetService } from "@/lib/visual-content/image-asset-service";

export async function GET() {
  const metrics = await imageAssetService.getMetrics();
  return NextResponse.json({ metrics });
}
