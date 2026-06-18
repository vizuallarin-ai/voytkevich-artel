import type { TaxonomyCombination } from "@/types/project-taxonomy";
import { lhfSeoLaunchPages, lhfSeoLaunchUrlSet } from "@/data/lhf-seo-launch";

const launchByUrl = new Map(lhfSeoLaunchPages.map((p) => [p.url, p]));

export function applyLhfSeoLaunch(combination: TaxonomyCombination): TaxonomyCombination {
  if (!lhfSeoLaunchUrlSet.has(combination.url)) return combination;

  const launch = launchByUrl.get(combination.url)!;

  return {
    ...combination,
    status: "approved",
    h1: launch.h1 ?? combination.h1,
    seoTitle: launch.seoTitle ?? combination.seoTitle,
    seoDescription: launch.seoDescription ?? combination.seoDescription,
    notes: launch.targetKeyword,
    priority: {
      ...combination.priority,
      publishPriority: "P2",
      reason: "LHF SEO launch wave 1",
    },
    indexing: {
      indexable: true,
      sitemap: true,
      canonicalUrl: combination.indexing.canonicalUrl,
    },
  };
}

export function getLhfLaunchPages() {
  return lhfSeoLaunchPages;
}
