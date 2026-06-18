import Link from "next/link";
import { getLhfLaunchPages } from "@/lib/taxonomy/apply-lhf-seo-launch";

export function HomeGeoLinks() {
  const pages = getLhfLaunchPages().filter((p) => p.url.startsWith("/stroitelstvo-domov/"));

  return (
    <section className="section-padding bg-muted-bg" aria-labelledby="geo-links-title">
      <div className="container-narrow">
        <p className="label-caps">География</p>
        <h2 id="geo-links-title" className="heading-section mt-2">
          Строительство домов по городам и направлениям области
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          Подробные страницы по локациям — с проектами, расчётом и консультацией под ваш участок.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {pages.map((p) => (
            <li key={p.url}>
              <Link
                href={p.url}
                className="rounded-full border border-graphite/15 bg-background px-3 py-1.5 text-xs transition hover:border-graphite"
              >
                {p.h1 ?? p.seoTitle ?? p.targetKeyword}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
