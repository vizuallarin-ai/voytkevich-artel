import { NextResponse } from "next/server";
import { imageAssetService } from "@/lib/visual-content/image-asset-service";

type Params = { params: Promise<{ imageId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { imageId } = await params;
    const body = await request.json();
    const asset = await imageAssetService.rejectVisualAsset(imageId, body.reason ?? "rejected");
    return NextResponse.json({ asset });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
