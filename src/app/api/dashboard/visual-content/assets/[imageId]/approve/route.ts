import { NextResponse } from "next/server";
import { imageAssetService } from "@/lib/visual-content/image-asset-service";

type Params = { params: Promise<{ imageId: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { imageId } = await params;
    const asset = await imageAssetService.approveVisualAsset(imageId);
    return NextResponse.json({ asset });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
