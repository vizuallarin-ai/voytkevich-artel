import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nordhaus.ru";
const SITE_NAME = "NordHaus";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NordHaus — строительство домов под ключ в Иркутске",
    template: "%s | NordHaus",
  },
  description:
    "Премиальное строительство малоэтажных домов под ключ. Прозрачные сроки, фиксированная смета, архитектурный подход. Более 120 реализованных проектов.",
  keywords: [
    "строительство домов Иркутск",
    "дома под ключ",
    "малоэтажное строительство",
    "каркасные дома",
    "проекты домов",
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

export { SITE_URL, SITE_NAME };
