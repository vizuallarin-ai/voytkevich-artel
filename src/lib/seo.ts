import type { Metadata } from "next";
import { brand } from "@/data/brand";

// Prefer explicit env var; fall back to production domain from brand config.
// The brand.website value already ends with "/", so strip the trailing slash.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  brand.website.replace(/\/$/, "");
const SITE_NAME = brand.name;
const SITE_NAME_SHORT = brand.nameShort;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — строительство домов под ключ в Иркутске`,
    template: `%s | ${SITE_NAME_SHORT}`,
  },
  description:
    "Строительство домов под ключ в Иркутске: 127 сданных объектов, фиксированная смета в договоре, фотоотчёты каждые 3 дня, гарантия до 5 лет.",
  keywords: [
    "строительство домов Иркутск",
    "дома под ключ",
    "малоэтажное строительство",
    "каркасные дома",
    "проекты домов",
    "Войткевич",
    "строительная артель",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE_NAME,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export function pageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}): Metadata {
  const url = opts.path ? `${SITE_URL}${opts.path}` : SITE_URL;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      images: opts.image ? [{ url: opts.image, width: 1200, height: 630 }] : undefined,
    },
  };
}

export { SITE_URL, SITE_NAME, SITE_NAME_SHORT };
