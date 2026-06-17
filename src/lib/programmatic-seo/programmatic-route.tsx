import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgrammaticPageLayout } from "@/components/programmatic-seo/programmatic-page-layout";
import { cms } from "@/lib/cms/local";
import {
  buildPrimaryCategoryCombination,
  buildProgrammaticPageData,
} from "@/lib/programmatic-seo/page-data-builder";
import {
  findCombinationByPath,
  getCombinationsForPathPrefix,
} from "@/lib/programmatic-seo/page-template-resolver";
import { generateProgrammaticMetadata } from "@/lib/programmatic-seo/programmatic-metadata";

export type ProgrammaticRouteConfig = {
  pathPrefix: string;
  primaryObjectTypeId?: "houses" | "bathhouses";
};

export async function generateProgrammaticStaticParams(config: ProgrammaticRouteConfig) {
  const combos = getCombinationsForPathPrefix(config.pathPrefix);
  const slugs = combos.map((c) => c.slug).filter(Boolean);
  return slugs.map((slug) => ({ slug }));
}

export async function generateProgrammaticMetadataForSlug(
  config: ProgrammaticRouteConfig,
  slug: string,
): Promise<Metadata> {
  const combination = findCombinationByPath(config.pathPrefix, slug);
  if (!combination) return {};

  const projects = await cms.getProjects();
  const pageData = buildProgrammaticPageData(combination, projects);
  return generateProgrammaticMetadata(pageData);
}

export async function renderProgrammaticSlugPage(config: ProgrammaticRouteConfig, slug: string) {
  const combination = findCombinationByPath(config.pathPrefix, slug);
  if (!combination) notFound();

  const projects = await cms.getProjects();
  const pageData = buildProgrammaticPageData(combination, projects);
  return <ProgrammaticPageLayout page={pageData} />;
}

export async function renderProgrammaticRootPage(objectTypeId: "houses" | "bathhouses") {
  const combination = buildPrimaryCategoryCombination(objectTypeId);
  if (!combination) notFound();

  const projects = await cms.getProjects();
  const pageData = buildProgrammaticPageData(combination, projects);
  return <ProgrammaticPageLayout page={pageData} />;
}

export async function generateProgrammaticRootMetadata(
  objectTypeId: "houses" | "bathhouses",
): Promise<Metadata> {
  const combination = buildPrimaryCategoryCombination(objectTypeId);
  if (!combination) return {};

  const projects = await cms.getProjects();
  const pageData = buildProgrammaticPageData(combination, projects);
  return generateProgrammaticMetadata(pageData);
}
