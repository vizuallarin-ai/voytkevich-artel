import { allCases } from "@/data/cases";
import { getCasesForService } from "@/lib/cases";
import { RelatedCasesSection } from "./case-related";

export function ServiceRelatedCases({ serviceSlug }: { serviceSlug: string }) {
  const cases = getCasesForService(allCases, serviceSlug);
  if (!cases.length) return null;

  return (
    <RelatedCasesSection
      cases={cases}
      title="Кейсы по этой услуге"
      id="service-related-cases"
    />
  );
}
