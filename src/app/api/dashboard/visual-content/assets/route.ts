import { NextResponse } from "next/server";
import { imageAssetService } from "@/lib/visual-content/image-asset-service";

export async function GET() {
  const assets = await imageAssetService.listAssets();
  return NextResponse.json({ assets });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const asset = await imageAssetService.createAssetFromBrief({
      topic: body.topic,
      title: body.title,
      kind: body.kind,
      aspectRatio: body.aspectRatio ?? "16:9",
      templateId: body.templateId,
      visualStyleId: body.visualStyleId,
      contentKind: body.contentKind,
    });
    return NextResponse.json({ asset }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
