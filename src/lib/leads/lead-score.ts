import type { Lead, LeadReadiness } from "@/types/lead";

export function calculateLeadScore(
  lead: Lead,
  opts?: { honeypotFilled?: boolean },
): number {
  let score = 0;

  if (lead.contact.phone) score += 20;
  if (lead.contact.name) score += 10;
  if (lead.request.type === "calculator-result") score += 20;
  if (lead.context.project?.slug) score += 15;
  if (lead.context.planner?.scenario || lead.context.planner?.rooms?.length) score += 15;
  if (lead.qualification.budget?.raw) score += 10;
  if (lead.qualification.hasLand && lead.qualification.hasLand !== "unknown") score += 10;
  if (lead.qualification.desiredArea) score += 10;
  if (lead.qualification.desiredMaterial) score += 10;
  if (lead.request.type === "lead-magnet") score += 5;
  if (lead.context.blog?.slug) score += 5;
  if (
    lead.request.selectedCTA?.toLowerCase().includes("смет") ||
    lead.request.selectedCTA?.toLowerCase().includes("расч")
  ) {
    score += 10;
  }

  const comment = lead.request.comment ?? "";
  if (/https?:\/\//i.test(comment) && comment.length < 30) score -= 10;

  if (opts?.honeypotFilled) score -= 20;

  return Math.max(0, Math.min(100, score));
}

export function scoreToReadiness(score: number): LeadReadiness {
  if (score >= 61) return "hot";
  if (score >= 31) return "warm";
  if (score > 0) return "cold";
  return "unknown";
}
