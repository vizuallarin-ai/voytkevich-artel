import type { ServicePage } from "@/types/service-page";
import { SITE_URL } from "@/lib/seo";

const MATERIAL_TO_CALC: Record<string, "brus" | "karkas" | "gazobeton" | "kirpich" | "kleeniy-brus"> = {
  брус: "brus",
  каркас: "karkas",
  газобетон: "gazobeton",
  кирпич: "kirpich",
  "клееный брус": "kleeniy-brus",
};

export function getServicePagePath(slug: string): string {
  return `/${slug}`;
}

export function buildServiceCalculatorUrl(page: ServicePage): string {
  const sp = new URLSearchParams();
  sp.set("source", "service-page");
  sp.set("service", page.slug);

  const params = page.calculatorParams;
  if (params?.material) {
    sp.set("material", MATERIAL_TO_CALC[params.material] ?? "brus");
  }
  if (params?.floors) sp.set("floors", String(params.floors));
  // TODO: calculator does not read budget presets yet — service slug is passed for analytics

  return `/calculator?${sp.toString()}`;
}

export function buildServicePlannerUrl(page: ServicePage): string {
  const sp = new URLSearchParams();
  sp.set("source", "service-page");
  sp.set("service", page.slug);
  return `/planirovka?${sp.toString()}`;
}

export function buildServiceLeadComment(page: ServicePage, selectedCta?: string): string {
  const lines = [
    `Коммерческая страница: ${page.title}`,
    `URL: ${SITE_URL}${getServicePagePath(page.slug)}`,
    `serviceSlug: ${page.slug}`,
  ];
  if (selectedCta) lines.push(`selectedCTA: ${selectedCta}`);
  return lines.join("\n");
}

export function buildServiceLeadSource(page: ServicePage): string {
  return `service-page:${page.slug}`;
}

export function buildServiceProjectCalculatorUrl(
  page: ServicePage,
  projectSlug: string,
): string {
  const base = buildServiceCalculatorUrl(page);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}project=${encodeURIComponent(projectSlug)}`;
}
