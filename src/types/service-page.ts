import type { CatalogFilters, Material } from "@/types";

export type ServiceAudienceItem = {
  title: string;
  description: string;
};

export type ServiceListItem = {
  title: string;
  description?: string;
};

export type ServiceFaqItem = {
  question: string;
  answer: string;
};

export type ServiceRelatedLink = {
  label: string;
  href: string;
  description?: string;
};

export type ServiceCalculatorParams = {
  material?: Material;
  floors?: 1 | 2 | 3;
  /** Shorthand budget preset for calculator/catalog */
  budget?: "до-5-mln" | "5-8-mln" | "8-12-mln" | "12+";
  priceMax?: number;
};

export type ServicePageCta = {
  heroPrimary: string;
  heroSecondary: string;
  calculator?: string;
  catalog?: string;
  leadTitle: string;
  leadSubmit?: string;
  risks?: string;
  priceFactors?: string;
};

export type ServicePage = {
  slug: string;
  /** Short label for breadcrumbs */
  title: string;
  h1: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  serviceType: string;
  targetKeywords: string[];
  intro: string;
  audience: ServiceAudienceItem[];
  includes: ServiceListItem[];
  priceFactors: ServiceListItem[];
  /** Optional block for budget / exclusions pages */
  exclusions?: ServiceListItem[];
  exclusionsTitle?: string;
  relatedProjectFilters?: CatalogFilters;
  relatedCatalogHref?: string;
  process?: ServiceListItem[];
  risks: ServiceListItem[];
  faqs: ServiceFaqItem[];
  /** Plain text paragraphs separated by double newlines */
  seoText: string;
  relatedLinks: ServiceRelatedLink[];
  cta: ServicePageCta;
  calculatorParams?: ServiceCalculatorParams;
  quickFacts?: string[];
  schemaType: "Service";
  noindex?: boolean;
};
