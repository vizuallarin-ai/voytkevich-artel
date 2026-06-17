import type { Metadata } from "next";
import {
  generateProgrammaticMetadataForSlug,
  generateProgrammaticStaticParams,
  renderProgrammaticSlugPage,
} from "@/lib/programmatic-seo/programmatic-route";

const CONFIG = { pathPrefix: "/proekty-ban", primaryObjectTypeId: "bathhouses" as const };

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return generateProgrammaticStaticParams(CONFIG);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return generateProgrammaticMetadataForSlug(CONFIG, slug);
}

export default async function ProektyBanSlugPage({ params }: Props) {
  const { slug } = await params;
  return renderProgrammaticSlugPage(CONFIG, slug);
}
