import { NextResponse } from "next/server";
import { publicationRepository } from "@/lib/content-distribution/publication-repository";
import { createPublicationDraft } from "@/lib/content-distribution/publication-service";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { buildTeaserVersion } from "@/lib/content-distribution/teaser-builder";
import type { ProgrammaticSEOPage } from "@/types/programmatic-seo";

type Body = {
  contentItemId: string;
  platformId: string;
  teaserId?: string;
};

export async function GET() {
  const publications = await publicationRepository.list();
  return NextResponse.json({ publications });
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.contentItemId || !body.platformId) {
    return NextResponse.json({ error: "contentItemId and platformId required" }, { status: 400 });
  }

  const contentItem = await contentRepository.getContentById(body.contentItemId);
  if (!contentItem) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  const pageLike: ProgrammaticSEOPage = {
    id: contentItem.id,
    title: contentItem.title,
    url: contentItem.url,
    clusterId: contentItem.clusterId ?? contentItem.slug,
    targetKeyword: contentItem.seo.targetKeyword ?? contentItem.title,
    seoDescription: contentItem.seoDescription ?? "",
    distribution: {
      canonicalFullArticleUrl: contentItem.distribution.canonicalFullArticleUrl,
      utmCampaignId: contentItem.distribution.utmCampaignId,
      teaserRequired: true,
      allowExternalTeasers: contentItem.distribution.allowExternalTeasers,
      platforms: contentItem.distribution.platforms,
    },
  } as ProgrammaticSEOPage;

  const teaser = buildTeaserVersion({ page: pageLike, platformId: body.platformId });

  try {
    const publication = await createPublicationDraft({ contentItem, teaser, platformId: body.platformId });
    return NextResponse.json({ publication });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
