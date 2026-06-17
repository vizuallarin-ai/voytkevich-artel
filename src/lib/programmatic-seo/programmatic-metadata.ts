import type { Metadata } from "next";
import type { ProgrammaticPageData } from "@/types/programmatic-page-template";
import { pageMetadata } from "@/lib/seo";

export function generateProgrammaticRobots(pageData: ProgrammaticPageData) {
  return {
    index: pageData.robots.index,
    follow: pageData.robots.follow,
  };
}

export function generateProgrammaticCanonical(pageData: ProgrammaticPageData): string | undefined {
  return pageData.canonicalUrl ?? pageData.url;
}

export function generateProgrammaticMetadata(pageData: ProgrammaticPageData): Metadata {
  const meta = pageMetadata({
    title: pageData.seoTitle,
    description: pageData.seoDescription,
    path: pageData.url,
  });

  return {
    ...meta,
    robots: generateProgrammaticRobots(pageData),
    alternates: {
      canonical: generateProgrammaticCanonical(pageData),
    },
  };
}
