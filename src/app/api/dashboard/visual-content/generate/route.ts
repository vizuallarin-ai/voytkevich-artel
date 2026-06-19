import { NextResponse } from "next/server";
import { imageAssetService } from "@/lib/visual-content/image-asset-service";
import { visualTemplateRegistry } from "@/data/visual-template-registry";
import { visualStyleGuide } from "@/data/visual-style-guide";
import { brandCharacter } from "@/data/brand-character";
import { listImageGenerationProviders } from "@/lib/visual-content/image-generation-provider";

export async function GET() {
  return NextResponse.json({
    templates: visualTemplateRegistry,
    styleGuide: visualStyleGuide,
    brandCharacter,
    providers: listImageGenerationProviders().map((p) => ({
      id: p.id,
      label: p.label,
      isConfigured: p.isConfigured,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const genRequest = imageAssetService.createImageGenerationRequest({
      mode: body.mode ?? "content-cover",
      topic: body.topic,
      contentItemId: body.contentItemId,
      publicationId: body.publicationId,
      aspectRatio: body.aspectRatio ?? "16:9",
      templateId: body.templateId,
      visualStyleId: body.visualStyleId,
      brandCharacterId: body.brandCharacterId,
      titleText: body.titleText,
      subtitleText: body.subtitleText,
      ctaText: body.ctaText,
      additionalContext: body.additionalContext,
      contentKind: body.contentKind,
    });

    if (body.executeGeneration) {
      const asset = await imageAssetService.runImageGeneration(genRequest);
      return NextResponse.json({ asset, request: genRequest });
    }

    const { prompt, negativePrompt } = imageAssetService.generateImagePrompt(genRequest);
    const { asset } = await imageAssetService.generateAndSavePromptOnly(genRequest);
    return NextResponse.json({ asset, request: genRequest, prompt, negativePrompt });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
