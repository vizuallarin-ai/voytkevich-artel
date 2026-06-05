import type { Project } from "@/types";
import type { ServicePage } from "@/types/service-page";
import { Reveal } from "@/components/animations/reveal";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { defaultIncludesNote } from "@/data/service-pages";
import { ServiceFAQ } from "./service-faq";
import { ServiceLeadSection } from "./service-lead-section";
import { ServiceRelatedProjects } from "./service-related-projects";
import {
  ServiceAudience,
  ServiceCalculatorCTA,
  ServiceExclusions,
  ServiceHero,
  ServiceIncludes,
  ServiceIntro,
  ServicePriceFactors,
  ServiceProcess,
  ServiceRelatedLinks,
  ServiceRisks,
  ServiceSeoText,
  ServiceTrustBlock,
} from "./service-sections";

export function ServicePageTemplate({
  page,
  projects,
}: {
  page: ServicePage;
  projects: Project[];
}) {
  return (
    <div className="space-y-16 md:space-y-20">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: page.title },
        ]}
      />

      <Reveal>
        <ServiceHero page={page} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceIntro page={page} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceAudience page={page} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceIncludes page={page} note={defaultIncludesNote} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceExclusions page={page} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServicePriceFactors page={page} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceRelatedProjects page={page} projects={projects} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceCalculatorCTA page={page} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceProcess page={page} steps={page.process} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceTrustBlock />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceRisks page={page} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceFAQ page={page} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceSeoText page={page} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceRelatedLinks page={page} />
      </Reveal>

      <Reveal delay={0.05}>
        <ServiceLeadSection page={page} />
      </Reveal>
    </div>
  );
}
