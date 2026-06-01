import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BuiltHomesMap } from "@/components/about/built-homes-map";
import { Reveal } from "@/components/animations/reveal";
import { StatDisplay } from "@/components/animations/stat-display";
import {
  team,
  timeline,
  partners,
  builtHomes,
  companyStats,
  licenses,
} from "@/data/company";
import { aboutIntro, cta, founderBlock } from "@/data/copy";
import { pageMetadata } from "@/lib/seo";
import { brand } from "@/data/brand";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = pageMetadata({
  title: `О компании — ${brand.nameShort}`,
  description:
    "127 домов в Иркутской области, фиксированная смета, гарантия до 5 лет. Команда архитекторов и строителей под руководством Александра Войткевича.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="container-narrow section-padding !pt-0">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "О компании" }]} />
        <Reveal>
          <p className="label-caps">О компании</p>
          <h1 className="heading-section mt-2">{aboutIntro.headline}</h1>
          <p className="mt-6 max-w-3xl text-lg text-muted">{aboutIntro.lead}</p>
          <p className="mt-4 max-w-3xl text-muted">{aboutIntro.body}</p>
        </Reveal>
      </div>

      <section className="section-padding bg-muted-bg">
        <div className="container-narrow grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=1000&q=80"
                alt="Александр Войткевич — руководитель строительной артели"
                fill
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="label-caps">Основатель</p>
            <h2 className="heading-section mt-2">{founderBlock.title}</h2>
            <p className="mt-4 text-muted">{founderBlock.description}</p>
            <Button asChild className="mt-8">
              <Link href="/#lead">{cta.buildConsultation}</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow grid gap-8 md:grid-cols-4">
          {companyStats.map((s) => (
            <Reveal key={s.label}>
              <p className="font-display text-4xl">
                <StatDisplay value={s.value} suffix={s.suffix} decimals={s.decimals} />
              </p>
              <p className="mt-2 text-sm text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-padding bg-muted-bg">
        <div className="container-narrow">
          <h2 className="heading-section">Команда</h2>
          <p className="mt-4 max-w-2xl text-muted">
            На объекте работают специалисты по направлениям — от проекта до сдачи и гарантии.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

      <section className="section-padding">
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

      <section className="section-padding bg-muted-bg">
        <div className="container-narrow">
          <Reveal>
            <h2 className="heading-section">Построенные дома</h2>
            <p className="mt-4 text-muted">Объекты артели в Иркутске и Иркутской области</p>
          </Reveal>
          <div className="mt-10">
            <BuiltHomesMap homes={builtHomes} />
          </div>
        </div>
      </section>

      <section className="section-padding">
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
