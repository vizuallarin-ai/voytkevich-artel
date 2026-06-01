import { brand } from "@/data/brand";
import { SITE_URL } from "@/lib/seo";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: brand.name,
    description: brand.tagline,
    url: SITE_URL,
    telephone: brand.phoneDisplay,
    founder: { "@type": "Person", name: brand.founder },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Иркутск",
      addressRegion: "Иркутская область",
      addressCountry: "RU",
    },
    areaServed: "Иркутская область",
    priceRange: "$$$$",
  };
}

export function projectSchema(project: {
  name: string;
  description: string;
  price: number;
  image: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: project.name,
    description: project.description,
    image: project.image,
    offers: {
      "@type": "Offer",
      price: project.price,
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
    },
    url: `${SITE_URL}/catalog/${project.slug}`,
  };
}

export function articleSchema(post: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  author: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.datePublished,
    author: { "@type": "Person", name: post.author },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
