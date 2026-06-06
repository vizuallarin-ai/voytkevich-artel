import { allCases } from "@/data/cases";
import { getCasesForProject } from "@/lib/cases";
import { RelatedCasesSection } from "./case-related";

export function ProjectRelatedCases({ projectSlug }: { projectSlug: string }) {
  const cases = getCasesForProject(allCases, projectSlug);
  if (!cases.length) return null;

  return (
    <RelatedCasesSection
      cases={cases}
      title="Похожие построенные дома"
      id="project-related-cases"
    />
  );
}
