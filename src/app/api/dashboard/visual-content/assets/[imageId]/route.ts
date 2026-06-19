import { NextResponse } from "next/server";
import { imageAssetService } from "@/lib/visual-content/image-asset-service";
import { imageAssetRepository } from "@/lib/visual-content/image-asset-repository";

type Params = { params: Promise<{ imageId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { imageId } = await params;
  const asset = await imageAssetService.getAssetById(imageId);
  if (!asset) return NextResponse.json({ error: "not found" }, { status: 404 });
  const validation = imageAssetService.validateVisualAsset(asset);
  const audit = imageAssetRepository.getAuditForAsset(imageId);
  return NextResponse.json({ asset, validation, audit });
}

export async function PATCH(request: Request, { params }: Params) {
  const { imageId } = await params;
  const asset = await imageAssetService.getAssetById(imageId);
  if (!asset) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await request.json();
  if (body.seo?.alt) asset.seo.alt = body.seo.alt;
  if (body.status) asset.status = body.status;
  if (body.title) asset.title = body.title;
  const saved = await imageAssetService.saveVisualAsset(asset);
  return NextResponse.json({ asset: saved });
}
