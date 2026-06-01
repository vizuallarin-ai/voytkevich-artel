import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BuiltHomesMap } from "@/components/about/built-homes-map";
import { Reveal } from "@/components/animations/reveal";
import { AnimatedCounter } from "@/components/animations/counter";
import {
  team,
  timeline,
  partners,
  builtHomes,
  companyStats,
  licenses,
} from "@/data/company";
import { pageMetadata } from "@/lib/seo";
import { brand } from "@/data/brand";

export const metadata: Metadata = pageMetadata({
  title: `О компании — ${brand.nameShort}`,
  description:
    "12 лет опыта, 127 домов, команда архитекторов и строителей. Лицензии, гарантии, карта объектов.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="container-narrow section-padding !pt-0">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "О компании" }]} />
        <Reveal>
          <p className="label-caps">О компании</p>
          <h1 className="heading-section mt-2">Архитектура и строительство в одной команде</h1>
          <p className="mt-6 max-w-3xl text-lg text-muted">
            {brand.name} — это не «типовой застройщик». Под руководством {brand.founder} мы
            проектируем и строим дома, в которых продумана каждая деталь: свет, планировка,
            материалы, инженерия.
          </p>
        </Reveal>
      </div>

      <section className="section-padding bg-muted-bg">
        <div className="container-narrow grid gap-8 md:grid-cols-4">
          {companyStats.map((s) => (
            <Reveal key={s.label}>
              <p className="font-display text-4xl">
                <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.value % 1 ? 1 : 0} />
              </p>
              <p className="mt-2 text-sm text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <h2 className="heading-section">Команда</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <Reveal key={m.name}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                  <Image src={m.image} alt={m.name} fill className="object-cover" />
                </div>
                <p className="mt-4 font-medium">{m.name}</p>
                <p className="text-sm text-muted">{m.role}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted-bg">
        <div className="container-narrow">
          <h2 className="heading-section">История</h2>
          <div className="mt-10 border-l border-graphite/20 pl-8">
            {timeline.map((t) => (
              <Reveal key={t.year} className="relative mb-10">
                <span className="absolute -left-[41px] top-1 h-3 w-3 rounded-full bg-wood" />
                <p className="font-display text-2xl text-wood">{t.year}</p>
                <p className="mt-1 text-lg font-medium">{t.title}</p>
                <p className="mt-1 text-muted">{t.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <Reveal>
            <h2 className="heading-section">Построенные дома</h2>
            <p className="mt-4 text-muted">Интерактивная карта объектов в Иркутской области</p>
          </Reveal>
          <div className="mt-10">
            <BuiltHomesMap homes={builtHomes} />
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted-bg">
        <div className="container-narrow">
          <h2 className="heading-section">Партнёры и лицензии</h2>
          <div className="mt-8 flex flex-wrap gap-8">
            {partners.map((p) => (
              <Image key={p.name} src={p.logo} alt={p.name} width={120} height={40} />
            ))}
          </div>
          <ul className="mt-8 space-y-2 text-muted">
            {licenses.map((l) => (
              <li key={l}>✓ {l}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
