import type { ContentQualityScore, ProgrammaticSEOPage } from "@/types/programmatic-seo";
import { getProgrammaticSection } from "@/data/programmatic-seo-sections";

function levelFromScore(score: number): ContentQualityScore["level"] {
  if (score >= 80) return "strong";
  if (score >= 65) return "good";
  if (score >= 45) return "acceptable";
  return "poor";
}

export function calculateContentQualityScore(page: ProgrammaticSEOPage): ContentQualityScore {
  const warnings: string[] = [];
  const blockers: string[] = [];
  let score = 40;

  const section = getProgrammaticSection(page.section);
  const req = page.contentRequirements;

  if (page.targetKeyword.trim().length >= 3) score += 5;
  else blockers.push("Missing target keyword");

  if (page.h1.trim().length >= 10) score += 5;
  else blockers.push("H1 too short");

  if (page.seoDescription.trim().length >= 80) score += 5;
  else warnings.push("SEO description short");

  if (req.requiresCTA) score += 5;
  else warnings.push("CTA recommended");

  if (req.requiresFAQ) score += 5;
  else warnings.push("FAQ missing in requirements check");

  if (page.relatedPages?.length) score += 5;
  else warnings.push("No related pages linked");

  if (req.requiresRelatedProjects && page.section === "projects") {
    if (page.relatedProjects?.length) score += 5;
    else warnings.push("Related projects not assigned");
  }

  if (req.requiresLeadMagnet && page.relatedLeadMagnets?.length) score += 5;
  else if (req.requiresLeadMagnet) warnings.push("Lead magnet not linked");

  if (req.requiresDisclaimer && page.requiresDisclaimer) score += 5;
  else if (req.requiresDisclaimer) blockers.push("Disclaimer required");

  if (page.priority.cannibalizationRisk === "high") {
    score -= 20;
    blockers.push("High cannibalization risk");
  } else if (page.priority.cannibalizationRisk === "medium") {
    score -= 8;
    warnings.push("Medium cannibalization risk");
  }

  if (page.priority.uniquenessRisk === "high") {
    score -= 15;
    blockers.push("High uniqueness risk — thin or duplicate intent");
  }

  if (page.priority.searchDemand === "unknown") {
    warnings.push("Search demand unknown — validate before index");
  }

  if (page.status === "planned" || page.status === "needs-keyword-data") {
    blockers.push("Not ready for publish — planned/needs keyword data");
  }

  if (page.isFictionalAuthor && !page.requiresDisclaimer) {
    warnings.push("Fictional author should have disclaimer");
  }

  if (page.distribution.allowExternalTeasers && page.distribution.teaserRequired) {
    warnings.push("External teasers required when distribution enabled");
  }

  const publishedReady = ["approved", "published", "scheduled"].includes(page.status);
  if (publishedReady) score += 10;

  score = Math.max(0, Math.min(100, score));
  const level = levelFromScore(score);

  const canPublish = blockers.length === 0 && score >= 65 && publishedReady;
  const shouldNoindex = blockers.length > 0 || score < 45 || !publishedReady;
  const canDistributeExternally =
    canPublish &&
    page.distribution.allowExternalTeasers &&
    level !== "poor" &&
    page.distribution.platforms.length > 0;

  if (section?.qualityRequirements.minWords && req.minWords) {
    warnings.push(`Min words target: ${req.minWords} (enforced at CMS stage)`);
  }

  return {
    score,
    level,
    warnings,
    blockers,
    canPublish,
    shouldNoindex,
    canDistributeExternally,
  };
}
