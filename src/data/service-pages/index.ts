import type { ServicePage } from "@/types/service-page";
import { servicePages } from "./pages-a";
import { servicePagesB } from "./pages-b";
import { servicePagesC } from "./pages-c";

export const allServicePages: ServicePage[] = [
  ...servicePages,
  ...servicePagesB,
  ...servicePagesC,
];

export const servicePageSlugs = allServicePages.map((p) => p.slug);

export function getServicePageBySlug(slug: string): ServicePage | undefined {
  return allServicePages.find((p) => p.slug === slug);
}

export function isServicePageSlug(slug: string): boolean {
  return servicePageSlugs.includes(slug);
}

export { defaultIncludesNote } from "./pages-a";
export { defaultQuickFacts, trustFacts, defaultProcessSteps } from "./shared";
